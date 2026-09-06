import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged, isSameOrigin } from "@/lib/auth";
import { roundServi } from "@/lib/ledger";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { name, description, priceServi, status } = (body ?? {}) as Record<string, unknown>;

  const service = await db.service.findUnique({ where: { id } });
  if (!service) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const data: { name?: string; description?: string; priceServi?: number; status?: string } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ error: "VALIDATION", message: "Nombre inválido." }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (description !== undefined) {
    if (typeof description !== "string") {
      return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
    }
    data.description = description.trim();
  }
  if (priceServi !== undefined) {
    const price = roundServi(priceServi);
    if (typeof priceServi !== "number" || !Number.isFinite(price) || price <= 0 || price !== priceServi) {
      return NextResponse.json(
        { error: "VALIDATION", message: "Precio inválido (máximo 2 decimales)." },
        { status: 400 }
      );
    }
    data.priceServi = price;
  }
  if (status !== undefined) {
    if (status !== "ACTIVE" && status !== "INACTIVE") {
      return NextResponse.json({ error: "VALIDATION", message: "Estado inválido." }, { status: 400 });
    }
    data.status = status;
  }

  const updated = await db.service.update({ where: { id }, data });

  await logAudit({
    actorId: session.id,
    action: "SERVICE_UPDATED",
    entityType: "service",
    entityId: id,
    metadata: data as Record<string, unknown>,
  });

  return NextResponse.json({ ok: true, service: updated });
}
