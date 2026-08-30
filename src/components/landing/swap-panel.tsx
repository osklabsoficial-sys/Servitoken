"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { formatUnits } from "viem";
import { useWalletStore } from "@/lib/wallet-store";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowDownUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Fuel,
  Wallet,
  ShieldCheck,
  ArrowDown,
} from "lucide-react";
import { useSwap, type SwapDirection } from "@/hooks/use-swap";
import { ConnectWallet } from "@/components/landing/connect-wallet";
import { SERVI_ADDRESS, USDT_ADDRESS } from "@/lib/contracts";

const BSCSCAN_BASE = "https://bscscan.com";

const SLIPPAGE_OPTIONS = [
  { label: "0.5%", value: 0.5 },
  { label: "1%", value: 1 },
  { label: "2%", value: 2 },
];

function formatTokenAmount(raw: bigint | undefined, decimals: number, maxDecimals: number): string {
  if (raw === undefined || raw === null) return "0";
  const full = formatUnits(raw, decimals);
  const num = parseFloat(full);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

export function SwapPanel() {
  const { address, isConnected, chainId } = useWalletStore();
  const BSC_CHAIN_ID = 56;
  const { bnb: bnbBalanceData } = useWalletBalances();
  const {
    state,
    stateLabel,
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
  } = useSwap();

  const [inputAmount, setInputAmount] = useState("");
  const [customSlippage, setCustomSlippage] = useState("");
  const [showCustomSlippage, setShowCustomSlippage] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bnbBalance = bnbBalanceData.value ? { value: bnbBalanceData.value } : null;

  const fromToken =
    swapDirection === "USDT_TO_SERVI" ? USDT_ADDRESS : SERVI_ADDRESS;
  const fromSymbol = swapDirection === "USDT_TO_SERVI" ? "USDT" : "SERVI";
  const toSymbol = swapDirection === "USDT_TO_SERVI" ? "SERVI" : "USDT";
  const fromDecimals = 18;
  const toDecimals = 18;
  const fromMaxDisplay = swapDirection === "USDT_TO_SERVI" ? 2 : 2;
  const toMaxDisplay = swapDirection === "USDT_TO_SERVI" ? 6 : 2;

  const handleInputChange = useCallback(
    function (value: string) {
      setInputAmount(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value || value === "" || value === "." || value === "0") {
        return;
      }
      debounceRef.current = setTimeout(function () {
        fetchQuote(value);
      }, 500);
    },
    [fetchQuote]
  );

  useEffect(function () {
    return function () {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleDirectionToggle() {
    const newDir: SwapDirection =
      swapDirection === "USDT_TO_SERVI" ? "SERVI_TO_USDT" : "USDT_TO_SERVI";
    setSwapDirection(newDir);
    setInputAmount("");
    reset();
  }

  function handleSetMax() {
    if (!fromBalanceRaw) return;
    const formatted = formatUnits(fromBalanceRaw, fromDecimals);
    const maxUsable = parseFloat(formatted);
    if (isNaN(maxUsable) || maxUsable <= 0) return;
    const val = swapDirection === "USDT_TO_SERVI"
      ? Math.floor(maxUsable * 100) / 100
      : maxUsable;
    const valStr = val.toString();
    setInputAmount(valStr);
    fetchQuote(valStr);
  }

  function handleSlippageSelect(value: number) {
    setCustomSlippage("");
    setShowCustomSlippage(false);
    setSlippage(value);
  }

  function handleCustomSlippage(val: string) {
    setCustomSlippage(val);
    setShowCustomSlippage(true);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setSlippage(num);
    }
  }

  function getButtonText(): string {
    switch (state) {
      case "QUOTING":
        return "Cotizando...";
      case "QUOTED":
        return "Cambiar";
      case "APPROVING":
        return "Aprobando...";
      case "APPROVED":
        return "Aprobado, intercambiando...";
      case "SWAPPING":
        return "Firmando transaccion...";
      case "WAITING_RECEIPT":
        return "Esperando confirmacion...";
      case "CONFIRMED":
        return "Intercambio exitoso";
      case "FAILED":
        return "Error";
      case "REVERTED":
        return "Revertido";
      case "INSUFFICIENT_BALANCE":
        return "Saldo insuficiente";
      default:
        return "Cambiar";
    }
  }

  function getButtonVariant():
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link" {
    if (state === "FAILED" || state === "REVERTED") return "destructive";
    if (state === "CONFIRMED") return "secondary";
    return "default";
  }

  const isWrongNetwork = chainId !== null && chainId !== BSC_CHAIN_ID;
  const isLoading =
    state === "QUOTING" ||
    state === "APPROVING" ||
    state === "SWAPPING" ||
    state === "WAITING_RECEIPT";
  const showSuccess = state === "CONFIRMED";
  const showError = state === "FAILED" || state === "REVERTED";

  if (!isConnected || !address) {
    return (
      <Card className="w-full border-white/[0.08] bg-white/[0.02]">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-base font-semibold text-foreground">
              Conecta tu wallet para cambiar tokens
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Necesitas una wallet conectada en BSC para intercambiar USDT y SERVI.
            </p>
          </div>
          <ConnectWallet />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-white/[0.08] bg-white/[0.02]">
      <CardContent className="p-5 sm:p-6">
        {showSuccess && swapTxHash ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Intercambio confirmado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tu transaccion fue confirmada en BSC.
              </p>
            </div>

            <div className="w-full space-y-3 text-left">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Hash de transaccion
                </p>
                <p className="mt-1.5 break-all font-mono text-xs text-electric">
                  {swapTxHash}
                </p>
                <a
                  href={`${BSCSCAN_BASE}/tx/${swapTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-electric hover:underline"
                >
                  Ver en BscScan
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {swapReceipt && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Gas usado
                      </p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {swapReceipt.gasUsed?.toString() ?? "N/D"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Bloque
                      </p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {swapReceipt.blockNumber?.toString() ?? "N/D"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={reset}
              className="mt-2 w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Nuevo intercambio
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Network warning */}
            {isWrongNetwork && (
              <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-yellow-400" />
                <p className="text-sm text-yellow-300">
                  Conectado a la red equivocada. Cambia a BSC.
                </p>
              </div>
            )}

            {/* BNB Balance */}
            {bnbBalance && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Fuel className="h-3.5 w-3.5" />
                  BNB para gas
                </span>
                <span className="font-mono">
                  {formatUnits(bnbBalance.value, 18)} BNB
                </span>
              </div>
            )}

            {/* From token input */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Pagas
                </span>
                {fromBalanceRaw && (
                  <button
                    type="button"
                    onClick={handleSetMax}
                    className="text-[11px] font-medium text-electric hover:underline"
                  >
                    Max: {formatTokenAmount(fromBalanceRaw, fromDecimals, fromMaxDisplay)} {fromSymbol}
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={inputAmount}
                  onChange={function (e) {
                    handleInputChange(e.target.value);
                  }}
                  disabled={isSwapDisabled}
                  className="flex-1 border-0 bg-transparent text-xl font-semibold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
                />
                <Badge className="shrink-0 border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-foreground">
                  {fromSymbol}
                </Badge>
              </div>
            </div>

            {/* Swap direction toggle */}
            <div className="flex justify-center -my-1 relative z-10">
              <button
                type="button"
                onClick={handleDirectionToggle}
                disabled={isSwapDisabled}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-background text-foreground shadow-sm transition-all hover:border-white/20 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cambiar direccion"
              >
                <ArrowDownUp className="h-4 w-4" />
              </button>
            </div>

            {/* To token output */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Recibes
              </span>
              <div className="mt-2 flex items-center gap-3">
                {state === "QUOTING" ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Cotizando...</span>
                  </div>
                ) : quote ? (
                  <span className="flex-1 text-xl font-semibold text-foreground">
                    {parseFloat(quote.amountOutFormatted).toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: toMaxDisplay,
                    })}
                  </span>
                ) : (
                  <span className="flex-1 text-xl font-semibold text-muted-foreground/40">
                    0
                  </span>
                )}
                <Badge className="shrink-0 border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-foreground">
                  {toSymbol}
                </Badge>
              </div>
            </div>

            {/* Slippage selector */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Slippage tolerado
              </p>
              <div className="flex items-center gap-2">
                {SLIPPAGE_OPTIONS.map(function (opt) {
                  const isActive = !showCustomSlippage && slippage === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={function () {
                        handleSlippageSelect(opt.value);
                      }}
                      disabled={isSwapDisabled}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                        isActive
                          ? "border-electric/50 bg-electric/10 text-electric"
                          : "border-white/[0.08] text-muted-foreground hover:border-white/15 hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                <div className="relative flex-1">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={function (e) {
                      handleCustomSlippage(e.target.value);
                    }}
                    disabled={isSwapDisabled}
                    className={`h-8 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 ${
                      showCustomSlippage
                        ? "text-electric"
                        : "text-muted-foreground"
                    }`}
                  />
                  {showCustomSlippage && customSlippage && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error display */}
            {showError && error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-300">
                    {state === "REVERTED" ? "Transaccion revertida" : "Error"}
                  </p>
                  <p className="mt-0.5 text-xs text-red-300/70 line-clamp-2">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="shrink-0 rounded-lg p-1 text-red-300/70 hover:bg-red-500/20 hover:text-red-300"
                  aria-label="Reintentar"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Action button */}
            <Button
              variant={getButtonVariant()}
              size="lg"
              className="w-full h-12 gap-2"
              onClick={function () {
                if (state === "QUOTED" && quote && inputAmount) {
                  setShowConfirm(true);
                } else {
                  executeSwap();
                }
              }}
              disabled={
                isSwapDisabled ||
                !inputAmount ||
                parseFloat(inputAmount) <= 0 ||
                !quote ||
                isWrongNetwork ||
                showError
              }
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {showError ? "Reintentar" : getButtonText()}
            </Button>

            {/* State indicator */}
            {state !== "IDLE" && state !== "CONFIRMED" && state !== "FAILED" && state !== "REVERTED" && (
              <p className="text-center text-[11px] text-muted-foreground">
                {stateLabel}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Confirmation dialog before swap */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="border-white/[0.08] bg-background sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-brand-green" />
              Confirmar intercambio
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Vas a cambiar</span>
                    <span className="text-sm font-semibold text-foreground">
                      {inputAmount} {fromSymbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Por aproximadamente</span>
                    <span className="text-sm font-semibold text-foreground">
                      {quote
                        ? parseFloat(quote.amountOutFormatted).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: toMaxDisplay,
                          })
                        : "0"}{" "}
                      {toSymbol}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Slippage maximo
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">{slippage}%</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Red
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">BNB Smart Chain</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Router
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">PancakeSwap V2</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Ruta
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {fromSymbol} → {toSymbol} (directo)
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Se abrira tu wallet para firmar la transaccion.{" "}
                  {bnbBalance ? (
                    <>
                      Tu saldo de BNB para gas: {" "}
                      <span className="font-mono text-foreground">
                        {parseFloat(formatUnits(bnbBalance.value, 18)).toFixed(4)} BNB
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={function () {
                setShowConfirm(false);
                executeSwap();
              }}
              className="w-full h-11 bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_8px_24px_-8px_rgba(46,107,255,0.6)]"
            >
              Confirmar intercambio
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-11">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
