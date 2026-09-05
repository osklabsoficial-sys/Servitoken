import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged, isSameOrigin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

/* ------------------------- Lista de usuarios ------------------------- */

export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const where = q
    ? { OR: [{ username: { contains: q } }, { email: { contains: q } }] }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        wallet: { select: { balance: true } },
        _count: { select: { purchases: true, transfersSent: true, servicePayments: true, ledgerEntries: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      status: u.status,
      balance: u.wallet?.balance ?? 0,
      createdAt: u.createdAt,
      counts: {
        purchases: u._count.purchases,
        transfersSent: u._count.transfersSent,
        servicePayments: u._count.servicePayments,
        ledgerEntries: u._count.ledgerEntries,
      },
    })),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  });
}

/* --------------------- Bloquear / desbloquear ------------------------ */

export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { userId, status } = (body ?? {}) as Record<string, unknown>;
  if (typeof userId !== "string" || typeof status !== "string") {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
  }
  if (!["ACTIVE", "BLOCKED", "SUSPENDED"].includes(status)) {
    return NextResponse.json({ error: "VALIDATION", message: "Estado inválido." }, { status: 400 });
  }
  if (userId === session.id) {
    return NextResponse.json(
      { error: "SELF_ACTION", message: "No puedes cambiar tu propio estado." },
      { status: 400 }
    );
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  // Solo SUPER_ADMIN puede modificar administradores.
  if (isPrivileged(target.role) && session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN", message: "Solo un SUPER_ADMIN puede modificar administradores." }, { status: 403 });
  }

  await db.user.update({ where: { id: userId }, data: { status } });

  await logAudit({
    actorId: session.id,
    action: status === "BLOCKED" ? "USER_BLOCKED" : "USER_UNBLOCKED",
    entityType: "user",
    entityId: userId,
    metadata: { status, username: target.username },
  });

  return NextResponse.json({ ok: true, status });
}
