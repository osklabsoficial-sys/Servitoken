"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Zap,
  Globe,
  ExternalLink,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Fuel,
  Copy,
  Check,
  BarChart3,
  Droplets,
  Coins,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectWallet } from "@/components/landing/connect-wallet";
import { SwapPanel } from "@/components/landing/swap-panel";
import { Logo } from "@/components/landing/logo";
import { BscLogo, PancakeSwapLogo, UsdtLogo } from "@/components/landing/brand-logos";
import { useWalletStore } from "@/lib/wallet-store";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { formatUnits } from "viem";
import { SERVI_ADDRESS } from "@/lib/contracts";
import { project } from "@/lib/token-data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LiveData {
  priceUsd: string | null;
  rate: number;
  priceChange: {
    m5: number | null;
    m15: number | null;
    h1: number | null;
    h6: number | null;
    h24: number | null;
  };
  volume: {
    m5: number | null;
    h1: number | null;
    h6: number | null;
    h24: number | null;
  };
  marketCap: number | null;
  liquidity: number;
  liquidityFormatted: string;
  totalSupply: number;
  pairAddress: string;
  geckoTerminalUrl: string;
  bscScanUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */

function fmtPrice(p: string | null): string {
  if (!p) return "--";
  const n = parseFloat(p);
  if (isNaN(n) || n === 0) return "--";
  if (n < 0.00001) return n.toExponential(2);
  if (n < 0.01) return n.toFixed(8);
  return n.toFixed(6);
}

function fmtBig(n: number | null): string {
  if (!n) return "--";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(2);
}

function fmtChange(v: number | null) {
  if (v === null || v === undefined) return null;
  const pos = v >= 0;
  return { text: (pos ? "+" : "") + v.toFixed(2) + "%", pos };
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ChangePill({ label, value }: { label: string; value: number | null }) {
  const c = fmtChange(value);
  if (!c)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground">
        {label}: --
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        c.pos
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      {label}
      {c.pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {c.text}
    </span>
  );
}

function LivePriceBar({ data }: { data: LiveData | null }) {
  if (!data) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando precio...</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-lg font-bold text-foreground sm:text-xl">
        ${fmtPrice(data.priceUsd)}
      </span>
      <ChangePill label="5m" value={data.priceChange.m5} />
      <ChangePill label="1H" value={data.priceChange.h1} />
      <ChangePill label="24H" value={data.priceChange.h24} />
      <span className="hidden sm:inline text-xs text-muted-foreground">
        1 USDT = {data.rate > 0 ? Math.round(data.rate).toLocaleString() : "--"} SERVI
      </span>
    </div>
  );
}

function StatMini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-electric/10 text-electric">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-electric/15 text-electric text-sm font-bold">
          {step}
        </div>
        {step < 3 && <div className="mt-2 w-px flex-1 bg-white/10" />}
      </div>
      <div className="pb-8">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

