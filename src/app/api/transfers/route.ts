import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import {
  LedgerError,
  executeTransfer,
  validateServiAmount,
} from "@/lib/ledger";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

const REFERENCE_RE = /^[A-Za-z0-9_-]{8,64}$/;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED", message: "Debes iniciar sesión." },
      { status: 401 }
    );
  }
  if (session.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "ACCOUNT_BLOCKED", message: "Tu cuenta no puede realizar operaciones." },
      { status: 403 }
    );
  }
  if (!rateLimit(clientKey(req, "transfer"), 15, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "RATE_LIMIT", message: "Demasiadas operaciones. Espera un momento." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { recipient, amount, note, idempotencyKey } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof recipient !== "string" ||
    typeof amount !== "number" ||
    typeof idempotencyKey !== "string" ||
    !REFERENCE_RE.test(idempotencyKey)
  ) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Datos de la transferencia inválidos." },
      { status: 400 }
    );
  }
  if (note !== undefined && note !== null && (typeof note !== "string" || note.length > 200)) {
    return NextResponse.json(
      { error: "VALIDATION", message: "La nota no puede superar 200 caracteres." },
      { status: 400 }
    );
  }

  let tokens: number;
  try {
    tokens = validateServiAmount(amount);
  } catch (error) {
    if (error instanceof LedgerError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: 400 });
    }
    throw error;
  }

  // Resolver destinatario: username o email exacto.
  const recipientKey = recipient.trim().toLowerCase();
  const target = recipientKey.includes("@")
    ? await db.user.findUnique({ where: { email: recipientKey } })
    : await db.user.findUnique({ where: { username: recipientKey } });

  if (!target) {
    return NextResponse.json(
      { error: "RECIPIENT_NOT_FOUND", message: "El destinatario no existe." },
      { status: 404 }
    );
  }
  if (target.id === session.id) {
    return NextResponse.json(
      { error: "SELF_TRANSFER", message: "No puedes enviarte SERVI a ti mismo." },
      { status: 400 }
    );
  }
  if (target.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "RECIPIENT_INACTIVE", message: "El destinatario no puede recibir SERVI actualmente." },
      { status: 400 }
    );
  }

  try {
    const result = await executeTransfer({
      reference: idempotencyKey,
      senderId: session.id,
      receiverId: target.id,
      amount: tokens,
      note: typeof note === "string" && note.trim() ? note.trim() : null,
    });

    if (!result.duplicated) {
      await logAudit({
        actorId: session.id,
        action: "TRANSFER",
        entityType: "transfer",
        entityId: result.transfer.id,
        metadata: { to: target.username, amount: tokens, reference: result.transfer.reference },
      });
    }

    return NextResponse.json({
      duplicated: result.duplicated,
      transfer: {
        reference: result.transfer.reference,
        amount: result.transfer.amount,
        receiverUsername: target.username,
        createdAt: result.transfer.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof LedgerError) {
      const status = error.code === "INSUFFICIENT_FUNDS" ? 400 : 500;
      return NextResponse.json({ error: error.code, message: error.message }, { status });
    }
    console.error("TRANSFER_ERROR", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "TRANSFER_FAILED", message: "No se pudo completar la transferencia." },
      { status: 500 }
    );
  }
}
