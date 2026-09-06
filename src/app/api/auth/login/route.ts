import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, isSameOrigin, verifyPassword } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  const ipKey = clientKey(req, "login");
  if (!rateLimit(ipKey, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "RATE_LIMIT", message: "Demasiados intentos. Espera unos minutos." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { identifier, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof identifier !== "string" || typeof password !== "string" || !identifier || !password) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Introduce tu usuario/correo y contraseña." },
      { status: 400 }
    );
  }

  const id = identifier.trim().toLowerCase();
  const user = await db.user.findFirst({
    where: { OR: [{ username: id }, { email: id }] },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    await logAudit({ action: "LOGIN_FAILED", metadata: { identifier: id.slice(0, 64) } });
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "Usuario o contraseña incorrectos." },
      { status: 401 }
    );
  }

  if (user.status === "BLOCKED") {
    await logAudit({
      action: "LOGIN_BLOCKED",
      actorId: user.id,
      entityType: "user",
      entityId: user.id,
    });
    return NextResponse.json(
      {
        error: "BLOCKED",
        message:
          "Tu cuenta está bloqueada. Contacta al soporte de ServiToken para más información.",
      },
      { status: 403 }
    );
  }
  if (user.status === "SUSPENDED") {
    return NextResponse.json(
      { error: "SUSPENDED", message: "Tu cuenta está suspendida temporalmente." },
      { status: 403 }
    );
  }

  await createSession(user.id);
  await logAudit({
    actorId: user.id,
    action: "LOGIN",
    entityType: "user",
    entityId: user.id,
  });

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    redirect: "/inicio",
  });
}
