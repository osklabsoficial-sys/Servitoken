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

  const [transfers, total] = await Promise.all([
    db.transfer.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
    }),
    db.transfer.count(),
  ]);

  return NextResponse.json({
    transfers: transfers.map((t) => ({
      id: t.id,
      reference: t.reference,
      senderUsername: t.sender.username,
      receiverUsername: t.receiver.username,
      amount: t.amount,
      note: t.note,
      status: t.status,
      createdAt: t.createdAt,
    })),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  });
}
