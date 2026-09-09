import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { hashPassword, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * ============================================================
 *  RUTA SECRETA · POST /api/crear/admin
 * ============================================================
 *  Creación de cuentas SUPER_ADMIN protegida por PIN.
 *
 *  Flujo:
 *    1. { action: "verify-pin", pin }          → valida el PIN
 *    2. { action: "create", pin, username,
 *         email, password }                    → crea la cuenta
 *
 *  Defensas (el PIN es de 4 dígitos, así que el límite de
 *  intentos es la defensa real contra fuerza bruta):
 *   - same-origin obligatorio
 *   - rate limit ESTRICTO: 6 intentos / 15 min por IP
 *     (aplica tanto a verificar PIN como a crear)
 *   - comparación timing-safe del PIN
 *   - el PIN se puede rotar con ADMIN_SETUP_PIN en .env
 *     (si no existe, se usa el default acordado "0092")
 * ============================================================
 */

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

/** PIN de acceso (rotable vía .env sin tocar código). */
function getPin(): string {
  const fromEnv = process.env.ADMIN_SETUP_PIN?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : "0092";
}

/** Comparación en tiempo constante para no filtrar el PIN por timing. */
function pinMatches(input: string): boolean {
  const expected = getPin();
  const a = Buffer.from(input.padEnd(16, "\0"), "utf8");
  const b = Buffer.from(expected.padEnd(16, "\0"), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function tooMany() {
  return NextResponse.json(
    {
      error: "RATE_LIMIT",
      message: "Demasiados intentos fallidos. Esta ruta queda bloqueada 15 minutos.",
    },
    { status: 429 }
  );
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "crear-admin"), 6, 15 * 60 * 1000)) {
    return tooMany();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const { action, pin, username, email, password } = (body ?? {}) as Record<string, unknown>;

  // El PIN siempre es el primer filtro, en ambas acciones.
  if (typeof pin !== "string" || pin.length === 0 || pin.length > 32 || !pinMatches(pin)) {
    return NextResponse.json(
      { error: "PIN_INVALIDO", message: "PIN incorrecto." },
      { status: 401 }
    );
  }

  // -------- Acción 1: solo verificar PIN --------
  if (action === "verify-pin") {
    return NextResponse.json({ ok: true });
  }

  // -------- Acción 2: crear SUPER_ADMIN --------
  if (action !== "create") {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
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
        message: "El usuario debe tener 3-20 caracteres: letras minúsculas, números o guion bajo.",
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
        message: "Ese usuario o correo ya está registrado.",
      },
      { status: 409 }
    );
  }

  const admin = await db.user.create({
    data: {
      username: uname,
      email: mail,
      passwordHash: hashPassword(password),
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  await db.wallet.create({ data: { userId: admin.id, balance: 0 } });
  await logAudit({
    actorId: admin.id,
    action: "ADMIN_CREATED",
    entityType: "User",
    entityId: admin.id,
    metadata: { role: "SUPER_ADMIN", via: "/crear/admin" },
  });

  return NextResponse.json({
    ok: true,
    admin: { username: admin.username, email: admin.email, role: admin.role },
  });
}
