import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged, isSameOrigin } from "@/lib/auth";
import { getServiPerUsd, SERVI_PER_USD_KEY } from "@/lib/ledger";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

/* --------------------------- Leer config --------------------------- */

export async function GET() {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const rate = await getServiPerUsd();
  return NextResponse.json({ SERVI_PER_USD: rate });
}

/* --------------------------- Actualizar ---------------------------- */

export async function PUT(req: Request) {
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

  const { SERVI_PER_USD } = (body ?? {}) as Record<string, unknown>;
  const value = typeof SERVI_PER_USD === "number" ? SERVI_PER_USD : parseFloat(String(SERVI_PER_USD));
  if (!Number.isFinite(value) || value <= 0 || value > 10_000_000) {
    return NextResponse.json(
      { error: "VALIDATION", message: "La tasa debe ser un número mayor a 0." },
      { status: 400 }
    );
  }

  await db.appConfig.upsert({
    where: { key: SERVI_PER_USD_KEY },
    update: { value: String(value) },
    create: { key: SERVI_PER_USD_KEY, value: String(value) },
  });

  await logAudit({
    actorId: session.id,
    action: "CONFIG_UPDATED",
    entityType: "app_config",
    entityId: SERVI_PER_USD_KEY,
    metadata: { SERVI_PER_USD: value },
  });

  return NextResponse.json({ ok: true, SERVI_PER_USD: value });
}
