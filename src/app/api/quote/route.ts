import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { bsc } from "viem/chains";
import { PANCAKE_ROUTER_V2, PANCAKE_ROUTER_ABI, SERVI_ADDRESS, USDT_ADDRESS } from "@/lib/contracts";

const client = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed1.binance.org/", { timeout: 10_000 }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amountRaw, fromAddress, toAddress } = body;
    if (!amountRaw || !fromAddress || !toAddress) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Direct path: USDT <-> SERVI (no WBNB intermediary)
    const isUsdtToServi = fromAddress.toLowerCase() === USDT_ADDRESS.toLowerCase();
    const path: `0x${string}`[] = isUsdtToServi
      ? [USDT_ADDRESS as `0x${string}`, SERVI_ADDRESS as `0x${string}`]
      : [SERVI_ADDRESS as `0x${string}`, USDT_ADDRESS as `0x${string}`];

    const amounts = await client.readContract({
      address: PANCAKE_ROUTER_V2,
      abi: PANCAKE_ROUTER_ABI,
      functionName: "getAmountsOut",
      args: [BigInt(amountRaw), path],
    });

    return NextResponse.json({ amountOut: amounts[amounts.length - 1].toString() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
