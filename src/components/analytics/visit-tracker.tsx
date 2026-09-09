"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * ============================================================
 *  VISIT TRACKER · Registro de vistas de página (analytics)
 * ============================================================
 *  Se monta una sola vez en el root layout y reporta cada
 *  cambio de ruta a /api/track/visit. Diseñado para ser
 *  invisible al usuario:
 *   - identificador anónimo persistente en localStorage
 *   - keepalive para no cancelar el envío al cerrar la pestaña
 *   - dedupe de dobles disparos en <1.5s (StrictMode/HMR)
 *   - falla en silencio (nunca afecta la navegación)
 * ============================================================
 */

const STORAGE_KEY = "sv_visitor";

function getVisitorKey(): string | null {
  try {
    let key = localStorage.getItem(STORAGE_KEY);
    if (!key || !/^[A-Za-z0-9_-]{6,64}$/.test(key)) {
      const uuid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      key = uuid.replace(/-/g, "");
      localStorage.setItem(STORAGE_KEY, key);
    }
    return key;
  } catch {
    // localStorage bloqueado (modo incógnito estricto): sin tracking.
    return null;
  }
}

export function VisitTracker() {
  const pathname = usePathname();
  const lastRef = useRef<{ path: string; at: number }>({ path: "", at: 0 });

  useEffect(() => {
    if (!pathname) return;
    // Solo rutas de página; nunca APIs ni assets.
    if (!pathname.startsWith("/") || pathname.startsWith("/api/")) return;

    // Dedupe: StrictMode y HMR pueden montar el efecto dos veces.
    const now = Date.now();
    if (lastRef.current.path === pathname && now - lastRef.current.at < 1500) return;
    lastRef.current = { path: pathname, at: now };

    const visitorKey = getVisitorKey();
    if (!visitorKey) return;

    const referrer =
      typeof document !== "undefined" && document.referrer ? document.referrer : undefined;

    fetch("/api/track/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorKey, referrer }),
      keepalive: true,
    }).catch(() => {
      /* silencioso: el analytics no debe nunca molestar */
    });
  }, [pathname]);

  return null;
}
