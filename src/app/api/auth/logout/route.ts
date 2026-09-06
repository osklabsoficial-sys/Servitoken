import { NextResponse } from "next/server";
import { destroySession, getSessionUser, isSameOrigin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await logAudit({
      actorId: user.id,
      action: "LOGOUT",
      entityType: "user",
      entityId: user.id,
    });
  }
  return NextResponse.json({ ok: true });
}
