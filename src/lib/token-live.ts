"use client";

/**
 * ============================================================
 *  TOKEN LIVE · Store compartido con polling cada 5 segundos
 * ============================================================
 *  Una sola instancia por pestaña del navegador (patrón
 *  singleton + useSyncExternalStore). Todos los componentes
 *  del panel (tarjeta, gráficas, tickers) se suscriben aquí:
 *  aunque haya 5 componentes escuchando, solo se hace UNA
 *  petición cada 5s a /api/token-stats (datos REALES del
 *  par SERVI/USDT en PancakeSwap vía GeckoTerminal + BSC).
 *  El polling se pausa cuando la pestaña está oculta.
 * ============================================================
 */

import { useEffect, useState, useSyncExternalStore } from "react";

export interface TokenStatsData {
  priceUsd: string | null;
  rate: number;
  priceChange: {
    m5: number | null;
    m15: number | null;
    h1: number | null;
    h6: number | null;
    h24: number | null;
  };
  volume: {
    m5: number | null;
    m15: number | null;
    h1: number | null;
    h6: number | null;
    h24: number | null;
  };
  txns: {
    m5: { buys: number; sells: number };
    m15: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  marketCap: number | null;
  liquidity: number;
  liquidityFormatted: string;
  serviReserve: number;
  usdtReserve: number;
  totalSupply: number;
  dexScreenerUrl: string;
  geckoTerminalUrl: string;
  bscScanUrl: string;
}

export interface TokenLiveState {
  data: TokenStatsData | null;
  error: boolean;
  loading: boolean;
  /** Timestamp (ms) de la última actualización correcta. */
  ts: number;
}

const POLL_MS = 5_000;

let state: TokenLiveState = { data: null, error: false, loading: false, ts: 0 };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let inFlight = false;

function emit() {
  for (const l of listeners) l();
}

function patch(next: Partial<TokenLiveState>) {
  state = { ...state, ...next };
  emit();
}

async function fetchOnce() {
  if (inFlight) return;
  inFlight = true;
  try {
    const res = await fetch("/api/token-stats", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as TokenStatsData;
      patch({ data, error: false, loading: false, ts: Date.now() });
    } else {
      patch({ error: true, loading: false });
    }
  } catch {
    patch({ error: true, loading: false });
  } finally {
    inFlight = false;
  }
}

function start() {
  if (timer) return;
  if (!state.data && !state.loading) {
    state = { ...state, loading: true };
    emit();
    void fetchOnce();
  }
  timer = setInterval(() => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    void fetchOnce();
  }, POLL_MS);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) stop();
  };
}

function getSnapshot(): TokenLiveState {
  return state;
}

/** Datos del token en vivo — refresco automático cada 5s. */
export function useTokenLive(): TokenLiveState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ------------------------------------------------------------------ */
/*  Velas OHLCV (gráfica) — refresco cada 30s por rango                */
/* ------------------------------------------------------------------ */

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useTokenChart(range: string): {
  candles: Candle[] | null;
  error: boolean;
} {
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/token-chart?range=${range}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        setCandles(Array.isArray(data.candles) ? (data.candles as Candle[]) : []);
        setError(!res.ok);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    void load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [range]);

  return { candles, error };
}

/* ------------------------------------------------------------------ */
/*  Reloj de 1s para indicadores "hace Xs"                             */
/* ------------------------------------------------------------------ */

export function useNow(intervalMs = 1_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/* ------------------------------------------------------------------ */
/*  Formato de precio tipo cripto (notación con subíndice)             */
/* ------------------------------------------------------------------ */

const SUBSCRIPTS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

/**
 * $0.0000247 → "$0.0₄2475" (estilo CoinMarketCap).
 * Con 4+ decimales significativos; si es mayor, 2-4 decimales normales.
 */
export function formatTinyPrice(price: number | string | null | undefined): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (n === null || n === undefined || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 0.01) {
    return (
      "$" +
      n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    );
  }
  const s = n.toFixed(12);
  const match = /^0\.(0+)([1-9]\d*)/.exec(s);
  if (!match) return "$" + n.toFixed(6);
  const zeros = match[1].length;
  const digits = match[2].slice(0, 4);
  const sub = String(zeros)
    .split("")
    .map((d) => SUBSCRIPTS[Number(d)])
    .join("");
  return `$0.0${sub}${digits}`;
}
