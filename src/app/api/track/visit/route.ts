import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * ============================================================
 *  TRACKING DE VISITAS · POST /api/track/visit
 * ============================================================
 *  Registra una vista de página para el analytics del panel
 *  admin (modelo PageVisit). Público: también mide visitantes
 *  anónimos. Defensas:
 *   - same-origin obligatorio (403)
 *   - rate limit generoso por IP (navegación normal ≪ límite)
 *   - sanitización estricta de path / visitorKey / referrer
 *  El userId se resuelve SOLO en el servidor desde la cookie
 *  de sesión (nunca se confía en el cliente).
 * ============================================================
 */

const VISITOR_KEY_RE = /^[A-Za-z0-9_-]{6,64}$/;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "visit"), 240, 5 * 60 * 1000)) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const { path, visitorKey, referrer } = (body ?? {}) as {
    path?: unknown;
    visitorKey?: unknown;
    referrer?: unknown;
  };

  // Path: solo rutas internas, sin query, longitud acotada.
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.includes("?") ||
    path.includes("#") ||
    path.length > 200
  ) {
    return new NextResponse(null, { status: 400 });
  }

  // visitorKey: identificador anónimo generado por el cliente.
  if (typeof visitorKey !== "string" || !VISITOR_KEY_RE.test(visitorKey)) {
    return new NextResponse(null, { status: 400 });
  }

  // referrer: opcional, acotado y solo http(s).
  let referrerSafe: string | null = null;
  if (typeof referrer === "string" && /^https?:\/\//.test(referrer)) {
    referrerSafe = referrer.slice(0, 300);
  }

  // Usuario real desde la cookie (si existe sesión válida).
  let userId: string | null = null;
  try {
    const session = await getSessionUser();
    if (session) userId = session.id;
  } catch {
    /* visita anónima */
  }

  try {
    await db.pageVisit.create({
      data: {
        path: path.slice(0, 200),
        visitorKey,
        userId,
        userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null,
        referrer: referrerSafe,
      },
    });
  } catch {
    // El tracking nunca debe romper la navegación del usuario.
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
