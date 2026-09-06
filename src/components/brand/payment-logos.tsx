/**
 * ============================================================
 *  SERVITOKEN · Logos oficiales de pasarelas de pago
 * ============================================================
 *  Marcas reproducidas con los colores oficiales de cada
 *  marca para su identificación visual en /compra.
 *  - PayPal: monograma bicolor #003087 / #009CDE + wordmark
 *  - Google Pay: "G" oficial multicolor + Pay
 *  - Apple Pay: manzana + Pay (negro, para chips blancos)
 *  - NFC: ondas de pago sin contacto (genérico)
 *  Todos son SVG inline: sin peticiones de red, escalables.
 * ============================================================
 */

export function PayPalMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="PayPal">
      {/* P trasera (azul oficial oscuro) */}
      <path
        d="M7.076 21.337H2.47a.64.64 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"
        fill="#003087"
      />
      {/* P frontal (azul oficial claro) */}
      <path
        d="M21.222 6.917a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"
        fill="#009CDE"
        opacity="0.94"
      />
    </svg>
  );
}

export function PayPalFullLogo({
  className = "h-6",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <svg viewBox="0 0 118 32" className={className} role="img" aria-label="PayPal">
      <g transform="translate(2 4) scale(0.98)">
        <path
          d="M7.076 21.337H2.47a.64.64 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"
          fill="#003087"
        />
        <path
          d="M21.222 6.917a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"
          fill="#009CDE"
          opacity="0.94"
        />
      </g>
      <text
        x="30"
        y="24.5"
        fontFamily="'PayPal Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="19"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.6"
      >
        <tspan fill={light ? "#FFFFFF" : "#003087"}>Pay</tspan>
        <tspan fill={light ? "#9BD2F5" : "#0070BA"}>Pal</tspan>
      </text>
    </svg>
  );
}

export function GooglePayFullLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 78 32" className={className} role="img" aria-label="Google Pay">
      <g transform="translate(2 4) scale(1)">
        {/* G oficial de Google */}
        <path
          fill="#4285F4"
          d="M27.7 15.3c0-.8-.07-1.57-.2-2.3H14.2v4.5h7.6a6.5 6.5 0 0 1-2.83 4.27v3.52h4.58c2.68-2.47 4.15-6.1 4.15-9.99z"
        />
        <path
          fill="#34A853"
          d="M14.2 28.5c3.83 0 7.04-1.27 9.39-3.44l-4.58-3.55c-1.27.85-2.9 1.36-4.81 1.36-3.7 0-6.84-2.5-7.96-5.86H1.53v3.66A14.2 14.2 0 0 0 14.2 28.5z"
        />
        <path
          fill="#FBBC05"
          d="M6.24 17.01a8.52 8.52 0 0 1 0-5.44V7.91H1.53a14.2 14.2 0 0 0 0 12.76l4.71-3.66z"
        />
        <path
          fill="#EA4335"
          d="M14.2 5.71c2.09 0 3.96.72 5.44 2.13l4.07-4.07A14.2 14.2 0 0 0 1.53 7.91l4.71 3.66C7.36 8.2 10.5 5.71 14.2 5.71z"
        />
      </g>
      <text
        x="35"
        y="24.5"
        fontFamily="'Google Sans', Roboto, 'Helvetica Neue', Arial, sans-serif"
        fontSize="18"
        fontWeight="500"
        letterSpacing="-0.3"
        fill="#5F6368"
      >
        Pay
      </text>
    </svg>
  );
}

