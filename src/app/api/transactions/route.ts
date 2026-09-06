import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

const FILTER_TYPES: Record<string, string[]> = {
  all: [],
  purchases: ["PURCHASE"],
  sent: ["TRANSFER_SENT"],
  received: ["TRANSFER_RECEIVED"],
  services: ["SERVICE_PAYMENT"],
  adjustments: ["ADMIN_CREDIT", "ADMIN_DEBIT", "REFUND", "REVERSAL"],
};

export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const types = FILTER_TYPES[filter];
  if (!types) {
    return NextResponse.json({ error: "INVALID_FILTER" }, { status: 400 });
  }

  const where = {
    userId: session.id,
    ...(types.length > 0 ? { type: { in: types } } : {}),
  };

  const [entries, total] = await Promise.all([
    db.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.ledgerEntry.count({ where }),
  ]);

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      type: e.type,
      amount: e.amount,
      balanceAfter: e.balanceAfter,
      status: e.status,
      reference: e.reference,
      description: e.description,
      createdAt: e.createdAt,
    })),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  });
}
