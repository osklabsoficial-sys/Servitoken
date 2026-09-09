"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  HelpCircle,
  Home,
  Info,
  ListOrdered,
  LogIn,
  Mail,
  ShoppingCart,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/landing/logo";

/**
 * ============================================================
 *  BARRA LATERAL ESTILO INSTAGRAM · landing pública "/"
 * ============================================================
 *  Idéntica al carril de la app privada: iconos permanentes en
 *  un carril fijo de 68px que se expande a 236px al pasar el
 *  cursor, revelando las etiquetas de cada sección.
 *
 *  Diferencias con la versión privada:
 *  - Los enlaces son anclas de la presentación (scroll suave
 *    nativo) con "scroll-spy": la sección visible queda
 *    resaltada (IntersectionObserver).
 *  - Abajo: Iniciar sesión y Registrarse en lugar del perfil.
 *  - En móvil/tablet no aparece: el menú sigue en el header.
 * ============================================================
 */

interface SidebarLink {
  id: string;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: SidebarLink[] = [
  { id: "#inicio", label: "Inicio", icon: Home },
  { id: "#que-es", label: "¿Qué es?", icon: Info },
  { id: "#utilidad", label: "Utilidad", icon: Sparkles },
  { id: "#como-funciona", label: "Cómo funciona", icon: ListOrdered },
  { id: "#estadisticas", label: "Estadísticas", icon: BarChart3 },
  { id: "#compra", label: "Compra", icon: ShoppingCart },
  { id: "#faq", label: "FAQ", icon: HelpCircle },
  { id: "#contacto", label: "Contacto", icon: Mail },
];

export function SiteSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState("#inicio");

  // Scroll-spy: la sección que cruza la franja central marca el activo.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id.slice(1));
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

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
      aria-label="Barra lateral de la presentación"
    >
      {/* Logo (icono siempre; wordmark solo expandida) */}
      <Link
        href="#inicio"
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

      {/* Secciones de la presentación */}
      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Secciones de la presentación"
      >
        {SECTIONS.map((link) => {
          const Icon = link.icon;
          const isActive = active === link.id;
          return (
            <Link
              key={link.id}
              href={link.id}
              title={link.label}
              aria-current={isActive ? "true" : undefined}
              className={`flex h-11 shrink-0 items-center gap-3.5 rounded-xl px-[14px] transition-colors ${
                isActive
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className={`text-sm font-medium ${fade}`}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Acceso: iniciar sesión / registrarse */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href="/login"
          title="Iniciar sesión"
          className="flex h-11 items-center gap-3.5 rounded-xl px-[14px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <LogIn className="size-5 shrink-0" aria-hidden />
          <span className={`text-sm font-medium ${fade}`}>Iniciar sesión</span>
        </Link>
        <Link
          href="/registro"
          title="Crear cuenta"
          className="flex h-11 items-center gap-3.5 rounded-xl px-[14px] text-gold-bright transition-colors hover:bg-gold/10"
        >
          <UserPlus className="size-5 shrink-0" aria-hidden />
          <span className={`text-sm font-semibold ${fade}`}>Registrarse</span>
        </Link>
      </div>
    </aside>
  );
}
