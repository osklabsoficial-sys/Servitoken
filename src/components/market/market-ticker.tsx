"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

/**
 * ============================================================
 *  TICKER DE MERCADO SERVI EN VIVO
 * ============================================================
 *  Ocupa el espacio que dejó el nav antiguo en el header
 *  (desktop): precio on-chain del token, cambio 24h, volumen
 *  24h y market cap, con datos de /api/token-stats (DexScreener
 *  vía servidor). Se refresca cada 45s y enmascara fallos
 *  silenciosamente (es cosmético, nunca rompe el header).
 *
 *  Props:
 *   - href          → a dónde lleva el clic (perfil de uso)
 *   - className     → visibilidad responsiva la controla el padre
 *   - showVolume    → muestra el volumen 24h (xl+)
 *   - showMarketCap → muestra el market cap (xl+)
 * ============================================================
 */

interface TokenStats {
  priceUsd: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  marketCap?: number;
}

function fmtPrice(p: number): string {
  return p < 0.01 ? p.toFixed(8) : p.toFixed(4);
}

function fmtUsdCompact(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

export function MarketTicker({
  href,
  className = "",
  showVolume = true,
  showMarketCap = true,
}: {
  href: string;
  className?: string;
  showVolume?: boolean;
  showMarketCap?: boolean;
}) {
  const [stats, setStats] = useState<TokenStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/token-stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as TokenStats;
        if (!cancelled) setStats(data);
      } catch {
        /* silencioso: el ticker es cosmético */
      }
    }

    load();
    const interval = setInterval(load, 45_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const price = stats ? Number(stats.priceUsd) : null;
  const change = stats?.priceChange?.h24 ?? null;
  const positive = (change ?? 0) > 0;
  const negative = (change ?? 0) < 0;
  const neutral = change === null || change === 0;

  const changeColor = positive
    ? "text-brand-green"
    : negative
      ? "text-red-400"
      : "text-muted-foreground";

  return (
    <Link
      href={href}
      title="Mercado SERVI en vivo · Precio on-chain (PancakeSwap). Clic para ver el mercado."
      aria-label="Ticker de mercado SERVI en vivo"
      className={`max-w-full items-center gap-2 overflow-hidden ${className}`}
    >
      {/* Precio on-chain */}
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
        <TrendingUp className="size-3.5 shrink-0 text-gold" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          SERVI
        </span>
        {price === null ? (
          <span className="w-[76px] animate-pulse rounded bg-white/10 text-[11px] font-semibold text-transparent">
            0.00000000
          </span>
        ) : (
          <span className="whitespace-nowrap text-[11px] font-bold text-foreground tabular-nums">
            ${fmtPrice(price)}
          </span>
        )}
      </span>

      {/* Cambio 24h */}
      <span
        className={`hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 sm:flex ${changeColor}`}
        title="Variación del precio en las últimas 24 horas"
      >
        {neutral ? (
          <Minus className="size-3" aria-hidden />
        ) : positive ? (
          <TrendingUp className="size-3" aria-hidden />
        ) : (
          <TrendingDown className="size-3" aria-hidden />
        )}
        <span className="text-[11px] font-semibold tabular-nums">
          {change === null ? "—" : `${positive ? "+" : ""}${change.toFixed(2)}% 24h`}
        </span>
      </span>

      {/* Volumen 24h */}
      {showVolume && (
        <span
          className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 xl:flex"
          title="Volumen operado en las últimas 24 horas"
        >
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Vol</span>
          <span className="text-[11px] font-semibold text-foreground tabular-nums">
            {stats?.volume?.h24 !== undefined ? fmtUsdCompact(stats.volume.h24) : "—"}
          </span>
        </span>
      )}

      {/* Market cap */}
      {showMarketCap && (
        <span
          className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 xl:flex"
          title="Capitalización de mercado (oferta total × precio on-chain)"
        >
          <span className="text-[10px] font-medium uppercase text-muted-foreground">MC</span>
          <span className="text-[11px] font-semibold text-foreground tabular-nums">
            {stats?.marketCap !== undefined ? fmtUsdCompact(stats.marketCap) : "—"}
          </span>
        </span>
      )}
    </Link>
  );
}
