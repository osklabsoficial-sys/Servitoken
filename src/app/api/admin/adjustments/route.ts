import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { LedgerError, executeAdminAdjustment, roundServi } from "@/lib/ledger";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

/* --------------------------- Listado --------------------------- */

export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const [adjustments, total] = await Promise.all([
    db.adminAdjustment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        admin: { select: { username: true } },
        target: { select: { username: true, email: true } },
      },
    }),
    db.adminAdjustment.count(),
  ]);

  return NextResponse.json({
    adjustments: adjustments.map((a) => ({
      id: a.id,
      operation: a.operation,
      amount: a.amount,
      balanceBefore: a.balanceBefore,
      balanceAfter: a.balanceAfter,
      reason: a.reason,
      createdAt: a.createdAt,
      adminUsername: a.admin.username,
      targetUsername: a.target.username,
      targetEmail: a.target.email,
    })),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  });
}

/* ------------------------ Crear ajuste ------------------------- */

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "admin-adjust"), 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { targetUserId, operation, amount, reason } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof targetUserId !== "string" ||
    (operation !== "CREDIT" && operation !== "DEBIT") ||
    typeof amount !== "number" ||
    typeof reason !== "string"
  ) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Datos del ajuste incompletos." },
      { status: 400 }
    );
  }

  const rounded = roundServi(amount);
  if (!Number.isFinite(rounded) || rounded <= 0 || rounded !== amount || rounded > 10_000_000) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Cantidad inválida (máximo 2 decimales)." },
      { status: 400 }
    );
  }
  if (reason.trim().length < 5) {
    return NextResponse.json(
      { error: "VALIDATION", message: "El motivo es obligatorio (mínimo 5 caracteres)." },
      { status: 400 }
    );
  }

  const target = await db.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Usuario no encontrado." }, { status: 404 });
  }

  try {
    const adjustment = await executeAdminAdjustment({
      adminId: session.id,
      targetUserId,
      operation,
      amount: rounded,
      reason: reason.trim(),
    });

    await logAudit({
      actorId: session.id,
      action: "ADMIN_ADJUSTMENT",
      entityType: "admin_adjustment",
      entityId: adjustment.id,
      metadata: {
        operation,
        amount: rounded,
        target: target.username,
        balanceBefore: adjustment.balanceBefore,
        balanceAfter: adjustment.balanceAfter,
      },
    });

    return NextResponse.json({ ok: true, adjustment });
  } catch (error) {
    if (error instanceof LedgerError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: 400 });
    }
    console.error("ADMIN_ADJUST_ERROR", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "ADJUST_FAILED", message: "No se pudo completar el ajuste." },
      { status: 500 }
    );
  }
}
