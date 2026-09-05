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
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
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
import { formatServi } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";

const BASE_LINKS = [
  { href: "/inicio", label: "Inicio", icon: LayoutDashboard },
  { href: "/comprar", label: "Comprar", icon: ShoppingCart },
  { href: "/enviar", label: "Enviar", icon: Send },
  { href: "/servicios", label: "Usar SERVI", icon: Sparkles },
  { href: "/historial", label: "Historial", icon: History },
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/inicio" className="flex shrink-0 items-center gap-2">
          <Logo size="sm" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegación principal">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
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
                          <Icon className="size-4" />
                          {link.label}
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
