"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
  encodeFunctionData,
  type Address,
} from "viem";
import { bsc } from "viem/chains";
import { useWalletStore } from "@/lib/wallet-store";
import {
  SERVI_ADDRESS,
  USDT_ADDRESS,
  PANCAKE_ROUTER_V2,
  ERC20_ABI,
  PANCAKE_ROUTER_ABI,
} from "@/lib/contracts";

export type SwapDirection = "USDT_TO_SERVI" | "SERVI_TO_USDT";

export type SwapState =
  | "IDLE"
  | "QUOTING"
  | "QUOTED"
  | "APPROVING"
  | "APPROVED"
  | "SWAPPING"
  | "WAITING_RECEIPT"
  | "CONFIRMED"
  | "FAILED"
  | "REVERTED"
  | "INSUFFICIENT_BALANCE";

const BSC_CHAIN_ID = 56;

const MAX_UINT256 = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
);

const STATE_LABELS: Record<SwapState, string> = {
  IDLE: "Listo",
  QUOTING: "Obteniendo cotizacion...",
  QUOTED: "Cotizado",
  APPROVING: "Aprobando token...",
  APPROVED: "Aprobado",
  SWAPPING: "Firmando transaccion...",
  WAITING_RECEIPT: "Esperando confirmacion en cadena...",
  CONFIRMED: "Intercambio confirmado",
  FAILED: "Error en el intercambio",
  REVERTED: "Transaccion revertida",
  INSUFFICIENT_BALANCE: "Saldo insuficiente",
};

export { STATE_LABELS };

const publicClient = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed.binance.org/"),
});

interface QuoteResult {
  amountOutRaw: string;
  amountOutFormatted: string;
}

interface SwapReceipt {
  transactionHash: string;
  status: "success" | "reverted";
  blockNumber?: bigint;
  gasUsed?: bigint;
}