function BalanceCard() {
  const { address, isConnected } = useWalletStore();
  const { bnb, servi, usdt } = useWalletBalances();
  const [copied, setCopied] = useState(false);

  if (!isConnected || !address) return null;

  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const fmt = (v: bigint, d: number) => {
    const n = parseFloat(formatUnits(v, d));
    if (n === 0) return "0";
    return n.toFixed(4).replace(/\.?0+$/, "");
  };

  return (
    <Card className="border-white/[0.08] bg-white/[0.02]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-electric" />
            <span className="text-sm font-medium">Tu Wallet</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(address);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono">{short}</span>
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
            <BscLogo className="mx-auto h-5 w-5 mb-1" />
            <p className="font-mono text-xs font-semibold">
              {bnb.value ? fmt(bnb.value, 18) : "..."}
            </p>
            <p className="text-[10px] text-muted-foreground">BNB</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
            <UsdtLogo className="mx-auto h-5 w-5 mb-1" />
            <p className="font-mono text-xs font-semibold">
              {usdt.value ? fmt(usdt.value, 18) : "..."}
            </p>
            <p className="text-[10px] text-muted-foreground">USDT</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
            <Logo size="xs" showWordmark={false} />
            <p className="mt-1 font-mono text-xs font-semibold">
              {servi.value ? fmt(servi.value, 18) : "..."}
            </p>
            <p className="text-[10px] text-muted-foreground">SERVI</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export function CompraPageClient() {
  const { isConnected, address } = useWalletStore();
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeEmbed, setActiveEmbed] = useState<"gecko" | "dex">("gecko");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  /* Fetch live data */
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/token-stats");
      const data = await res.json();
      if (!data.error) {
        setLiveData(data);
      }
      setLastUpdated(new Date());
    } catch {
      /* silent */
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const iv = setInterval(fetchLiveData, 15_000);
    return () => clearInterval(iv);
  }, [fetchLiveData]);

  const pairAddr = liveData?.pairAddress ?? "0xad48f36f851ce4dca85a07bb3d6a573a4c70ed18";
  const embedUrl =
    activeEmbed === "gecko"
      ? `https://www.geckoterminal.com/bsc/pools/${pairAddr}?embed=1`
      : `https://dexscreener.com/bsc/${pairAddr}?embed=1&trades=0&info=0`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Inicio
              </Link>
            </Button>
            <div className="h-5 w-px bg-white/10" />
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Live price ticker in header */}
            <div className="hidden md:flex items-center">
              <LivePriceBar data={liveData} />
            </div>
            <ConnectWallet variant="compact" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />
            <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-electric/8 blur-[160px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm mb-6">
                  <BscLogo className="h-3.5 w-3.5" />
                  BNB Smart Chain · PancakeSwap V2 · BEP-20
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                Compra{" "}
                <span className="text-gradient-gold">SERVI</span>
                <br className="hidden sm:block" />{" "}
                <span className="text-foreground/80">directo on-chain</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
              >
                Intercambia USDT por SERVI al precio real del mercado.
                Sin intermediarios, sin comisiones ocultas.
                Tu wallet, tus tokens, tu control.
              </motion.p>

              {/* Live price hero (mobile visible) */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-8 flex flex-col items-center gap-3"
              >
                <div className="md:hidden">
                  <LivePriceBar data={liveData} />
                </div>

                {liveData && !loadingData && (
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Market Cap: ${fmtBig(liveData.marketCap)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5" />
                      Liquidez: {liveData.liquidityFormatted}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      Vol 24H: ${fmtBig(liveData.volume.h24)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Precio en vivo · GeckoTerminal API
                    {lastUpdated ? ` · ${lastUpdated.toLocaleTimeString("es-ES")}` : ""}
                  </span>
                </div>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
              >
                <TrustBadge icon={<Shield className="h-4 w-4" />} text="Contrato verificado" />
                <TrustBadge icon={<Zap className="h-4 w-4" />} text="Transacciones instantáneas" />
                <TrustBadge icon={<Globe className="h-4 w-4" />} text="Descentralizado" />
                <TrustBadge icon={<Lock className="h-4 w-4" />} text="Sin intermediarios" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ============ SWAP + SIDEBAR ============ */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left column: Swap + Balance */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <SwapPanel />
              </motion.div>

              {/* Wallet balance when connected */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <BalanceCard />
              </motion.div>
            </div>

            {/* Right column: Info sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="space-y-6"
            >
              {/* Token info card */}
              <Card className="border-white/[0.08] bg-white/[0.02]">
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Coins className="h-4 w-4 text-electric" />
                    Informacion del Token
                  </h3>
                  <InfoRow label="Contrato" value={`${project.contractAddress.slice(0, 6)}...${project.contractAddress.slice(-4)}`} mono />
                  <InfoRow label="Red" value="BNB Smart Chain" />
                  <InfoRow label="Par" value="SERVI / USDT" />
                  <InfoRow label="Estandar" value="BEP-20" />
                  <InfoRow label="Supply" value={project.totalSupply} />
                  <InfoRow label="Router" value="PancakeSwap V2" />
                  <a
                    href={`https://bscscan.com/token/${project.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-electric hover:underline pt-1"
                  >
                    Ver contrato en BscScan <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>

              {/* External links */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 gap-2 border-white/10"
                  asChild
                >
                  <a
                    href={liveData?.geckoTerminalUrl ?? `https://www.geckoterminal.com/bsc/pools/${pairAddr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TrendingUp className="h-4 w-4" />
                    GeckoTerminal
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 gap-2 border-white/10"
                  asChild
                >
                  <a
                    href={project.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PancakeSwapLogo className="h-4 w-4" />
                    PancakeSwap
                  </a>
                </Button>
              </div>

              {/* Security card */}
              <Card className="border-green-500/20 bg-green-500/[0.03]">
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-green-400">
                    <Shield className="h-4 w-4" />
                    Compra 100% segura
                  </h3>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      Transaccion directa en la blockchain de BSC
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      Smart contract verificado y auditado
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      Sin custodia: tus fondos van directo a tu wallet
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      Slippage configurable para proteccion de precio
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      Confirmacion de transaccion verificable en BscScan
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ============ LIVE CHART EMBED ============ */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Chart en Vivo</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Datos directamente de GeckoTerminal y DexScreener
                </p>
              </div>
              <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1">
                <button
                  onClick={() => { setActiveEmbed("gecko"); setIframeLoaded(false); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    activeEmbed === "gecko"
                      ? "bg-electric text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  GeckoTerminal
                </button>
                <button
                  onClick={() => { setActiveEmbed("dex"); setIframeLoaded(false); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    activeEmbed === "dex"
                      ? "bg-electric text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  DexScreener
                </button>
              </div>
            </div>
            <Card className="border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="relative">
                {!iframeLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Cargando {activeEmbed === "gecko" ? "GeckoTerminal" : "DexScreener"}...
                    </span>
                  </div>
                )}
                <iframe
                  key={activeEmbed}
                  src={embedUrl}
                  onLoad={() => setIframeLoaded(true)}
                  className="w-full border-0"
                  style={{ height: "520px" }}
                  title="SERVI/USDT Chart"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  loading="lazy"
                />
              </div>
            </Card>
          </div>
        </section>

        {/* ============ COMO COMPRAR ============ */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                COMO FUNCIONA
              </p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Compra en 3 pasos
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Sin registros, sin KYC, sin formularios. Solo tu wallet.
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <StepCard
                step={1}
                title="Conecta tu wallet"
                desc={`Haz clic en "Conectar Wallet" y selecciona MetaMask, Trust Wallet, WalletConnect o cualquiera de las 300+ wallets compatibles. Asegurate de estar en BNB Smart Chain.`}
              />
              <StepCard
                step={2}
                title="Ingresa la cantidad"
                desc="Escribe cuanto USDT quieres cambiar por SERVI. El precio se consulta en tiempo real desde PancakeSwap V2. Puedes ajustar el slippage segun tu tolerancia al riesgo."
              />
              <StepCard
                step={3}
                title="Confirma y recibe"
                desc="Revisa el resumen de la transaccion y confirma en tu wallet. Los SERVI llegan directamente a tu direccion. Verifica la transaccion en BscScan."
              />
            </div>
          </div>
        </section>

        {/* ============ STATS GRID ============ */}
        {liveData && !loadingData && (
          <section className="border-t border-white/5">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatMini
                  icon={TrendingUp}
                  label="Precio"
                  value={"$" + fmtPrice(liveData.priceUsd)}
                />
                <StatMini
                  icon={BarChart3}
                  label="Market Cap"
                  value={"$" + fmtBig(liveData.marketCap)}
                />
                <StatMini
                  icon={Droplets}
                  label="Liquidez"
                  value={liveData.liquidityFormatted}
                />
                <StatMini
                  icon={Activity}
                  label="Volumen 24H"
                  value={"$" + fmtBig(liveData.volume.h24)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ============ FAQ ============ */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                PREGUNTAS FRECUENTES
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Antes de comprar</h2>
            </div>

            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardContent className="px-6">
                <FaqItem
                  q="¿Necesito registrarme para comprar?"
                  a="No. Solo necesitas una wallet compatible con EIP-1193 (MetaMask, Trust Wallet, etc.) o WalletConnect. No hay formularios, ni KYC, ni cuentas que crear."
                />
                <FaqItem
                  q="¿Cual es el precio de SERVI?"
                  a="El precio se obtiene en tiempo real desde PancakeSwap V2 en BNB Smart Chain. No hay margen ni comision adicional: pagas el precio exacto del mercado."
                />
                <FaqItem
                  q="¿Cuanto tiempo tarda la transaccion?"
                  a="Las transacciones en BSC se confirman en aproximadamente 3-5 segundos. Una vez confirmada, los SERVI aparecen inmediatamente en tu wallet."
                />
                <FaqItem
                  q="¿Que es el slippage?"
                  a="El slippage es la diferencia maxima que toleras entre el precio cotizado y el precio de ejecucion. Un slippage mas alto da mas probabilidad de que la transaccion se complete, pero podrias recibir un poco menos de tokens. Recomendamos 0.5% - 1%."
                />
                <FaqItem
                  q="¿Es seguro intercambiar aqui?"
                  a="Si. La transaccion se ejecuta directamente en la blockchain de BSC a traves del contrato de PancakeSwap V2. Tus fondos nunca pasan por nuestros servidores. Puedes verificar cada transaccion en BscScan."
                />
                <FaqItem
                  q="¿Que necesito para comprar?"
                  a="1) Una wallet (MetaMask, Trust, etc.), 2) Estar conectado a BNB Smart Chain, 3) Tener USDT en tu wallet para intercambiar por SERVI, 4) Un poco de BNB para pagar el gas de la transaccion (aprox. $0.05)."
                />
                <FaqItem
                  q="¿Puedo vender SERVI por USDT aqui?"
                  a="Si. Usa el boton de invertir direccion (flechas ↑↓) en el panel de intercambio para cambiar de USDT→SERVI a SERVI→USDT."
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ============ CTA FINAL ============ */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Empieza a comprar <span className="text-gradient-gold">SERVI</span> ahora
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Precio real, sin comisiones ocultas, directo a tu wallet.
            </p>
            <div className="mt-6">
              {!isConnected ? (
                <ConnectWallet variant="hero" />
              ) : (
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_8px_24px_-8px_rgba(46,107,255,0.6)]"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Ir al intercambio
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/5 py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size="xs" />
            <span>Servitoken © {new Date().getFullYear()}</span>
          </div>
          <p>Token de utilidad · No es asesoramiento financiero</p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small utility components                                           */
/* ------------------------------------------------------------------ */

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs ${mono ? "font-mono" : "font-medium"} text-foreground`}>{value}</span>
    </div>
  );
}
