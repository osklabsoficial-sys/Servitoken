import { NextRequest, NextResponse } from "next/server";
import { SERVI_USDT_PAIR } from "@/lib/contracts";

const CACHE_MS = 60_000; // 1 min cache
let cache: Record<string, { data: unknown; ts: number }> = {};

interface OhlcvCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * GeckoTerminal provides free, no-auth OHLCV data.
 * Endpoint: /api/v2/networks/{network}/pools/{pool}/ohlcv/{timeframe}
 */
async function fetchGeckoTerminal(
  timeframe: string,
  limit: number
): Promise<OhlcvCandle[]> {
  const url = `https://api.geckoterminal.com/api/v2/networks/bsc/pools/${SERVI_USDT_PAIR}/ohlcv/${timeframe}?limit=${limit}&currency=usd`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`GeckoTerminal ${res.status}`);
  }

  const json = await res.json();
  const candles = json?.data?.attributes?.ohlcv_list;

  if (!Array.isArray(candles)) return [];

  return candles.map(
    (c: (string | number)[]) => ({
      time: Number(c[0]), // unix timestamp (seconds)
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
      volume: Number(c[5]),
    })
  );
}

/**
 * DexScreener chart data endpoint (backup if GeckoTerminal fails).
 * Returns aggregated trade data.
 */
async function fetchDexScreenerChart(): Promise<OhlcvCandle[]> {
  // DexScreener doesn't have a public OHLCV API, so we rely on GeckoTerminal
  // This is a placeholder fallback
  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";

  // Cache key includes range
  const cacheKey = range;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_MS) {
    return NextResponse.json(cache[cacheKey].data);
  }

  // Map range to GeckoTerminal timeframe + limit
  const config: Record<string, { timeframe: string; limit: number }> = {
    "1h": { timeframe: "minute", limit: 60 },
    "4h": { timeframe: "5m", limit: 48 },
    "1d": { timeframe: "hour", limit: 24 },
    "7d": { timeframe: "hour", limit: 168 },
    "30d": { timeframe: "day", limit: 30 },
    "90d": { timeframe: "day", limit: 90 },
  };

  const { timeframe, limit } = config[range] || config["7d"];

  try {
    let candles = await fetchGeckoTerminal(timeframe, limit);

    // Fallback
    if (candles.length === 0) {
      candles = await fetchDexScreenerChart();
    }

    // GeckoTerminal returns newest first; reverse for chart (oldest → newest)
    candles.reverse();

    const data = {
      range,
      candles,
      pairAddress: SERVI_USDT_PAIR,
    };

    cache[cacheKey] = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("token-chart error:", msg);
    return NextResponse.json({ error: msg, candles: [], range }, { status: 500 });
  }
}
