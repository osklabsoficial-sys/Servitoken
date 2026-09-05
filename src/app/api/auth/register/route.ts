import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "register"), 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "RATE_LIMIT", message: "Demasiados intentos. Intenta más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { username, email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "VALIDATION", message: "Datos incompletos." },
      { status: 400 }
    );
  }

  const uname = username.trim().toLowerCase();
  const mail = email.trim().toLowerCase();

  if (!USERNAME_RE.test(uname)) {
    return NextResponse.json(
      {
        error: "VALIDATION",
        message:
          "El usuario debe tener 3-20 caracteres: letras minúsculas, números o guion bajo.",
      },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(mail)) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Correo electrónico inválido." },
      { status: 400 }
    );
  }
  if (!PASSWORD_RE.test(password)) {
    return NextResponse.json(
      {
        error: "VALIDATION",
        message: "La contraseña debe tener al menos 8 caracteres e incluir letras y números.",
      },
      { status: 400 }
    );
  }

  const [existingUsername, existingEmail] = await Promise.all([
    db.user.findUnique({ where: { username: uname }, select: { id: true } }),
    db.user.findUnique({ where: { email: mail }, select: { id: true } }),
  ]);
  if (existingUsername || existingEmail) {
    return NextResponse.json(
      {
        error: "EXISTS",
        message: existingUsername
          ? "Ese nombre de usuario ya está en uso."
          : "Ese correo ya está registrado.",
      },
      { status: 409 }
    );
  }

  // Bootstrap: el primer usuario registrado es SUPER_ADMIN.
  const totalUsers = await db.user.count();
  const role = totalUsers === 0 ? "SUPER_ADMIN" : "USER";

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        username: uname,
        email: mail,
        passwordHash: hashPassword(password),
        role,
      },
    });
    await tx.wallet.create({ data: { userId: created.id, balance: 0 } });
    return created;
  });

  await logAudit({
    actorId: user.id,
    action: "REGISTER",
    entityType: "user",
    entityId: user.id,
    metadata: { username: uname, role },
  });

  await createSession(user.id);

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    redirect: "/inicio",
  });
}
