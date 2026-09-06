import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import {
  LedgerError,
  MIN_PURCHASE_TOKENS,
  MAX_PURCHASE_TOKENS,
  getServiPerUsd,
  roundUsd,
  validateServiAmount,
} from "@/lib/ledger";
import { createOrder, paypalConfigured } from "@/lib/paypal";

export const runtime = "nodejs";

/**
 * Crea una compra + orden de PayPal.
 * SEGURIDAD: el precio SIEMPRE se calcula en el servidor a partir
 * de la tasa configurada. Nunca se confía en montos del cliente.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED", message: "Debes iniciar sesión para comprar tokens." },
      { status: 401 }
    );
  }
  if (session.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "ACCOUNT_BLOCKED", message: "Tu cuenta no puede realizar compras." },
      { status: 403 }
    );
  }
  if (!rateLimit(clientKey(req, "create-order"), 20, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "RATE_LIMIT", message: "Demasiadas solicitudes. Espera un momento." },
      { status: 429 }
    );
  }
  if (!paypalConfigured()) {
    return NextResponse.json(
      {
        error: "PAYPAL_NOT_CONFIGURED",
        message: "La pasarela de pago no está configurada todavía. Intenta más tarde.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { tokensAmount } = (body ?? {}) as Record<string, unknown>;
  if (typeof tokensAmount !== "number") {
    return NextResponse.json(
      { error: "VALIDATION", message: "Cantidad de SERVI inválida." },
      { status: 400 }
    );
  }

  let tokens: number;
  try {
    tokens = validateServiAmount(tokensAmount, {
      min: MIN_PURCHASE_TOKENS,
      max: MAX_PURCHASE_TOKENS,
    });
  } catch (error) {
    if (error instanceof LedgerError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: 400 });
    }
    throw error;
  }

  // Precio calculado en el servidor con la tasa vigente.
  const rate = await getServiPerUsd();
  const usd = Math.max(0.01, roundUsd(tokens / rate));
  const usdFixed = usd.toFixed(2);

  // Registro de compra + orden PayPal.
  const purchase = await db.purchase.create({
    data: {
      userId: session.id,
      tokensAmount: tokens,
      usdAmount: usd,
      rateServiPerUsd: rate,
      status: "CREATED",
    },
  });

  try {
    const origin = new URL(req.url).origin;
    const order = await createOrder({
      usdAmount: usdFixed,
      referenceId: purchase.id,
      returnUrl: `${origin}/compra?paypal=return`,
      cancelUrl: `${origin}/compra?paypal=cancel`,
    });

    await db.purchase.update({
      where: { id: purchase.id },
      data: { paypalOrderId: order.orderId, status: "PENDING" },
    });

    await logAudit({
      actorId: session.id,
      action: "PURCHASE_CREATED",
      entityType: "purchase",
      entityId: purchase.id,
      metadata: { tokens, usd, rate, paypalOrderId: order.orderId },
    });

    return NextResponse.json({
      orderId: order.orderId,
      purchaseId: purchase.id,
      tokensAmount: tokens,
      usdAmount: usdFixed,
    });
  } catch (error) {
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED" },
    });
    console.error("CREATE_ORDER_ERROR", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: "PAYPAL_CREATE_ORDER_FAILED",
        message: "No se pudo iniciar el pago con PayPal. Intenta de nuevo.",
      },
      { status: 502 }
    );
  }
}
