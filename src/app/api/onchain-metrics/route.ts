import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits, parseAbiItem } from "viem";
import { bsc } from "viem/chains";
import {
  SERVI_ADDRESS,
  USDT_ADDRESS,
  SERVI_USDT_PAIR,
  PANCAKE_PAIR_ABI,
  ERC20_ABI,
} from "@/lib/contracts";

const client = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed1.binance.org/", { timeout: 10_000 }),
});

const CACHE_MS = 60_000;
let cache: { data: Record<string, unknown>; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const [totalSupply, reserves, pairSupply] = await Promise.all([
      client.readContract({
        address: SERVI_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "totalSupply",
      }),
      client.readContract({
        address: SERVI_USDT_PAIR,
        abi: PANCAKE_PAIR_ABI,
        functionName: "getReserves",
      }),
      client.readContract({
        address: SERVI_USDT_PAIR,
        abi: PANCAKE_PAIR_ABI,
        functionName: "totalSupply",
      }),
    ]);

    const [reserve0, reserve1] = reserves as [bigint, bigint, number];
    const token0 = (await client.readContract({
      address: SERVI_USDT_PAIR,
      abi: PANCAKE_PAIR_ABI,
      functionName: "token0",
    })) as string;

    const usdtAddr = USDT_ADDRESS.toLowerCase();
    const serviAddr = SERVI_ADDRESS.toLowerCase();
    const token0Addr = token0.toLowerCase();

    const usdtReserve = token0Addr === usdtAddr ? reserve0 : reserve1;
    const serviReserve = token0Addr === serviAddr ? reserve0 : reserve1;

    const totalSupplyNum = Number(formatUnits(totalSupply as bigint, 18));
    const serviInPool = Number(formatUnits(serviReserve, 18));
    const pairSupplyNum = Number(formatUnits(pairSupply as bigint, 18));

    // Count recent transfer events (last 2000 blocks ~ ~100 min)
    let recentTransfers = 0;
    try {
      const latestBlock = await client.getBlockNumber();
      const fromBlock = latestBlock - 2000n;
      const logs = await client.getLogs({
        address: SERVI_ADDRESS as `0x${string}`,
        event: parseAbiItem(
          "event Transfer(address indexed from, address indexed to, uint256 value)"
        ),
        fromBlock,
        toBlock: latestBlock,
      });
      recentTransfers = logs.length;
    } catch {
      recentTransfers = 0;
    }

    const data = {
      totalSupply: totalSupplyNum,
      recentTransfers,
      serviInPool,
      pairSupply: pairSupplyNum,
    };

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("onchain-metrics error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
