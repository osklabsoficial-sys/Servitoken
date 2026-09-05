import { NextRequest, NextResponse } from "next/server";

/**
 * Primera capa de protección de rutas privadas.
 * Verifica SOLO la presencia de la cookie de sesión (la validación
 * completa contra BD ocurre en cada página/API del servidor).
 */

const SESSION_COOKIE = "servi_session";

const PROTECTED_PREFIXES = [
  "/inicio",
  "/comprar",
  "/enviar",
  "/recibir",
  "/historial",
  "/servicios",
  "/admin",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inicio/:path*",
    "/comprar/:path*",
    "/enviar/:path*",
    "/recibir/:path*",
    "/historial/:path*",
    "/servicios/:path*",
    "/admin/:path*",
  ],
};
