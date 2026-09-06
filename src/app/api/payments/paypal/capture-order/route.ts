import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { creditPurchaseOnce } from "@/lib/ledger";
import { captureOrder, extractCapture, getOrder } from "@/lib/paypal";

export const runtime = "nodejs";

const moneyEq = (a: number, b: string | null) =>
  b !== null && Math.abs(a - parseFloat(b)) < 0.01;

/**
 * Captura la orden de PayPal.
 * SEGURIDAD: nunca se acredita saldo porque el frontend diga que
 * pagó — SIEMPRE se confirma el estado directamente contra la API
 * de PayPal, se valida monto/moneda y la acreditación es idempotente
 * (unique capture ID + claim atómico de la compra).
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (!rateLimit(clientKey(req, "capture-order"), 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  const { orderId } = (body ?? {}) as Record<string, unknown>;
  if (typeof orderId !== "string" || orderId.length < 5 || orderId.length > 64) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
  }

  // La orden debe existir y pertenecer al usuario autenticado.
  const purchase = await db.purchase.findFirst({
    where: { paypalOrderId: orderId, userId: session.id },
  });
  if (!purchase) {
    return NextResponse.json(
      { error: "ORDER_NOT_FOUND", message: "Orden no encontrada." },
      { status: 404 }
    );
  }

  if (purchase.status === "COMPLETED") {
    return NextResponse.json({
      status: "COMPLETED",
      credited: false,
      tokensAmount: purchase.tokensAmount,
      message: "Esta compra ya fue acreditada anteriormente.",
    });
  }
  if (purchase.status === "REFUNDED" || purchase.status === "CANCELLED") {
    return NextResponse.json(
      { error: "ORDER_CLOSED", message: "La orden ya no puede procesarse." },
      { status: 409 }
    );
  }

  /* ---------------- Captura contra la API de PayPal ---------------- */

  let capture = await captureOrder(orderId);

  // Si ya fue capturada antes (reintento), consultamos la orden.
  if (!capture.ok && capture.issue === "ORDER_ALREADY_CAPTURED") {
    capture = { ...capture, ok: true, issue: null };
  }

  if (!capture.ok) {
    const declined = capture.issue === "INSTRUMENT_DECLINED";
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED" },
    });
    console.error(
      "PAYPAL_CAPTURE_ERROR",
      capture.httpStatus,
      capture.issue,
      JSON.stringify(capture.order ?? {}).slice(0, 400)
    );
    return NextResponse.json(
      {
        error: "CAPTURE_FAILED",
        message: declined
          ? "Tu método de pago fue rechazado por PayPal. Puedes intentar con otro."
          : "No se pudo confirmar el pago. Verifica en tu cuenta de PayPal.",
      },
      { status: 402 }
    );
  }

  const info = extractCapture(capture.order);

  if (info.orderStatus !== "COMPLETED" || info.captureStatus !== "COMPLETED") {
    return NextResponse.json(
      {
        error: "PAYMENT_NOT_COMPLETED",
        message: `El pago no fue completado (estado: ${info.orderStatus ?? "desconocido"}).`,
      },
      { status: 409 }
    );
  }

  // Validar monto y moneda contra lo que el SERVIDOR calculó.
  if (info.currency !== "USD" || !moneyEq(purchase.usdAmount, info.amount)) {
    await db.purchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
    console.error(
      "PAYPAL_AMOUNT_MISMATCH",
      purchase.id,
      purchase.usdAmount,
      info.amount,
      info.currency
    );
    return NextResponse.json(
      { error: "AMOUNT_MISMATCH", message: "El monto pagado no coincide con la compra." },
      { status: 409 }
    );
  }

  /* ---------------- Registro del pago (capture ID único) ---------------- */

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
        rawPayload: JSON.stringify(capture.order ?? {}).slice(0, 20000),
      },
      update: {
        paypalCaptureId: info.captureId ?? undefined,
        status: "COMPLETED",
        rawPayload: JSON.stringify(capture.order ?? {}).slice(0, 20000),
      },
    });
  } catch (error) {
    // Capture ID duplicado → este pago ya fue registrado/acreditado.
    const isDup =
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002";
    if (isDup) {
      return NextResponse.json({
        status: "COMPLETED",
        credited: false,
        tokensAmount: purchase.tokensAmount,
        message: "Este pago ya fue procesado anteriormente.",
      });
    }
    throw error;
  }

  /* ---------------- Acreditación idempotente ---------------- */

  const result = await creditPurchaseOnce(purchase.id);

  if (result.credited) {
    await logAudit({
      actorId: session.id,
      action: "PAYPAL_CAPTURE_COMPLETED",
      entityType: "purchase",
      entityId: purchase.id,
      metadata: {
        tokens: purchase.tokensAmount,
        usd: purchase.usdAmount,
        captureId: info.captureId,
      },
    });
    await logAudit({
      actorId: session.id,
      action: "SERVI_CREDITED",
      entityType: "user",
      entityId: session.id,
      metadata: { purchaseId: purchase.id, amount: purchase.tokensAmount },
    });
  }

  return NextResponse.json({
    status: "COMPLETED",
    credited: result.credited,
    tokensAmount: purchase.tokensAmount,
    reference: purchase.id,
  });
}
