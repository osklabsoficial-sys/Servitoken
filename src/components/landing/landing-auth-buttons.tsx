"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, LayoutDashboard, Loader2, LogIn, LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletStore } from "@/lib/wallet-store";
import { formatServi } from "@/lib/format";

interface MeResponse {
  user: { username: string; email: string };
  balance: number;
}

/**
 * Botones de autenticación para el header del landing público.
 * - Sin sesión → [ Iniciar Sesión ] [ Crear Cuenta ]
 * - Con sesión → saldo SERVI + avatar con [ Ir a mi panel ] [ Cerrar sesión ]
 */
export function LandingAuthButtons({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [state, setState] = useState<"loading" | "guest" | "authed">("loading");

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        setMe((await res.json()) as MeResponse);
        setState("authed");
      } else {
        setMe(null);
        setState("guest");
      }
    } catch {
      setMe(null);
      setState("guest");
    }
  }, []);

  useEffect(function () {
    loadMe();
  }, [loadMe]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Al cerrar sesión también se limpia cualquier wallet conectada.
      useWalletStore.getState().disconnect();
      // Restablece el estado local del header inmediatamente.
      setMe(null);
      setState("guest");
      router.replace("/");
      router.refresh();
    }
  }

  if (state === "loading") {
    return (
      <span className="flex items-center justify-center text-muted-foreground" aria-hidden>
        <Loader2 className="size-4 animate-spin" />
      </span>
    );
  }

  /* ------------------------- Con sesión ------------------------- */
  if (state === "authed" && me) {
    const initial = me.user.username.slice(0, 1).toUpperCase();
    return (
      <div className="flex items-center gap-2">
        {/* Saldo SERVI */}
        <Link
          href="/inicio"
          className="hidden items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 transition-colors hover:bg-gold/15 sm:flex"
          title="Tu saldo de SERVI"
        >
          <Coins className="size-3.5 text-gold" aria-hidden />
          <span className="text-xs font-semibold text-gold-bright">
            {formatServi(me.balance)} SERVI
          </span>
        </Link>

        {/* Avatar + menú */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Menú de usuario"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-electric to-electric-bright text-[11px] font-bold text-white">
                {initial}
              </span>
              <span className="hidden max-w-[110px] truncate text-xs font-medium sm:inline">
                @{me.user.username}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-white/10 bg-popover">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">@{me.user.username}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {me.user.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/inicio" className="cursor-pointer">
                <LayoutDashboard className="size-4" /> Ir a mi panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  /* ------------------------- Sin sesión ------------------------- */
  return (
    <>
      <Button
        asChild
        variant="outline"
        size={compact ? "sm" : "default"}
        className="border-white/15 bg-white/5 hover:bg-white/10"
      >
        <Link href="/login">
          <LogIn className="size-4" /> Iniciar Sesión
        </Link>
      </Button>
      <Button
        asChild
        size={compact ? "sm" : "default"}
        className="bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_6px_20px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
      >
        <Link href="/registro">
          <UserPlus className="size-4" /> Crear Cuenta
        </Link>
      </Button>
    </>
  );
}
