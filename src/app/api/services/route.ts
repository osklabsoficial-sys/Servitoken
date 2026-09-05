import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getServiPerUsd } from "@/lib/ledger";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const [services, rate] = await Promise.all([
    db.service.findMany({
      where: { status: "ACTIVE" },
      orderBy: { priceServi: "asc" },
    }),
    getServiPerUsd(),
  ]);

  return NextResponse.json({ services, rateServiPerUsd: rate });
}
