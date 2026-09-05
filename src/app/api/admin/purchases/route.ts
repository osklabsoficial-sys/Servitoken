import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged } from "@/lib/auth";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const [purchases, total] = await Promise.all([
    db.purchase.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { username: true, email: true } },
        paypalPayment: {
          select: { paypalCaptureId: true, payerEmail: true },
        },
      },
    }),
    db.purchase.count(),
  ]);

  return NextResponse.json({
    purchases: purchases.map((p) => ({
      id: p.id,
      username: p.user.username,
      email: p.user.email,
      tokensAmount: p.tokensAmount,
      usdAmount: p.usdAmount,
      status: p.status,
      paypalOrderId: p.paypalOrderId,
      paypalCaptureId: p.paypalPayment?.paypalCaptureId ?? null,
      creditedAt: p.creditedAt,
      createdAt: p.createdAt,
    })),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  });
}
