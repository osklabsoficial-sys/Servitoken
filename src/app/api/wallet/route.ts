import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getServiPerUsd, roundUsd } from "@/lib/ledger";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const wallet = await db.wallet.findUnique({ where: { userId: session.id } });
  const rate = await getServiPerUsd();
  const balance = wallet?.balance ?? 0;

  return NextResponse.json({
    balance,
    balanceFormatted: balance.toLocaleString("es-DO", { maximumFractionDigits: 2 }),
    usdEquivalent: roundUsd(balance / rate),
    rateServiPerUsd: rate,
    updatedAt: wallet?.updatedAt ?? null,
  });
}