export function useSwap() {
  const address = useWalletStore((s) => s.address);
  const isConnected = useWalletStore((s) => s.isConnected);
  const chainId = useWalletStore((s) => s.chainId);

  const [state, setState] = useState<SwapState>("IDLE");
  const [swapDirection, setSwapDirection] =
    useState<SwapDirection>("USDT_TO_SERVI");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [error, setError] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [swapReceipt, setSwapReceipt] = useState<SwapReceipt | null>(null);
  const [fromBalanceRaw, setFromBalanceRaw] = useState<bigint | undefined>(
    undefined
  );

  const [allowanceRaw, setAllowanceRaw] = useState<bigint | undefined>(
    undefined
  );

  const pendingSwapRef = useRef<{
    amountInRaw: bigint;
    amountOutMin: bigint;
    path: Address[];
    deadline: bigint;
  } | null>(null);

  const amountInRef = useRef<bigint>(BigInt(0));
  const directionRef = useRef<SwapDirection>("USDT_TO_SERVI");
  const slippageRef = useRef<number>(0.5);
  const quoteRef = useRef<QuoteResult | null>(null);
  const allowanceRef = useRef<bigint | undefined>(undefined);

  // Keep refs in sync
  useEffect(() => {
    directionRef.current = swapDirection;
  }, [swapDirection]);

  useEffect(() => {
    slippageRef.current = slippage;
  }, [slippage]);

  useEffect(() => {
    quoteRef.current = quote;
  }, [quote]);

  useEffect(() => {
    allowanceRef.current = allowanceRaw;
  }, [allowanceRaw]);

  // Fetch balance and allowance when address, chainId, or direction changes
  useEffect(() => {
    if (!address || chainId !== BSC_CHAIN_ID) {
      setFromBalanceRaw(undefined);
      setAllowanceRaw(undefined);
      return;
    }

    const fromToken =
      swapDirection === "USDT_TO_SERVI" ? USDT_ADDRESS : SERVI_ADDRESS;

    let cancelled = false;

    async function fetchReads() {
      try {
        const [balance, allowance] = await Promise.all([
          publicClient.readContract({
            address: fromToken as Address,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address as Address],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: fromToken as Address,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [address as Address, PANCAKE_ROUTER_V2 as Address],
          }) as Promise<bigint>,
        ]);

        if (!cancelled) {
          setFromBalanceRaw(balance);
          setAllowanceRaw(allowance);
        }
      } catch {
        if (!cancelled) {
          setFromBalanceRaw(undefined);
          setAllowanceRaw(undefined);
        }
      }
    }

    fetchReads();

    return () => {
      cancelled = true;
    };
  }, [address, chainId, swapDirection]);

  function getPath(dir: SwapDirection): Address[] {
    if (dir === "USDT_TO_SERVI") {
      return [USDT_ADDRESS as Address, SERVI_ADDRESS as Address];
    }
    return [SERVI_ADDRESS as Address, USDT_ADDRESS as Address];
  }

  /**
   * Poll for a transaction receipt until it appears.
   */
  function waitForReceipt(txHash: string): Promise<SwapReceipt> {
    return new Promise((resolve, reject) => {
      const provider = useWalletStore.getState().provider;
      if (!provider) {
        reject(new Error("No hay proveedor de wallet"));
        return;
      }

      const POLL_INTERVAL = 3_000; // 3 seconds
      const MAX_POLLS = 120; // ~6 minutes max
      let pollCount = 0;

      const timer = setInterval(async () => {
        pollCount++;
        try {
          const receipt = (await provider.request({
            method: "eth_getTransactionReceipt",
            params: [txHash],
          })) as any;

          if (receipt) {
            clearInterval(timer);
            // receipt.status is "0x1" for success, "0x0" for revert
            const success = receipt.status === "0x1";
            resolve({
              transactionHash: receipt.transactionHash,
              status: success ? "success" : "reverted",
              blockNumber: receipt.blockNumber
                ? BigInt(receipt.blockNumber)
                : undefined,
              gasUsed: receipt.gasUsed ? BigInt(receipt.gasUsed) : undefined,
            });
          } else if (pollCount >= MAX_POLLS) {
            clearInterval(timer);
            reject(new Error("Tiempo de espera agotado para la transaccion"));
          }
        } catch (err) {
          // Keep polling on transient errors
          if (pollCount >= MAX_POLLS) {
            clearInterval(timer);
            reject(new Error("Tiempo de espera agotado para la transaccion"));
          }
        }
      }, POLL_INTERVAL);
    });
  }

  /**
   * Send a raw transaction via the wallet provider.
   */
  async function sendRawTransaction(to: Address, data: `0x${string}`): Promise<string> {
    const provider = useWalletStore.getState().provider;
    if (!provider) throw new Error("No hay proveedor de wallet");

    const from = useWalletStore.getState().address;
    if (!from) throw new Error("Wallet no conectada");

    const hash = (await provider.request({
      method: "eth_sendTransaction",
      params: [{ from, to, data }],
    })) as string;

    return hash;
  }

  async function executeSwapFromRef(pending: {
    amountInRaw: bigint;
    amountOutMin: bigint;
    path: Address[];
    deadline: bigint;
  }) {
    const currentAddress = useWalletStore.getState().address;
    if (!currentAddress) return;
    try {
      setState("SWAPPING");

      const calldata = encodeFunctionData({
        abi: PANCAKE_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [
          pending.amountInRaw,
          pending.amountOutMin,
          pending.path,
          currentAddress as Address,
          pending.deadline,
        ],
      });

      const hash = await sendRawTransaction(
        PANCAKE_ROUTER_V2 as Address,
        calldata
      );

      setSwapTxHash(hash);
      setState("WAITING_RECEIPT");

      // Poll for receipt
      const receipt = await waitForReceipt(hash);
      setSwapReceipt(receipt);

      if (receipt.status === "success") {
        setState("CONFIRMED");
      } else {
        setState("REVERTED");
        setError("La transaccion fue revertida en cadena.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al firmar el intercambio";
      if (
        msg.toLowerCase().includes("user rejected") ||
        msg.toLowerCase().includes("denied") ||
        msg.toLowerCase().includes("action cancelled")
      ) {
        setState("IDLE");
        setError(null);
      } else {
        setState("FAILED");
        setError(msg);
      }
    }
  }

  const fetchQuote = useCallback(async function (amount: string) {
    const dir = directionRef.current;

    if (!amount || amount === "" || amount === "." || amount === "0") {
      setQuote(null);
      return;
    }

    let raw: bigint;
    try {
      raw = parseUnits(amount, 18);
    } catch {
      setQuote(null);
      return;
    }

    if (raw <= BigInt(0)) {
      setQuote(null);
      return;
    }

    const fromAddr = dir === "USDT_TO_SERVI" ? USDT_ADDRESS : SERVI_ADDRESS;
    const toAddr = dir === "USDT_TO_SERVI" ? SERVI_ADDRESS : USDT_ADDRESS;

    amountInRef.current = raw;
    setState("QUOTING");
    setError(null);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountRaw: raw.toString(),
          fromAddress: fromAddr,
          toAddress: toAddr,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState("IDLE");
        setError(data.error || "Error al obtener cotizacion");
        setQuote(null);
        return;
      }

      const outRaw = BigInt(data.amountOut);
      const formatted = formatUnits(outRaw, 18);

      setQuote({
        amountOutRaw: data.amountOut,
        amountOutFormatted: formatted,
      });
      setState("QUOTED");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de conexion";
      setState("IDLE");
      setError(msg);
      setQuote(null);
    }
  }, []);

  const executeSwap = useCallback(async function () {
    const { address: currentAddress, isConnected: connected, chainId: currentChainId } =
      useWalletStore.getState();

    if (!currentAddress || !connected) return;

    const currentAmountIn = amountInRef.current;
    const currentDir = directionRef.current;
    const currentSlippage = slippageRef.current;
    const currentQuote = quoteRef.current;
    const currentAllowance = allowanceRef.current;

    if (currentAmountIn <= BigInt(0)) {
      setError("Ingresa una cantidad primero");
      return;
    }

    if (currentChainId !== BSC_CHAIN_ID) {
      try {
        await useWalletStore.getState().switchChain(BSC_CHAIN_ID);
      } catch {
        setError("Debes cambiar a la red BSC");
        setState("FAILED");
        return;
      }
    }

    // Re-read allowance before proceeding (it may have changed)
    const fromToken =
      currentDir === "USDT_TO_SERVI" ? USDT_ADDRESS : SERVI_ADDRESS;
    let latestAllowance = currentAllowance;
    try {
      latestAllowance = (await publicClient.readContract({
        address: fromToken as Address,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [currentAddress as Address, PANCAKE_ROUTER_V2 as Address],
      })) as bigint;
      setAllowanceRaw(latestAllowance);
    } catch {
      // Use cached value if read fails
    }

    const needApprove = !latestAllowance || latestAllowance < currentAmountIn;

    const path = getPath(currentDir);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);

    const quoteOutRaw = currentQuote?.amountOutRaw
      ? BigInt(currentQuote.amountOutRaw)
      : BigInt(0);
    const slippageFactor = BigInt(
      Math.floor((1 - currentSlippage / 100) * 10000)
    );
    const amountOutMin = (quoteOutRaw * slippageFactor) / BigInt(10000);

    const swapParams = {
      amountInRaw: currentAmountIn,
      amountOutMin,
      path,
      deadline,
    };

    if (needApprove) {
      try {
        setState("APPROVING");

        const approveCalldata = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [PANCAKE_ROUTER_V2 as Address, MAX_UINT256],
        });

        const approveHash = await sendRawTransaction(
          fromToken as Address,
          approveCalldata
        );

        // Wait for approve tx receipt
        const approveReceipt = await waitForReceipt(approveHash);

        if (approveReceipt.status !== "success") {
          setState("FAILED");
          setError("La transaccion de aprobacion fue revertida.");
          return;
        }

        pendingSwapRef.current = swapParams;
        await executeSwapFromRef(swapParams);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error al aprobar";
        if (
          msg.toLowerCase().includes("user rejected") ||
          msg.toLowerCase().includes("denied") ||
          msg.toLowerCase().includes("action cancelled")
        ) {
          setState("IDLE");
          setError(null);
        } else {
          setState("FAILED");
          setError(msg);
        }
        return;
      }
    } else {
      await executeSwapFromRef(swapParams);
    }
  }, []);

  const reset = useCallback(function () {
    setState("IDLE");
    setQuote(null);
    setError(null);
    setSwapTxHash(null);
    setSwapReceipt(null);
    amountInRef.current = BigInt(0);
    pendingSwapRef.current = null;
  }, []);

  const isSwapDisabled =
    state === "QUOTING" ||
    state === "APPROVING" ||
    state === "SWAPPING" ||
    state === "WAITING_RECEIPT";

  return {
    state,
    stateLabel: STATE_LABELS[state],
    quote,
    swapDirection,
    setSwapDirection,
    fetchQuote,
    executeSwap,
    reset,
    slippage,
    setSlippage,
    error,
    swapTxHash,
    swapReceipt,
    fromBalanceRaw,
    isSwapDisabled,
  };
}
