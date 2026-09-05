import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { creditPurchaseOnce } from "@/lib/ledger";
import { extractCapture, getOrder, verifyWebhookSignature } from "@/lib/paypal";

export const runtime = "nodejs";

/**
 * Webhook de PayPal.
 * - Registra TODO evento entrante con su ID único (idempotencia).
 * - Verifica autenticidad: firma oficial si PAYPAL_WEBHOOK_ID está
 *   configurado; si no, verifica cada evento consultando la API de
 *   PayPal directamente (nunca confía en el payload crudo).
 * - La acreditación final es idempotente (claim atómico + capture
 *   ID único), por lo que reenvíos del mismo evento no duplican saldo.
 */

interface WebhookEventShape {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { value?: string; currency_code?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
}

const PROCESSED_EVENT_TYPES = new Set([
  "PAYMENT.CAPTURE.COMPLETED",
  "CHECKOUT.ORDER.APPROVED",
  "CHECKOUT.ORDER.COMPLETED",
]);

export async function POST(req: Request) {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  let event: WebhookEventShape;
  try {
    event = JSON.parse(raw) as WebhookEventShape;
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const eventId = typeof event.id === "string" ? event.id : null;
  const eventType = typeof event.event_type === "string" ? event.event_type : "UNKNOWN";
  if (!eventId) {
    return NextResponse.json({ error: "INVALID_EVENT" }, { status: 400 });
  }

  // --- Idempotencia: registrar el evento (event ID único). ---
  let record;
  try {
    record = await db.paypalWebhookEvent.create({
      data: {
        eventId,
        eventType,
        resourceId: event.resource?.id ?? null,
        payload: raw.slice(0, 60000),
        status: "RECEIVED",
      },
    });
  } catch (error) {
    const isDup =
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002";
    if (isDup) {
      return NextResponse.json({ status: "DUPLICATE" }, { status: 200 });
    }
    throw error;
  }

  await logAudit({
    action: "WEBHOOK_RECEIVED",
    entityType: "paypal_webhook",
    entityId: eventId,
    metadata: { eventType },
  });

  // --- Verificación de autenticidad. ---
  let signatureValid: boolean | null = null;
  try {
    signatureValid = await verifyWebhookSignature(req.headers, raw);
  } catch (error) {
    console.error("WEBHOOK_VERIFY_ERROR", error instanceof Error ? error.message : error);
    signatureValid = false;
  }

  if (signatureValid === false) {
    await db.paypalWebhookEvent.update({
      where: { id: record.id },
      data: { status: "IGNORED" },
    });
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  // --- Solo procesamos eventos relevantes. ---
  if (!PROCESSED_EVENT_TYPES.has(eventType)) {
    await db.paypalWebhookEvent.update({
      where: { id: record.id },
      data: { status: "IGNORED" },
    });
    return NextResponse.json({ status: "IGNORED" }, { status: 200 });
  }

  try {
    // Resolver el order ID según el tipo de evento.
    const orderId =
      event.resource?.supplementary_data?.related_ids?.order_id ??
      (eventType.startsWith("CHECKOUT.ORDER") ? event.resource?.id : undefined);

    if (!orderId) {
      await db.paypalWebhookEvent.update({
        where: { id: record.id },
        data: { status: "IGNORED" },
      });
      return NextResponse.json({ status: "IGNORED" }, { status: 200 });
    }

    const purchase = await db.purchase.findUnique({ where: { paypalOrderId: orderId } });
    if (!purchase) {
      await db.paypalWebhookEvent.update({
        where: { id: record.id },
        data: { status: "IGNORED" },
      });
      return NextResponse.json({ status: "IGNORED" }, { status: 200 });
    }

    // Verificación autoritativa: consultar SIEMPRE la orden a PayPal.
    const fetched = await getOrder(orderId);
    if (!fetched.ok) {
      await db.paypalWebhookEvent.update({
        where: { id: record.id },
        data: { status: "RECEIVED" }, // PayPal reintentará
      });
      return NextResponse.json({ status: "PENDING_VERIFICATION" }, { status: 200 });
    }

    const info = extractCapture(fetched.order);
    if (info.orderStatus !== "COMPLETED" || info.captureStatus !== "COMPLETED") {
      await db.paypalWebhookEvent.update({
        where: { id: record.id },
        data: { status: "IGNORED" },
      });
      return NextResponse.json({ status: "NOT_COMPLETED" }, { status: 200 });
    }

    // Validar monto contra lo calculado por el servidor.
    const amountOk =
      info.amount !== null &&
      Math.abs(purchase.usdAmount - parseFloat(info.amount)) < 0.01 &&
      info.currency === "USD";
    if (!amountOk) {
      await db.paypalWebhookEvent.update({
        where: { id: record.id },
        data: { status: "FAILED" },
      });
      console.error("WEBHOOK_AMOUNT_MISMATCH", purchase.id, purchase.usdAmount, info.amount);
      return NextResponse.json({ status: "AMOUNT_MISMATCH" }, { status: 200 });
    }

    // Registrar pago (capture ID único → protección extra contra duplicados).
    try {
      await db.paypalPayment.upsert({
        where: { paypalOrderId: orderId },
        create: {
          purchaseId: purchase.id,
          paypalOrderId: orderId,
          paypalCaptureId: info.captureId,
          status: "COMPLETED",
          amountUsd: purchase.usdAmount,
          currency: "USD",
          payerEmail: info.payerEmail,
          payerName: info.payerName,
          rawPayload: JSON.stringify(fetched.order ?? {}).slice(0, 20000),
        },
        update: {
          paypalCaptureId: info.captureId ?? undefined,
          status: "COMPLETED",
        },
      });
    } catch (error) {
      const isDup =
        typeof error === "object" &&
        error !== null &&
        (error as { code?: string }).code === "P2002";
      if (isDup) {
        await db.paypalWebhookEvent.update({
          where: { id: record.id },
          data: { status: "DUPLICATE" },
        });
        return NextResponse.json({ status: "DUPLICATE" }, { status: 200 });
      }
      throw error;
    }

    // Acreditación idempotente.
    const result = await creditPurchaseOnce(purchase.id);

    await db.paypalWebhookEvent.update({
      where: { id: record.id },
      data: { status: "PROCESSED" },
    });

    if (result.credited) {
      await logAudit({
        action: "SERVI_CREDITED",
        entityType: "purchase",
        entityId: purchase.id,
        metadata: { via: "webhook", amount: purchase.tokensAmount, eventId },
      });
    }

    return NextResponse.json({ status: "PROCESSED" }, { status: 200 });
  } catch (error) {
    await db.paypalWebhookEvent.update({
      where: { id: record.id },
      data: { status: "FAILED" },
    }).catch(() => {});
    console.error("WEBHOOK_PROCESS_ERROR", error instanceof Error ? error.message : error);
    // 500 → PayPal reintentará el evento más tarde.
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}
