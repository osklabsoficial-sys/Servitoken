import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isPrivileged } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * ============================================================
 *  ANALYTICS DE VISITAS · GET /api/admin/visits
 * ============================================================
 *  Solo ADMIN/SUPER_ADMIN. Devuelve:
 *   - totales: hoy, 7d, 30d, todos, visitantes únicos 7d
 *   - topPaths: rutas más visitadas (30d)
 *   - series: visitas por día (últimos 14 días)
 *   - recent: últimas 15 visitas con username resuelto
 * ============================================================
 */

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const now = new Date();
  const today = startOfDay(now);
  const d7 = new Date(now.getTime() - 7 * 86_400_000);
  const d30 = new Date(now.getTime() - 30 * 86_400_000);
  const d14 = new Date(now.getTime() - 13 * 86_400_000);

  const [totalAll, todayCount, d7Count, d30Count, uniqueRows, topPathsRows, since14, recentRows] =
    await Promise.all([
      db.pageVisit.count(),
      db.pageVisit.count({ where: { createdAt: { gte: today } } }),
      db.pageVisit.count({ where: { createdAt: { gte: d7 } } }),
      db.pageVisit.count({ where: { createdAt: { gte: d30 } } }),
      db.pageVisit.findMany({
        where: { createdAt: { gte: d7 } },
        distinct: ["visitorKey"],
        select: { visitorKey: true },
      }),
      db.pageVisit.groupBy({
        by: ["path"],
        where: { createdAt: { gte: d30 } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      // Serie diaria: se agrupa en JS (SQLite no trunca fechas en groupBy).
      db.pageVisit.findMany({
        where: { createdAt: { gte: d14 } },
        select: { createdAt: true },
        take: 20_000,
        orderBy: { createdAt: "asc" },
      }),
      db.pageVisit.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: { id: true, path: true, userId: true, referrer: true, createdAt: true },
      }),
    ]);

  // Serie de 14 días (incluye hoy; días sin visitas = 0).
  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const day = startOfDay(new Date(now.getTime() - i * 86_400_000));
    buckets.set(day.toISOString().slice(0, 10), 0);
  }
  for (const v of since14) {
    const key = startOfDay(v.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const series = [...buckets.entries()].map(([date, count]) => ({ date, count }));

  // Resolver usernames de visitas recientes (sin relación en schema).
  const userIds = [...new Set(recentRows.map((r) => r.userId).filter((x): x is string => !!x))];
  const users = userIds.length
    ? await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true },
      })
    : [];
  const uname = new Map(users.map((u) => [u.id, u.username]));

  return NextResponse.json({
    totals: {
      all: totalAll,
      today: todayCount,
      d7: d7Count,
      d30: d30Count,
      unique7d: uniqueRows.length,
    },
    topPaths: topPathsRows.map((r) => ({ path: r.path, count: r._count._all })),
    series,
    recent: recentRows.map((r) => ({
      id: r.id,
      path: r.path,
      username: r.userId ? (uname.get(r.userId) ?? null) : null,
      referrer: r.referrer,
      createdAt: r.createdAt,
    })),
  });
}
