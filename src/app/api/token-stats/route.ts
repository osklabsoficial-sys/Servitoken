import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { bsc } from "viem/chains";
import {
  SERVI_ADDRESS,
  USDT_ADDRESS,
  SERVI_USDT_PAIR,
  PANCAKE_ROUTER_V2,
  PANCAKE_ROUTER_ABI,
  PANCAKE_PAIR_ABI,
  ERC20_ABI,
} from "@/lib/contracts";

const client = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed1.binance.org/", { timeout: 10_000 }),
});

const CACHE_MS = 15_000;
let cache: { data: Record<string, unknown>; ts: number } | null = null;

interface GeckoPool {
  attributes: {
    base_token_price_usd: string;
    base_token_price_quote_token: string;
    fdv_usd: string | null;
    market_cap_usd: string | null;
    reserve_in_usd: string;
    pool_created_at: string;
    price_change_percentage: {
      m5: string;
      m15: string;
      m30: string;
      h1: string;
      h6: string;
      h24: string;
    };
    volume_usd: {
      m5: string;
      m15: string;
      m30: string;
      h1: string;
      h6: string;
      h24: string;
    };
    transactions: {
      m5: { buys: number; sells: number };
      m15: { buys: number; sells: number };
      m30: { buys: number; sells: number };
      h1: { buys: number; sells: number };
      h6: { buys: number; sells: number };
      h24: { buys: number; sells: number };
    };
  };
}

async function fetchGeckoTerminal(): Promise<GeckoPool | null> {
  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/bsc/pools/${SERVI_USDT_PAIR}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 15 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    // 1. On-chain data from PancakeSwap pair (reserves, supply, price)
    const [token0, token1, reserves, serviTotalSupply] =
      await Promise.all([
        client.readContract({
          address: SERVI_USDT_PAIR,
          abi: PANCAKE_PAIR_ABI,
          functionName: "token0",
        }),
        client.readContract({
          address: SERVI_USDT_PAIR,
          abi: PANCAKE_PAIR_ABI,
          functionName: "token1",
        }),
        client.readContract({
          address: SERVI_USDT_PAIR,
          abi: PANCAKE_PAIR_ABI,
          functionName: "getReserves",
        }),
        client.readContract({
          address: SERVI_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "totalSupply",
        }),
      ]);

    const [reserve0, reserve1] = reserves as [bigint, bigint, number];
    const token0Addr = (token0 as string).toLowerCase();
    const usdtAddr = USDT_ADDRESS.toLowerCase();
    const serviAddr = SERVI_ADDRESS.toLowerCase();

    const usdtReserve = token0Addr === usdtAddr ? reserve0 : reserve1;
    const serviReserve = token0Addr === serviAddr ? reserve0 : reserve1;

    const usdtReserveFormatted = Number(formatUnits(usdtReserve, 18));
    const serviReserveFormatted = Number(formatUnits(serviReserve, 18));

    // Price from on-chain reserves
    const onChainPrice =
      serviReserve > 0n ? usdtReserveFormatted / serviReserveFormatted : 0;

    // Rate: 1 USDT = X SERVI
    let rate = 0;
    try {
      const amounts = await client.readContract({
        address: PANCAKE_ROUTER_V2,
        abi: PANCAKE_ROUTER_ABI,
        functionName: "getAmountsOut",
        args: [
          1000000000000000000n,
          [USDT_ADDRESS as `0x${string}`, SERVI_ADDRESS as `0x${string}`],
        ],
      });
      const arr = amounts as bigint[];
      rate = Number(formatUnits(arr[arr.length - 1], 18));
    } catch {
      rate = onChainPrice > 0 ? 1 / onChainPrice : 0;
    }

    const supplyFormatted = Number(
      formatUnits(serviTotalSupply as bigint, 18)
    );
    const onChainMarketCap = onChainPrice * supplyFormatted;

    // 2. GeckoTerminal data (price, changes, volume, txns, FDV)
    const gecko = await fetchGeckoTerminal();
    const attr = gecko?.attributes;

    // Use GeckoTerminal price if available (more accurate), else on-chain
    const geckoPrice = attr ? parseFloat(attr.base_token_price_usd) : 0;
    const priceUsd = geckoPrice > 0 ? geckoPrice : onChainPrice;

    // Price changes
    const pc = attr?.price_change_percentage;
    const priceChange = {
      m5: pc ? parseFloat(pc.m5) : null,
      m15: pc ? parseFloat(pc.m15) : null,
      h1: pc ? parseFloat(pc.h1) : null,
      h6: pc ? parseFloat(pc.h6) : null,
      h24: pc ? parseFloat(pc.h24) : null,
    };

    // Volume
    const vol = attr?.volume_usd;
    const volume = {
      m5: vol ? parseFloat(vol.m5) : null,
      m15: vol ? parseFloat(vol.m15) : null,
      h1: vol ? parseFloat(vol.h1) : null,
      h6: vol ? parseFloat(vol.h6) : null,
      h24: vol ? parseFloat(vol.h24) : null,
    };

    // Transactions
    const tx = attr?.transactions;
    const txns = {
      m5: { buys: tx?.m5?.buys ?? 0, sells: tx?.m5?.sells ?? 0 },
      m15: { buys: tx?.m15?.buys ?? 0, sells: tx?.m15?.sells ?? 0 },
      h1: { buys: tx?.h1?.buys ?? 0, sells: tx?.h1?.sells ?? 0 },
      h6: { buys: tx?.h6?.buys ?? 0, sells: tx?.h6?.sells ?? 0 },
      h24: { buys: tx?.h24?.buys ?? 0, sells: tx?.h24?.sells ?? 0 },
    };

    // Market cap / FDV
    let marketCap: number | null = null;
    if (attr?.fdv_usd) {
      marketCap = parseFloat(attr.fdv_usd);
    } else if (onChainMarketCap > 0) {
      marketCap = onChainMarketCap;
    }

    // Liquidity
    const liquidity = attr
      ? parseFloat(attr.reserve_in_usd)
      : usdtReserveFormatted;

    const liquidityFormatted =
      liquidity >= 1_000_000
        ? "$" + (liquidity / 1_000_000).toFixed(2) + "M"
        : "$" + liquidity.toFixed(2);

    // Rate from GeckoTerminal if available
    if (attr?.base_token_price_quote_token) {
      const r = parseFloat(attr.base_token_price_quote_token);
      if (r > 0) rate = 1 / r;
    }

    const data = {
      // Price
      priceUsd: priceUsd > 0 ? priceUsd.toFixed(10) : null,
      rate,

      // Price changes
      priceChange,

      // Volume
      volume,

      // Transactions
      txns,

      // Market cap
      marketCap,

      // Liquidity
      liquidity,
      liquidityFormatted,

      // On-chain reserves
      serviReserve: serviReserveFormatted,
      usdtReserve: usdtReserveFormatted,
      totalSupply: supplyFormatted,

      // Links
      pairAddress: SERVI_USDT_PAIR,
      dexScreenerUrl: `https://dexscreener.com/bsc/${SERVI_USDT_PAIR}`,
      geckoTerminalUrl: `https://www.geckoterminal.com/bsc/pools/${SERVI_USDT_PAIR}`,
      bscScanUrl: `https://bscscan.com/token/${SERVI_ADDRESS}`,
      bscScanPairUrl: `https://bscscan.com/address/${SERVI_USDT_PAIR}`,

      // Pair creation
      pairCreatedAt: attr?.pool_created_at ?? null,
    };

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("token-stats error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
