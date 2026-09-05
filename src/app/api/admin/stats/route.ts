import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const [totalUsers, activeUsers, blockedUsers, walletAgg, purchaseAgg, transferAgg, serviceAgg, pendingPurchases, recentAudit] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: "ACTIVE" } }),
      db.user.count({ where: { status: { in: ["BLOCKED", "SUSPENDED"] } } }),
      db.wallet.aggregate({ _sum: { balance: true } }),
      db.purchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { usdAmount: true, tokensAmount: true },
        _count: true,
      }),
      db.transfer.aggregate({ _sum: { amount: true }, _count: true }),
      db.servicePayment.aggregate({ _sum: { priceServi: true }, _count: true }),
      db.purchase.count({ where: { status: { in: ["CREATED", "PENDING", "APPROVED"] } } }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { actor: { select: { username: true } } },
      }),
    ]);

  return NextResponse.json({
    users: { total: totalUsers, active: activeUsers, blocked: blockedUsers },
    totalBalance: walletAgg._sum.balance ?? 0,
    purchases: {
      count: purchaseAgg._count,
      usdTotal: purchaseAgg._sum.usdAmount ?? 0,
      tokensTotal: purchaseAgg._sum.tokensAmount ?? 0,
      pending: pendingPurchases,
    },
    transfers: { count: transferAgg._count, tokensTotal: transferAgg._sum.amount ?? 0 },
    servicePayments: { count: serviceAgg._count, tokensTotal: serviceAgg._sum.priceServi ?? 0 },
    recentAudit: recentAudit.map((a) => ({
      id: a.id,
      action: a.action,
      actor: a.actor?.username ?? null,
      entityId: a.entityId,
      createdAt: a.createdAt,
    })),
  });
}
