import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const code = searchParams.get("code");

  // Track click on referral link
  if (code && !wallet) {
    try {
      await db.referral.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
      const ref = await db.referral.findUnique({ where: { code } });
      return NextResponse.json({ found: !!ref });
    } catch {
      return NextResponse.json({ found: false });
    }
  }

  if (!wallet) {
    return NextResponse.json({ error: "wallet param required" }, { status: 400 });
  }

  const addr = wallet.toLowerCase();

  // Find or create referral for this wallet
  let referral = await db.referral.findUnique({
    where: { referrer: addr },
  });

  if (!referral) {
    const codeStr = addr.slice(2, 8).toUpperCase();
    referral = await db.referral.create({
      data: {
        code: codeStr,
        referrer: addr,
      },
    });
  }

  // Get leaderboard (top 20)
  const leaderboard = await db.referral.findMany({
    orderBy: { clicks: "desc" },
    take: 20,
  });

  // Find user rank
  const userRank =
    (await db.referral.count({
      where: { clicks: { gt: referral.clicks } },
    })) + 1;

  return NextResponse.json({
    code: referral.code,
    clicks: referral.clicks,
    rank: userRank,
    leaderboard: leaderboard.map((r) => ({
      code: r.code,
      clicks: r.clicks,
      isYou: r.referrer.toLowerCase() === addr,
    })),
  });
}
