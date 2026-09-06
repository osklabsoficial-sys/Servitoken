import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Búsqueda de destinatarios para /enviar.
 * Privacidad: solo devuelve el username (nunca el email).
 */
export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (!rateLimit(clientKey(req, "user-search"), 60, 60 * 1000)) {
    return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  let users: { username: string }[] = [];

  if (q.includes("@")) {
    const email = q.replace(/^@/, "");
    const found = await db.user.findUnique({
      where: { email },
      select: { username: true },
    });
    if (found) users = [found];
  } else {
    const username = q.replace(/^@/, "");
    users = await db.user.findMany({
      where: {
        username: { contains: username },
        status: "ACTIVE",
      },
      select: { username: true },
      orderBy: { username: "asc" },
      take: 8,
    });
  }

  return NextResponse.json({
    users: users.map((u) => ({ username: u.username, isSelf: u.username === session.username })),
  });
}
