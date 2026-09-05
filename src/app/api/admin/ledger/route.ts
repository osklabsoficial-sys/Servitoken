import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged } from "@/lib/auth";

export const runtime = "nodejs";

const PAGE_SIZE = 30;

const TYPE_FILTERS: Record<string, string[]> = {
  all: [],
  purchases: ["PURCHASE"],
  transfers: ["TRANSFER_SENT", "TRANSFER_RECEIVED"],
  services: ["SERVICE_PAYMENT"],
  adjustments: ["ADMIN_CREDIT", "ADMIN_DEBIT", "REFUND", "REVERSAL"],
};

export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const types = TYPE_FILTERS[filter];
  if (!types) return NextResponse.json({ error: "INVALID_FILTER" }, { status: 400 });

  const where = types.length > 0 ? { type: { in: types } } : {};

  const [entries, total] = await Promise.all([
    db.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { username: true } } },
    }),
    db.ledgerEntry.count({ where }),
  ]);

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      username: e.user.username,
      type: e.type,
      amount: e.amount,
      balanceBefore: e.balanceBefore,
      balanceAfter: e.balanceAfter,
      reference: e.reference,
      description: e.description,
      createdAt: e.createdAt,
    })),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  });
}
