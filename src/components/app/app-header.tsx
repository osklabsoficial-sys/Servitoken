"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Coins,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/landing/logo";
import { MarketTicker } from "@/components/market/market-ticker";
import { formatServi, formatTokenPriceUsd } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Enlace especial con letras aurora animadas (CHAT / OSK LLM - ULTRA) */
  aurora?: boolean;
}

const BASE_LINKS: NavLink[] = [
  { href: "/inicio", label: "Inicio", icon: LayoutDashboard },
  { href: "/compra", label: "Comprar", icon: ShoppingCart },
  { href: "/enviar", label: "Enviar", icon: Send },
  { href: "/servicios", label: "Usar SERVI", icon: Sparkles },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/chat", label: "CHAT", icon: MessageCircle, aurora: true },
];

interface MeResponse {
  user: { id: string; username: string; isAdmin: boolean };
  balance: number;
  rateServiPerUsd: number;
}

export function AppHeader({ user }: { user: SessionUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);

  const links = [...BASE_LINKS];
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (isAdmin) links.push({ href: "/admin", label: "Admin", icon: ShieldCheck });

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) setMe((await res.json()) as MeResponse);
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    loadMe();
    const interval = setInterval(loadMe, 30_000);
    return () => clearInterval(interval);
  }, [loadMe, pathname]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo solo en móvil/tablet: en desktop la marca vive en la
            barra lateral (el nav principal ya no está en el header). */}
        <Link href="/inicio" className="flex shrink-0 items-center gap-2 lg:hidden">
          <Logo size="sm" />
        </Link>

        {/* Ticker de mercado en vivo — ocupa el espacio del nav antiguo (desktop) */}
        <MarketTicker href="/inicio" className="hidden lg:flex" />

        <div className="ml-auto flex items-center gap-2">
          {/* Precio real del token (tasa oficial del servidor) */}
          {me && (
            <span
              className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 xl:flex"
              title="Precio oficial del token fijado por el servidor"
            >
              <TrendingUp className="size-3.5 text-brand-green" aria-hidden />
              <span className="whitespace-nowrap text-xs font-semibold text-foreground">
                1 SERVI = ${formatTokenPriceUsd(1 / me.rateServiPerUsd)}
              </span>
            </span>
          )}

          {/* Saldo */}
          <Link
            href="/inicio"
            className="hidden items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 transition-colors hover:bg-gold/15 sm:flex"
            title="Saldo disponible"
          >
            <Coins className="size-3.5 text-gold" aria-hidden />
            <span className="text-xs font-semibold text-gold-bright">
              {me ? `${formatServi(me.balance)} SERVI` : "•••"}
            </span>
          </Link>

          {/* Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-electric to-electric-bright text-[11px] font-bold text-white">
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate text-xs font-medium sm:inline">
                  @{user.username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-white/10 bg-popover">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">@{user.username}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild>
                <Link href="/recibir" className="cursor-pointer">
                  <Send className="size-4" /> Recibir SERVI
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <ShieldCheck className="size-4" /> Panel de administración
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="size-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú móvil */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-foreground"
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-[300px] border-white/10 bg-background p-0"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <SheetTitle className="flex items-center">
                    <Logo size="sm" />
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      aria-label="Cerrar menú"
                    >
                      <X className="size-5" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-0.5 overflow-y-auto p-4">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                        >
                          <Icon
                            className={`size-4 ${link.aurora ? "text-gold" : ""}`}
                            aria-hidden
                          />
                          {link.aurora ? (
                            <span className="aurora-text text-xs font-bold tracking-[0.18em]">
                              CHAT
                            </span>
                          ) : (
                            link.label
                          )}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
                <div className="mt-auto border-t border-white/10 p-4">
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="size-4" /> Cerrar sesión
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
