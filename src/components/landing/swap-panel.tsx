"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import {
  ArrowDownUp,
  Wallet,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SERVI_ADDRESS,
  USDT_ADDRESS,
  PANCAKE_ROUTER,
  ROUTER_ABI,
} from "@/lib/contracts";
import { formatEther, parseEther } from "viem";
import { bsc } from "wagmi/chains";

const SLIPPAGE_BPS = 200; // 2%

export function SwapPanel() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const [usdtInput, setUsdtInput] = useState("");
  const switchAttempted = useRef(false);

  const isWrongNetwork = isConnected && chain?.id !== bsc.id;

  // Auto-switch to BSC
  useEffect(() => {
    if (!isWrongNetwork) {
      switchAttempted.current = false;
      return;
    }
    if (!switchChain || switchAttempted.current) return;
    switchAttempted.current = true;
    switchChain({ chainId: bsc.id }).catch(() => {});
  }, [isWrongNetwork, switchChain]);

  const usdtAmount = usdtInput.trim() ? parseEther(usdtInput) : 0n;

  // ---- Read: quote from PancakeSwap Router ----
  const { data: quoteResult } = useReadContract({
    address: PANCAKE_ROUTER,
    abi: ROUTER_ABI,
    functionName: "getAmountsOut",
    args:
      usdtAmount > 0n
        ? [usdtAmount, [USDT_ADDRESS, SERVI_ADDRESS]]
        : undefined,
    query: {
      enabled: usdtAmount > 0n && isConnected && !isWrongNetwork,
      refetchInterval: 30_000,
    },
  });

  const serviOutput =
    quoteResult && Array.isArray(quoteResult) ? quoteResult[1] : 0n;
  const serviFormatted = serviOutput > 0n ? formatEther(serviOutput) : "0";

  const rate =
    usdtAmount > 0n && serviOutput > 0n
      ? formatEther((serviOutput * parseEther("1")) / usdtAmount)
      : null;

  // ══════════════════════════════════════════
  //  NOT CONNECTED
  // ══════════════════════════════════════════
  if (!isConnected) {
    return (
      <div className="glass-card overflow-hidden rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-electric/20 bg-electric/10">
            <Wallet className="size-6 text-electric-bright" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Conecta tu wallet
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Conecta tu wallet para consultar cotizaciones y preparar la
              compra de SERVI directamente desde aquí.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  //  SWITCHING NETWORK (brief loading state)
  // ══════════════════════════════════════════
  if (isWrongNetwork) {
    return (
      <div className="glass-card overflow-hidden rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-electric/20 bg-electric/10">
            <span className="size-4 animate-pulse rounded-full bg-electric-bright" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Configurando BNB Smart Chain...
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Tu wallet se está configurando automáticamente a la red correcta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  //  SWAP INTERFACE (compra desactivada)
  // ══════════════════════════════════════════
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />

      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        Comprar SERVI
      </p>

      {/* You pay — USDT */}
      <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <label htmlFor="usdt-amount" className="text-xs text-muted-foreground">
            Pagas
          </label>
          <span className="text-xs font-semibold text-foreground">USDT</span>
        </div>
        <input
          id="usdt-amount"
          type="number"
          placeholder="0.00"
          value={usdtInput}
          onChange={(e) => setUsdtInput(e.target.value)}
          min={0}
          step="any"
          className="mt-2 w-full bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      {/* Arrow separator */}
      <div className="relative z-10 -my-1 flex justify-center">
        <div className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-navy">
          <ArrowDownUp className="size-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* You receive — SERVI */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Recibes</label>
          <span className="text-xs font-semibold text-foreground">SERVI</span>
        </div>
        <div className="mt-2 text-2xl font-semibold text-foreground">
          {usdtAmount > 0n && serviOutput > 0n
            ? parseFloat(serviFormatted).toLocaleString("es-CO", {
                maximumFractionDigits: 2,
              })
            : "0"}
        </div>
      </div>

      {/* Quote info */}
      {usdtAmount > 0n && serviOutput > 0n && rate && (
        <div className="mt-4 space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Tasa estimada</span>
            <span className="font-mono text-muted-foreground">
              1 USDT ≈{" "}
              {parseFloat(rate).toLocaleString("es-CO", {
                maximumFractionDigits: 2,
              })}{" "}
              SERVI
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Slippage máximo</span>
            <span className="text-muted-foreground">{(SLIPPAGE_BPS / 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Router</span>
            <span className="text-muted-foreground">PancakeSwap V2</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Red</span>
            <span className="text-muted-foreground">BNB Smart Chain</span>
          </div>
        </div>
      )}

      {/* Gas warning */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400/80" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Necesitarás BNB para pagar las tarifas de gas de la transacción.
          Verifica siempre la dirección del contrato antes de operar.
        </p>
      </div>

      {/* ─── CTA: PRÓXIMAMENTE ─── */}
      <div className="mt-5 space-y-3">
        <Button
          size="lg"
          disabled
          className="h-12 w-full cursor-not-allowed gap-2 border-white/10 bg-white/5 text-muted-foreground"
        >
          <Lock className="size-4" />
          PRÓXIMAMENTE
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground/70">
          Compra de SERVI directamente desde la plataforma.
          <br />
          Esta función estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
