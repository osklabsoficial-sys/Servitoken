"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletStore } from "@/lib/wallet-store";
import { createPublicClient, http, formatUnits, type Address } from "viem";
import { bsc } from "viem/chains";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";
import { SERVI_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { AnimatedCounter } from "@/components/landing/animated-counter";

const publicClient = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed.binance.org/"),
});

interface PriceData {
  priceUsd: string | null;
}

function getIconColor(type: string) {
  return type === "BUY"
    ? "bg-green-500/10 text-green-400"
    : "bg-red-500/10 text-red-400";
}

function getTextColor(type: string) {
  return type === "BUY" ? "text-green-400" : "text-red-400";
}

function getTypeLabel(type: string) {
  return type === "BUY" ? "Compra" : "Venta";
}

export function PortfolioDashboard() {
  const { address, isConnected } = useWalletStore();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [serviBalance, setServiBalance] = useState<bigint | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [txns, setTxns] = useState<{
    hash: string;
    type: "BUY" | "SELL";
    amount: number;
    timestamp: number;
    bscscanUrl: string;
  }[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    setBalanceLoading(true);
    try {
      const bal = await publicClient.readContract({
        address: SERVI_ADDRESS as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      }) as bigint;
      setServiBalance(bal);
    } catch {
    }
    setBalanceLoading(false);
  }, [address]);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/token-stats");
      const data = await res.json();
      if (!data.error) setPriceData(data);
    } catch {
    }
  }, []);

  const fetchTxns = useCallback(async () => {
    if (!address) return;
    setLoadingTxns(true);
    try {
      const res = await fetch(`/api/wallet-txns?wallet=${address}`);
      const data = await res.json();
      if (data.transactions) setTxns(data.transactions);
    } catch {
    }
    finally {
      setLoadingTxns(false);
    }
  }, [address]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 15_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (address) fetchTxns();
  }, [address, fetchTxns]);

  const balance = serviBalance ? Number(serviBalance) / 1e18 : 0;
  const price = priceData?.priceUsd ? parseFloat(priceData.priceUsd) : 0;
  const valueUsd = balance * price;
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  if (!isConnected) {
    return (
      <section id="portafolio" className="relative border-t border-white/5 bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <Reveal>
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <CardContent className="flex flex-col items-center gap-4 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-electric/10 text-electric">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Tu Portafolio</h3>
                <p className="max-w-sm text-center text-sm text-muted-foreground">
                  Conecta tu wallet para ver tu saldo de SERVI, valor en USD e historial de transacciones.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="portafolio" className="relative border-t border-white/5 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading
            eyebrow="TU PORTAFOLIO"
            title="Dashboard de SERVI"
            description={`Conectado como ${shortAddr}`}
            align="left"
          />
          <Button variant="outline" size="sm" onClick={() => { fetchPrice(); fetchTxns(); fetchBalance(); }} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Reveal>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardContent className="p-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Saldo SERVI
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                  {balanceLoading ? (
                    <Loader2 className="inline h-5 w-5 animate-spin" />
                  ) : (
                    <AnimatedCounter target={balance} decimals={2} duration={1500} />
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">SERVI tokens</p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardContent className="p-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Valor Estimado
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                  {price > 0 ? (
                    <>
                      $<AnimatedCounter target={valueUsd} decimals={2} duration={1500} />
                    </>
                  ) : (
                    "--"
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Precio: ${price > 0 ? price.toFixed(10) : "--"} / SERVI
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardContent className="p-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Estado
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-green-500/15 text-green-400 border-green-500/30 gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Conectado
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">BNB Smart Chain</p>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Transaction History */}
        <Reveal delay={0.15}>
          <Card className="border-white/[0.08] bg-white/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-electric" />
                  Historial de Transacciones
                </CardTitle>
                {txns.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Ultimas {txns.length} txns on-chain
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingTxns && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Leyendo transacciones de BSC...
                  </span>
                </div>
              )}
              {!loadingTxns && txns.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No se encontraron swaps de SERVI en las ultimas ~8 horas.
                  </p>
                </div>
              )}
              {!loadingTxns && txns.length > 0 && (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {txns.map((txn, i) => (
                    <div
                      key={txn.hash + i}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${getIconColor(txn.type)}`}
                        >
                          {txn.type === "BUY" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${getTextColor(txn.type)}`}
                          >
                            {getTypeLabel(txn.type)}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {txn.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} SERVI
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {txn.timestamp > 0 && (
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">
                            {new Date(txn.timestamp * 1000).toLocaleString("es-ES")}
                          </span>
                        )}
                        <a
                          href={txn.bscscanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-electric transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
