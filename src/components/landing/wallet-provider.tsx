"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { tryReconnect, useWalletStore } from "@/lib/wallet-store";

export function WalletProviderCore({ children }: { children: ReactNode }) {
  useEffect(function () {
    let cancelled = false;
    (async function () {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (cancelled) return;
        if (res.ok) {
          // Solo usuarios autenticados pueden rehidratar la conexión
          // de wallet guardada en localStorage.
          tryReconnect();
        } else {
          // Visitante sin sesión: garantiza que no quede ninguna
          // wallet "conectada" en el estado del cliente.
          useWalletStore.getState().disconnect();
        }
      } catch {
        /* sin sesión verificable: no reconectar */
      }
    })();
    return function () {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
