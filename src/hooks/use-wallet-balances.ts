"use client";

import { useState, useEffect, useCallback } from "react";
import { createPublicClient, http, formatEther, formatUnits, type Address } from "viem";
import { bsc } from "viem/chains";
import { useWalletStore } from "@/lib/wallet-store";
import { SERVI_ADDRESS, USDT_ADDRESS, ERC20_ABI } from "@/lib/contracts";

const publicClient = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed.binance.org/"),
});

export interface TokenBalance {
  value: bigint | null;
  formatted: string;
  isLoading: boolean;
}

/**
 * Fetches BNB, SERVI, and USDT balances for the connected wallet.
 * Uses viem's publicClient (read-only RPC) — no wagmi.
 */
export function useWalletBalances() {
  const { address, isConnected } = useWalletStore();
  const [bnb, setBnb] = useState<TokenBalance>({ value: null, formatted: "0", isLoading: false });
  const [servi, setServi] = useState<TokenBalance>({ value: null, formatted: "0", isLoading: false });
  const [usdt, setUsdt] = useState<TokenBalance>({ value: null, formatted: "0", isLoading: false });

  const fetchBalances = useCallback(async function () {
    if (!address) return;

    setBnb(function (prev) { return { ...prev, isLoading: true }; });
    setServi(function (prev) { return { ...prev, isLoading: true }; });
    setUsdt(function (prev) { return { ...prev, isLoading: true }; });

    try {
      const [bnbBal, serviBal, usdtBal] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: SERVI_ADDRESS as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: USDT_ADDRESS as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }) as Promise<bigint>,
      ]);

      setBnb({ value: bnbBal, formatted: formatEther(bnbBal), isLoading: false });
      setServi({ value: serviBal, formatted: formatUnits(serviBal, 18), isLoading: false });
      setUsdt({ value: usdtBal, formatted: formatUnits(usdtBal, 18), isLoading: false });
    } catch {
      setBnb(function (prev) { return { ...prev, isLoading: false }; });
      setServi(function (prev) { return { ...prev, isLoading: false }; });
      setUsdt(function (prev) { return { ...prev, isLoading: false }; });
    }
  }, [address]);

  useEffect(function () {
    if (!isConnected || !address) return;
    const id = setTimeout(fetchBalances, 0);
    const interval = setInterval(fetchBalances, 30_000);
    return function () { clearTimeout(id); clearInterval(interval); };
  }, [isConnected, address, fetchBalances]);

  return { bnb, servi, usdt, refetch: fetchBalances };
}
