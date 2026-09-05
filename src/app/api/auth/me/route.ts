import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged } from "@/lib/auth";
import { getServiPerUsd } from "@/lib/ledger";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const [wallet, rate] = await Promise.all([
    db.wallet.findUnique({ where: { userId: session.id } }),
    getServiPerUsd(),
  ]);

  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      email: session.email,
      role: session.role,
      status: session.status,
      isAdmin: isPrivileged(session.role),
    },
    balance: wallet?.balance ?? 0,
    rateServiPerUsd: rate,
  });
}
