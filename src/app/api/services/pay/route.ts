import { NextResponse } from "next/server";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { LedgerError, payService } from "@/lib/ledger";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

const REFERENCE_RE = /^[A-Za-z0-9_-]{8,64}$/;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (session.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "ACCOUNT_BLOCKED", message: "Tu cuenta no puede realizar pagos." },
      { status: 403 }
    );
  }
  if (!rateLimit(clientKey(req, "service-pay"), 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { serviceId, idempotencyKey } = (body ?? {}) as Record<string, unknown>;
  if (typeof serviceId !== "string" || !serviceId || typeof idempotencyKey !== "string" || !REFERENCE_RE.test(idempotencyKey)) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await payService({
      reference: idempotencyKey,
      userId: session.id,
      serviceId,
    });

    if (!result.duplicated) {
      await logAudit({
        actorId: session.id,
        action: "SERVICE_PAYMENT",
        entityType: "service_payment",
        entityId: result.payment.id,
        metadata: { service: result.payment.serviceName, amount: result.payment.priceServi },
      });
    }

    return NextResponse.json({
      duplicated: result.duplicated,
      payment: {
        serviceName: result.payment.serviceName,
        priceServi: result.payment.priceServi,
        createdAt: result.payment.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof LedgerError) {
      const status =
        error.code === "INSUFFICIENT_FUNDS"
          ? 400
          : error.code === "SERVICE_UNAVAILABLE"
            ? 404
            : 500;
      return NextResponse.json({ error: error.code, message: error.message }, { status });
    }
    console.error("SERVICE_PAY_ERROR", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "SERVICE_PAY_FAILED", message: "No se pudo completar el pago." },
      { status: 500 }
    );
  }
}
