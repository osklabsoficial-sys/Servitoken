"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import type { SessionUser } from "@/lib/auth";

/**
 * ============================================================
 *  BARRA LATERAL ESTILO INSTAGRAM · rutas privadas
 * ============================================================
 *  Carril fijo izquierdo (solo desktop lg+) con iconos
 *  permanentes. Al pasar el cursor se expande suavemente y
 *  revela las etiquetas de cada sección, como la web de
 *  Instagram. En móvil/tablet no aparece: el menú sigue
 *  disponible en el header (Sheet).
 *
 *  La expansión se controla con estado JS (mouseenter/leave
 *  + foco de teclado) en vez de :hover CSS: Tailwind 4
 *  encierra las variantes hover en @media (hover:hover) y
 *  así el comportamiento es idéntico en cualquier entorno.
 *
 *  - Ruta activa resaltada
 *  - CHAT mantiene su tratamiento aurora + punto "en vivo"
 *  - Abajo: perfil y cerrar sesión
 *  - El contenido de la página se desplaza con lg:pl-[68px]
 *    en el layout (el carril mide 68px colapsada).
 * ============================================================
 */

interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
  aurora?: boolean;
}

const BASE_LINKS: SidebarLink[] = [
  { href: "/inicio", label: "Inicio", icon: LayoutDashboard },
  { href: "/compra", label: "Comprar", icon: ShoppingCart },
  { href: "/enviar", label: "Enviar", icon: Send },
  { href: "/servicios", label: "Usar SERVI", icon: Sparkles },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/chat", label: "CHAT", icon: MessageCircle, aurora: true },
];

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const links: SidebarLink[] = isAdmin
    ? [...BASE_LINKS, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : BASE_LINKS;

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  /** Etiqueta que solo es visible con la barra expandida. */
  const fade = `min-w-0 whitespace-nowrap transition-opacity duration-200 ${
    expanded ? "opacity-100" : "opacity-0"
  }`;

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setExpanded(false);
      }}
      className={`fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden border-r border-white/10 bg-background/95 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex ${
        expanded ? "w-[236px]" : "w-[68px]"
      }`}
      aria-label="Barra lateral de navegación"
    >
      {/* Logo (icono siempre; wordmark solo expandida) */}
      <Link
        href="/inicio"
        title="ServiToken"
        className="relative flex h-16 shrink-0 items-center px-[20px] transition-colors hover:bg-white/5"
      >
        <Logo size="sm" showWordmark={false} />
        <span
          className={`pointer-events-none absolute left-5 flex items-center transition-opacity duration-200 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <Logo size="sm" />
        </span>
      </Link>

      {/* Secciones */}
      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Secciones de la aplicación"
      >
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 shrink-0 items-center gap-3.5 rounded-xl px-[14px] transition-colors ${
                active
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {link.aurora ? (
                <span className="relative shrink-0" aria-hidden>
                  <MessageCircle className="size-5 text-gold" />
                  <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-emerald-400" />
                </span>
              ) : (
                <Icon className="size-5 shrink-0" aria-hidden />
              )}
              {link.aurora ? (
                <span className={`flex items-center ${fade}`}>
                  <span className="aurora-text text-xs font-bold tracking-[0.18em]">CHAT</span>
                </span>
              ) : (
                <span className={`text-sm font-medium ${fade}`}>{link.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Perfil + cerrar sesión */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href="/inicio"
          title="Mi cuenta"
          className="flex h-11 items-center gap-3.5 rounded-xl px-[14px] transition-colors hover:bg-white/5"
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric to-electric-bright text-xs font-bold text-white"
            aria-hidden
          >
            {user.username.slice(0, 1).toUpperCase()}
          </span>
          <span className={`text-sm font-semibold ${fade}`}>@{user.username}</span>
        </Link>
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="flex h-11 w-full items-center gap-3.5 rounded-xl px-[14px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          <span className={`text-sm font-medium ${fade}`}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
