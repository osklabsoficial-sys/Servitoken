"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Botones de autenticación para el header del landing público.
 * - Sin sesión → "Iniciar Sesión" + "Registrarse"
 * - Con sesión → "Mi Panel" (lleva a /inicio)
 */
export function LandingAuthButtons({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"loading" | "guest" | "authed">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!cancelled) setState(res.ok ? "authed" : "guest");
      } catch {
        if (!cancelled) setState("guest");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <span className="flex items-center justify-center text-muted-foreground" aria-hidden>
        <Loader2 className="size-4 animate-spin" />
      </span>
    );
  }

  if (state === "authed") {
    return (
      <Button
        asChild
        size={compact ? "sm" : "default"}
        className="bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_6px_20px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
      >
        <Link href="/inicio">
          <LayoutDashboard className="size-4" />
          Mi Panel
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        asChild
        variant="outline"
        size={compact ? "sm" : "default"}
        className="border-white/15 bg-white/5 hover:bg-white/10"
      >
        <Link href="/login">Iniciar Sesión</Link>
      </Button>
      <Button
        asChild
        size={compact ? "sm" : "default"}
        className="bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_6px_20px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
      >
        <Link href="/registro">Registrarse</Link>
      </Button>
    </>
  );
}
