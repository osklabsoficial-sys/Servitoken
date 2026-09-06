import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged, isSameOrigin } from "@/lib/auth";
import { roundServi } from "@/lib/ledger";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9-]{2,40}$/;

export async function GET() {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const services = await db.service.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { payments: true } } },
  });

  return NextResponse.json({
    services: services.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      priceServi: s.priceServi,
      icon: s.icon,
      status: s.status,
      paymentsCount: s._count.payments,
      createdAt: s.createdAt,
    })),
  });
}

export async function POST(req: Request) {
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

  const { slug, name, description, priceServi } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof slug !== "string" ||
    !SLUG_RE.test(slug) ||
    typeof name !== "string" ||
    name.trim().length < 3 ||
    typeof description !== "string" ||
    typeof priceServi !== "number"
  ) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Datos del servicio inválidos." },
      { status: 400 }
    );
  }
  const price = roundServi(priceServi);
  if (!Number.isFinite(price) || price <= 0 || price !== priceServi) {
    return NextResponse.json(
      { error: "VALIDATION", message: "El precio admite máximo 2 decimales y debe ser mayor a 0." },
      { status: 400 }
    );
  }

  const exists = await db.service.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json(
      { error: "EXISTS", message: "Ya existe un servicio con ese slug." },
      { status: 409 }
    );
  }

  const service = await db.service.create({
    data: { slug, name: name.trim(), description: description.trim(), priceServi: price },
  });

  await logAudit({
    actorId: session.id,
    action: "SERVICE_CREATED",
    entityType: "service",
    entityId: service.id,
    metadata: { slug, price },
  });

  return NextResponse.json({ ok: true, service });
}
