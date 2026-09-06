/**
 * ============================================================
 *  SERVITOKEN · Autenticación y sesiones
 * ============================================================
 *  - Contraseñas con scrypt (node:crypto), sin dependencias.
 *  - Sesiones en base de datos: la cookie contiene un token
 *    aleatorio; en BD se guarda únicamente su sha256.
 *  - Cookies httpOnly + sameSite=Lax + secure en producción.
 * ============================================================
 */

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "servi_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

/* ------------------------- Contraseñas ------------------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return (
      candidate.length === expected.length && timingSafeEqual(candidate, expected)
    );
  } catch {
    return false;
  }
}

/* -------------------------- Sesiones --------------------------- */

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Crea una sesión en BD y fija la cookie httpOnly. (Solo rutas API / server actions) */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Cierra la sesión actual (borra fila en BD y la cookie). */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }
  try {
    jar.delete(SESSION_COOKIE);
  } catch {
    /* noop */
  }
}

/** Obtiene el usuario de la sesión actual (server components y APIs). */
export async function getSessionUser(): Promise<SessionUser | null> {
  let token: string | undefined;
  try {
    const jar = await cookies();
    token = jar.get(SESSION_COOKIE)?.value;
  } catch {
    return null;
  }
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
  };
}

/** Orígenes de confianza del gateway de preview (el panel expone la app vía estos dominios). */
function isTrustedPreviewHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".space-z.ai") || // panel de preview z.ai
    host.endsWith(".vercel.app") || // despliegue oficial
    host.endsWith(".servitoken.com")
  );
}

/**
 * Garantía anti-CSRF para mutaciones POST: verifica mismo origen.
 * Consciente del gateway: el panel de preview reescribe Host a localhost:3000
 * manteniendo el Origin público, por lo que también se comparan
 * x-forwarded-host, x-forwarded-proto y hosts de confianza conocidos.
 */
export function isSameOrigin(req: Request): boolean {
  // Navegadores modernos envían Sec-Fetch-Site y es un header prohibido
  // (no se puede falsificar desde JS): es la señal anti-CSRF más fiable.
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite) {
    return fetchSite !== "cross-site";
  }

  const origin = req.headers.get("origin");
  if (!origin) return true; // cliente no-navegador

  try {
    const originHost = new URL(origin).host; // dominio:puerto
    const originHostname = new URL(origin).hostname; // solo dominio

    const host = req.headers.get("host");
    if (host && originHost === host) return true;

    const fwdHost = req.headers.get("x-forwarded-host");
    if (fwdHost && originHost === fwdHost.split(",")[0].trim()) return true;

    // Tras el gateway: si Host local + Origin público de confianza → OK.
    if (
      host &&
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")) &&
      isTrustedPreviewHost(originHostname)
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export const isPrivileged = (role: string) => role === "ADMIN" || role === "SUPER_ADMIN";
