import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits, parseAbiItem, type Log } from "viem";
import { bsc } from "viem/chains";
import { SERVI_ADDRESS, SERVI_USDT_PAIR } from "@/lib/contracts";

const client = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed1.binance.org/", { timeout: 15_000 }),
});

const CACHE_MS = 30_000;
const cache = new Map<string, { data: unknown; ts: number }>();

const PAIR_ADDR = SERVI_USDT_PAIR.toLowerCase();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "wallet param required" }, { status: 400 });
  }

  const addr = wallet.toLowerCase();
  const cached = cache.get(addr);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const latestBlock = await client.getBlockNumber();
    const fromBlock = latestBlock - 10000n; // ~8.3 hours

    const logs = await client.getLogs({
      address: SERVI_ADDRESS as `0x${string}`,
      event: parseAbiItem(
        "event Transfer(address indexed from, address indexed to, uint256 value)"
      ),
      fromBlock,
      toBlock: latestBlock,
    });

    // Filter: only swaps through the pair (one side must be the pair)
    const swapLogs = logs.filter((log: Log<bigint, number, false, undefined, true, undefined, ["Transfer", ...any[]]>) => {
      const from = (log.args.from as string)?.toLowerCase();
      const to = (log.args.to as string)?.toLowerCase();
      return (from === PAIR_ADDR || to === PAIR_ADDR) && from !== to;
    });

    // Get block timestamps in batch
    const blockNumbers = [...new Set(swapLogs.map((l) => l.blockNumber))];
    const timestamps = new Map<number, number>();
    
    // Get timestamps for last 20 unique blocks to limit RPC calls
    const recentBlocks = blockNumbers.slice(-20);
    await Promise.all(
      recentBlocks.map(async (bn) => {
        try {
          const block = await client.getBlock({ blockNumber: bn });
          timestamps.set(bn, Number(block.timestamp));
        } catch {
          timestamps.set(bn, 0);
        }
      })
    );

    const transactions = swapLogs.slice(0, 30).map((log) => {
      const from = (log.args.from as string)?.toLowerCase();
      const to = (log.args.to as string)?.toLowerCase();
      const value = log.args.value as bigint;
      const isBuy = to === addr; // SERVI sent TO user = BUY
      const ts = timestamps.get(log.blockNumber) ?? 0;
      
      return {
        hash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: ts,
        type: isBuy ? "BUY" : "SELL",
        amount: Number(formatUnits(value, 18)),
        from: log.args.from as string,
        to: log.args.to as string,
        bscscanUrl: `https://bscscan.com/tx/${log.transactionHash}`,
      };
    });

    const data = { transactions };
    cache.set(addr, { data, ts: Date.now() });
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("wallet-txns error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
