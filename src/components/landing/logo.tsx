import { cn } from "@/lib/utils";

/**
 * ============================================================
 *  LOGO DE SERVITOKEN (placeholder)
 * ============================================================
 *  Este es un marcador de posición visual limpio, NO un logo
 *  diseñado profesionalmente. Está pensado para sustituirse
 *  fácilmente por el logo oficial cuando esté disponible.
 *
 *  CÓMO REEMPLAZAR:
 *  - Opción A: coloca el logo oficial en `/public/logo.svg`
 *    y reemplaza el <LogoMark> de abajo por <img src="/logo.svg" .../>.
 *  - Opción B: sustituye el contenido de <LogoMark> por el SVG
 *    oficial del cliente.
 *
 *  No se generó automáticamente ningún logo; este marcador es
 *  solo un símbolo geométrico neutral.
 * ============================================================
 */

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sv-gold" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8C98A" />
          <stop offset="0.5" stopColor="#D4B06A" />
          <stop offset="1" stopColor="#B8924D" />
        </linearGradient>
        <linearGradient id="sv-blue" x1="10" y1="8" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4D85FF" />
          <stop offset="1" stopColor="#2E6BFF" />
        </linearGradient>
      </defs>
      {/* Anillo dorado */}
      <circle cx="20" cy="20" r="18" stroke="url(#sv-gold)" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="14.5" stroke="rgba(212,176,106,0.35)" strokeWidth="1" />
      {/* Núcleo navy */}
      <circle cx="20" cy="20" r="13" fill="#070B16" />
      {/* Monograma S */}
      <path
        d="M24.2 15.4c-1-1-2.5-1.7-4.2-1.7-2.9 0-5 1.9-5 4.2 0 2.1 1.7 3.4 4.6 3.9 2 .35 2.7.9 2.7 1.8 0 1-.9 1.7-2.5 1.7-1.4 0-2.5-.5-3.4-1.4"
        stroke="url(#sv-blue)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Puntos de acento dorado */}
      <circle cx="20" cy="3.5" r="1.4" fill="#D4B06A" />
      <circle cx="20" cy="36.5" r="1.4" fill="#D4B06A" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mark = size === "sm" ? "size-7" : size === "lg" ? "size-12" : "size-9";
  const word =
    size === "sm"
      ? "text-sm"
      : size === "lg"
      ? "text-xl"
      : "text-[15px]";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl bg-navy-2/60 ring-1 ring-white/10",
          mark
        )}
      >
        <LogoMark className={cn(mark)} />
      </span>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={cn("font-semibold tracking-tight text-foreground", word)}>
            Servitoken
          </span>
          {size === "lg" ? (
            <span className="mt-1 text-[11px] font-medium text-gold">
              Token de utilidad
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
