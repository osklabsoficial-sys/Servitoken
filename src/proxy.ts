import { NextRequest, NextResponse } from "next/server";

/**
 * Primera capa de protección de rutas privadas.
 * Verifica SOLO la presencia de la cookie de sesión (la validación
 * completa contra BD ocurre en cada página/API del servidor).
 *
 * Al redirigir a /login emite `returnTo=<ruta original>` para que,
 * tras autenticarse, el usuario vuelva exactamente a donde quería.
 */

const SESSION_COOKIE = "servi_session";

const PROTECTED_PREFIXES = [
  "/inicio",
  "/compra",
  "/comprar",
  "/enviar",
  "/recibir",
  "/historial",
  "/servicios",
  "/admin",
  "/chat",
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
    url.search = `returnTo=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Propaga la ruta original al servidor para que el layout privado
  // (defensa en profundidad) también pueda redirigir con returnTo.
  const headers = new Headers(req.headers);
  headers.set("x-sv-path", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/inicio/:path*",
    "/compra/:path*",
    "/comprar/:path*",
    "/enviar/:path*",
    "/recibir/:path*",
    "/historial/:path*",
    "/servicios/:path*",
    "/admin/:path*",
    "/chat/:path*",
  ],
};
