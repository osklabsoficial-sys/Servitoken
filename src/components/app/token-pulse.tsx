"use client";

/**
 * ============================================================
 *  TOKEN PULSE · Datos de mercado en vivo del token SERVI
 * ============================================================
 *  Datos REALES del par SERVI/USDT en PancakeSwap (BSC) vía
 *  /api/token-stats y /api/token-chart (GeckoTerminal + RPC).
 *  - TokenPulseCard: precio en vivo + gráfica de área con
 *    rangos + estadísticas (market cap, liquidez, volumen,
 *    transacciones, reservas). Refresco cada 5s.
 *  - TokenLiveTicker: tira compacta con sparkline para el
 *    resto de páginas del panel. Refresco cada 5s.
 * ============================================================
 */

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, ExternalLink, Loader2, WifiOff } from "lucide-react";
import {
  useTokenLive,
  useTokenChart,
  useNow,
  formatTinyPrice,
  type Candle,
  type TokenStatsData,
} from "@/lib/token-live";
import { formatServi, formatTokenPriceUsd } from "@/lib/format";

/* ------------------------------------------------------------------ */
/*  Formatos                                                           */
/* ------------------------------------------------------------------ */

function fmtUsd(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 10_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function fmtCompactToken(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return formatServi(n);
}

/* ------------------------------------------------------------------ */
/*  Indicador LIVE (punto pulsante + hace Xs)                          */
/* ------------------------------------------------------------------ */

function LiveBadge({ ts, compact = false }: { ts: number; compact?: boolean }) {
  const now = useNow(1_000);
  const ago = ts ? Math.min(59, Math.max(0, Math.round((now - ts) / 1_000))) : null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-brand-green/25 bg-brand-green/10 ${
        compact ? "px-2 py-0.5" : "px-2.5 py-1"
      }`}
      title="Datos reales del par SERVI/USDT · actualización automática cada 5 segundos"
    >
      <span
        className="size-1.5 animate-pulse rounded-full bg-brand-green shadow-[0_0_8px_rgba(45,212,167,0.9)]"
        aria-hidden
      />
      <span className="text-[9px] font-bold uppercase tracking-wide text-brand-green">
        Live · 5s{ago !== null ? ` · hace ${ago}s` : ""}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Chip de variación %                                                */
/* ------------------------------------------------------------------ */

function ChangeChip({ value, label }: { value: number | null; label: string }) {
  const neutral = value === null || !Number.isFinite(value);
  const up = !neutral && value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
        neutral
          ? "bg-white/5 text-muted-foreground"
          : up
            ? "bg-brand-green/10 text-brand-green"
            : "bg-destructive/10 text-destructive"
      }`}
      title={`Variación ${label}`}
    >
      {!neutral &&
        (up ? (
          <ArrowUpRight className="size-3" aria-hidden />
        ) : (
          <ArrowDownRight className="size-3" aria-hidden />
        ))}
      {neutral ? "—" : `${Math.abs(value).toFixed(2)}%`}
      <span className="ml-0.5 text-[8px] font-semibold opacity-60">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Gráfica de área SVG (candles → línea suave + relleno)              */
/* ------------------------------------------------------------------ */

function timeLabel(unixSeconds: number, intraday: boolean): string {
  const d = new Date(unixSeconds * 1000);
  return intraday
    ? d.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("es-DO", { day: "2-digit", month: "short" });
}

function PriceAreaChart({ candles, range }: { candles: Candle[]; range: string }) {
  const W = 640;
  const H = 200;
  const PAD = 10;

  if (candles.length < 2) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-xs text-muted-foreground sm:h-52">
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        Cargando gráfica del mercado…
      </div>
    );
  }

  const closes = candles.map((c) => c.close);
  const n = closes.length;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || max || 1;

  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);

  // Línea suavizada con curvas de Bézier (punto medio)
  let d = `M ${x(0)} ${y(closes[0])}`;
  for (let i = 1; i < n; i++) {
    const mx = (x(i - 1) + x(i)) / 2;
    d += ` C ${mx} ${y(closes[i - 1])}, ${mx} ${y(closes[i])}, ${x(i)} ${y(closes[i])}`;
  }

  const up = closes[n - 1] >= closes[0];
  const color = up ? "#2dd4a7" : "#f87171";
  const intraday = range === "1h" || range === "4h" || range === "1d";
  const lastY = y(closes[n - 1]);

  return (
    <div className="relative h-44 sm:h-52">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="sv-pulse-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.32" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={H * f}
            y2={H * f}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}
        <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#sv-pulse-area)" />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Punto del último precio */}
      <span
        className="absolute size-2.5 rounded-full ring-2 ring-background"
        style={{
          left: "calc(100% - 5px)",
          top: `calc(${(lastY / H) * 100}% - 5px)`,
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
        aria-hidden
      />

      {/* Etiquetas min/max/último */}
      <span className="absolute right-0 top-0 rounded bg-background/70 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-muted-foreground">
        máx {formatTinyPrice(max)}
      </span>
      <span className="absolute bottom-0 right-0 rounded bg-background/70 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-muted-foreground">
        mín {formatTinyPrice(min)}
      </span>
      <span className="absolute bottom-0 left-0 text-[9px] text-muted-foreground">
        {timeLabel(candles[0].time, intraday)}
      </span>
      <span className="absolute left-0 top-0 text-[9px] text-muted-foreground">
        {timeLabel(candles[n - 1].time, intraday)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rangos de la gráfica                                               */
/* ------------------------------------------------------------------ */

const RANGES = [
  { id: "1h", label: "1H" },
  { id: "4h", label: "4H" },
  { id: "1d", label: "1D" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
];

/* ------------------------------------------------------------------ */
/*  Tarjeta completa (panel)                                           */
/* ------------------------------------------------------------------ */

export function TokenPulseCard({ officialRate }: { officialRate?: number }) {
  const { data, error, loading, ts } = useTokenLive();
  const [range, setRange] = useState("1d");
  const { candles } = useTokenChart(range);

  const price = data?.priceUsd ? parseFloat(data.priceUsd) : null;
  const ch = data?.priceChange;
  const tx = data?.txns;

  return (
    <div className="glow-card rounded-2xl">
      <div className="p-5 sm:p-6">
        {/* Cabecera */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              SERVI
              <span className="rounded-md border border-electric/30 bg-electric/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-electric-bright">
                Mercado on-chain
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Par SERVI/USDT · PancakeSwap · BNB Smart Chain
            </p>
          </div>
          <LiveBadge ts={ts} />
        </div>

        {/* Estado */}
        {loading && !data ? (
          <div className="mt-6 flex h-64 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Conectando con el mercado…
          </div>
        ) : error && !data ? (
          <div className="mt-6 flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <WifiOff className="size-5 text-gold" aria-hidden />
            Sin conexión con el mercado ahora mismo.
            <span className="text-xs">Reintentando automáticamente cada 5 segundos…</span>
          </div>
        ) : data ? (
          <>
            {/* Precio en vivo + variaciones */}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span
                className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl"
                title={price !== null ? `$${data.priceUsd} USD` : undefined}
              >
                {formatTinyPrice(price)}
              </span>
              <ChangeChip value={ch?.m5 ?? null} label="5m" />
              <ChangeChip value={ch?.h1 ?? null} label="1h" />
              <ChangeChip value={ch?.h24 ?? null} label="24h" />
            </div>

            {/* Rangos + gráfica */}
            <div className="mt-5" role="tablist" aria-label="Rango de la gráfica">
              <div className="flex flex-wrap gap-1.5">
                {RANGES.map((r) => {
                  const active = range === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setRange(r.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        active
                          ? "bg-electric/15 text-electric-bright ring-1 ring-electric/40"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3">
                <PriceAreaChart candles={candles ?? []} range={range} />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Estadísticas del token">
              <StatTile label="Cap. de mercado" value={fmtUsd(data.marketCap)} />
              <StatTile label="Liquidez" value={data.liquidityFormatted} />
              <StatTile label="Volumen 24h" value={fmtUsd(data.volume?.h24 ?? null)} />
              <StatTile
                label="Txns 24h"
                value={
                  tx
                    ? String(tx.h24.buys + tx.h24.sells)
                    : "—"
                }
                sub={tx ? `C ${tx.h24.buys} · V ${tx.h24.sells}` : undefined}
              />
            </div>

            {/* Reservas + supply */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5 text-[11px] text-muted-foreground">
              <span>
                Reservas del par:{" "}
                <span className="font-semibold text-foreground">
                  {fmtCompactToken(data.serviReserve)} SERVI
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-foreground">
                  {fmtUsd(data.usdtReserve)} USDT
                </span>
              </span>
              <span>
                Supply total:{" "}
                <span className="font-semibold text-foreground">
                  {fmtCompactToken(data.totalSupply)} SERVI
                </span>
              </span>
            </div>

            {/* Precio oficial de compra (contraste con el mercado) */}
            {officialRate !== undefined && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Precio oficial de compra en ServiToken:{" "}
                <span className="font-semibold text-gold-bright">
                  1 SERVI = ${formatTokenPriceUsd(1 / officialRate)}
                </span>{" "}
                · {formatServi(officialRate)} SERVI = $1 USD
              </p>
            )}

            {/* Enlaces del mercado */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3.5">
              <a
                href={data.dexScreenerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-electric-bright transition-colors hover:text-electric"
              >
                DexScreener <ExternalLink className="size-3" aria-hidden />
              </a>
              <a
                href={data.geckoTerminalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-electric-bright transition-colors hover:text-electric"
              >
                GeckoTerminal <ExternalLink className="size-3" aria-hidden />
              </a>
              <a
                href={data.bscScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-electric-bright transition-colors hover:text-electric"
              >
                BscScan <ExternalLink className="size-3" aria-hidden />
              </a>
              <span className="ml-auto text-[10px] text-muted-foreground">
                Datos reales del mercado · auto cada 5s
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tira compacta con sparkline (resto de páginas del panel)           */
/* ------------------------------------------------------------------ */

function Sparkline({ candles }: { candles: Candle[] }) {
  const W = 96;
  const H = 28;
  if (candles.length < 2) return <span className="w-24" aria-hidden />;
  const closes = candles.map((c) => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || max || 1;
  const pts = closes
    .map((c, i) => `${(i / (closes.length - 1)) * W},${H - 2 - ((c - min) / span) * (H - 4)}`)
    .join(" ");
  const up = closes[closes.length - 1] >= closes[0];
  const color = up ? "#2dd4a7" : "#f87171";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-7 w-24" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TokenLiveTicker() {
  const { data, ts } = useTokenLive();
  const { candles } = useTokenChart("1h");
  const price = data?.priceUsd ? parseFloat(data.priceUsd) : null;
  const ch = data?.priceChange;

  return (
    <div className="glow-card flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span
          className="size-2 animate-pulse rounded-full bg-brand-green shadow-[0_0_8px_rgba(45,212,167,0.9)]"
          aria-hidden
        />
        <div>
          <p className="text-sm font-bold tabular-nums leading-none text-foreground">
            {formatTinyPrice(price)}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            SERVI · Mercado on-chain
          </p>
        </div>
      </div>

      <ChangeChip value={ch?.h1 ?? null} label="1h" />
      <ChangeChip value={ch?.h24 ?? null} label="24h" />

      <span className="hidden sm:block">
        <Sparkline candles={candles ?? []} />
      </span>

      <span className="ml-auto hidden items-center gap-1.5 md:flex">
        <LiveBadge ts={ts} compact />
      </span>
    </div>
  );
}

/** Export de tipos para consumidores avanzados. */
export type { TokenStatsData };