export function ApplePayFullLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 32" className={className} role="img" aria-label="Apple Pay">
      <g transform="translate(6 7)">
        {/* Manzana oficial */}
        <path
          fill="#000000"
          d="M4.61 6.06c-.6.8-1.55 1.4-2.5 1.3-.1-1 .37-2 1-2.7.62-.8 1.7-1.4 2.55-1.44.1 1.02-.36 2-.95 2.84zm.94 1.4c-1.4-.08-2.6.8-3.26.8-.67 0-1.7-.76-2.8-.74C1.05 7.54.03 8.16-.53 9.14c-1.4 2.44-.36 6.06 1 8.04.66.97 1.46 2.05 2.5 2.01 1-.04 1.38-.65 2.6-.65 1.2 0 1.55.65 2.62.63 1.08-.02 1.77-.98 2.43-1.95.77-1.13 1.08-2.22 1.1-2.28-.02-.02-2.13-.82-2.15-3.24-.02-2.02 1.65-2.98 1.72-3.03-.94-1.4-2.4-1.55-2.9-1.58z"
          transform="scale(0.95)"
        />
      </g>
      <text
        x="28"
        y="24.5"
        fontFamily="'SF Pro Display', -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontSize="18"
        fontWeight="500"
        letterSpacing="-0.3"
        fill="#000000"
      >
        Pay
      </text>
    </svg>
  );
}

/** Ondas de pago sin contacto (genérico, para la tarjeta SERVI). */
export function ContactlessIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      role="img"
      aria-label="Pago sin contacto"
    >
      <path d="M6 8.5a9.5 9.5 0 0 1 0 7" opacity="0.55" />
      <path d="M9.5 6.5a13 13 0 0 1 0 11" opacity="0.75" />
      <path d="M13 4.5a16.5 16.5 0 0 1 0 15" />
    </svg>
  );
}

/**
 * ============================================================
 *  CHIP EMV ORIGINAL SERVI (diseño propio, estilo metal)
 * ============================================================
 *  Plataforma de contactos realista: 8 pads (2 columnas × 4),
 *  pista central en H, trazas hacia los bordes con vías y
 *  brillo diagonal. Gradientes oro metálico multi-parada.
 * ============================================================
 */
export function EmvChip({ className = "size-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      className={className}
      role="img"
      aria-label="Chip EMV"
      style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.45))" }}
    >
      <defs>
        <linearGradient id="sv-chip-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7E6B2" />
          <stop offset="0.35" stopColor="#D9B872" />
          <stop offset="0.65" stopColor="#B9924E" />
          <stop offset="1" stopColor="#E9CD8D" />
        </linearGradient>
        <linearGradient id="sv-chip-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Cuerpo metálico */}
      <rect
        x="1"
        y="1"
        width="46"
        height="34"
        rx="5.5"
        fill="url(#sv-chip-gold)"
        stroke="#8a6a33"
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      {/* Plataforma de contactos */}
      <rect
        x="10"
        y="6.5"
        width="28"
        height="23"
        rx="3.5"
        fill="none"
        stroke="#7d5f2d"
        strokeOpacity="0.55"
        strokeWidth="0.8"
      />
      {/* Pista central en H + separadores de pads */}
      <path
        d="M19.5 6.5 v7 a2 2 0 0 0 2 2 h5 a2 2 0 0 1 2 2 v10"
        fill="none"
        stroke="#7d5f2d"
        strokeOpacity="0.8"
        strokeWidth="1"
      />
      <path
        d="M28.5 6.5 v5 a2 2 0 0 1 -2 2 h-5 a2 2 0 0 0 -2 2 v13"
        fill="none"
        stroke="#7d5f2d"
        strokeOpacity="0.8"
        strokeWidth="1"
      />
      <path d="M10 17.5 h28" stroke="#7d5f2d" strokeOpacity="0.65" strokeWidth="1" />
      <path d="M24 6.5 v23" stroke="#7d5f2d" strokeOpacity="0.45" strokeWidth="0.9" />
      {/* Trazas hacia los bordes + vías */}
      <path
        d="M1 11.5 h9 M1 24.5 h9 M38 11.5 h9 M38 24.5 h9"
        stroke="#7d5f2d"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <circle cx="5" cy="5.5" r="1.1" fill="#7d5f2d" fillOpacity="0.55" />
      <circle cx="43" cy="5.5" r="1.1" fill="#7d5f2d" fillOpacity="0.55" />
      <circle cx="5" cy="30.5" r="1.1" fill="#7d5f2d" fillOpacity="0.55" />
      <circle cx="43" cy="30.5" r="1.1" fill="#7d5f2d" fillOpacity="0.55" />
      {/* Brillo diagonal */}
      <path d="M1 1 L17 1 L7 35 L1 35 Z" fill="url(#sv-chip-shine)" />
    </svg>
  );
}
