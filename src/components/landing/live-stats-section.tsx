"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Droplets,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  Coins,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PriceChange {
  m5: number | null;
  m15: number | null;
  h1: number | null;
  h6: number | null;
  h24: number | null;
}

interface TokenStats {
  priceUsd: string | null;
  rate: number;
  priceChange: PriceChange;
  volume: {
    m5: number | null;
    m15: number | null;
    h1: number | null;
    h6: number | null;
    h24: number | null;
  };
  txns: {
    h24: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  marketCap: number | null;
  liquidity: number;
  liquidityFormatted: string;
  serviReserve: number;
  usdtReserve: number;
  totalSupply: number;
  pairAddress: string;
  dexScreenerUrl: string;
  geckoTerminalUrl: string;
  bscScanUrl: string;
  bscScanPairUrl: string;
  pairCreatedAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */

function formatPrice(price: string | null): string {
  if (!price) return "N/D";
  const num = parseFloat(price);
  if (isNaN(num) || num === 0) return "N/D";
  if (num < 0.00001) return num.toExponential(2);
  if (num < 0.01) return num.toFixed(8);
  if (num < 1) return num.toFixed(6);
  return num.toFixed(6);
}

function formatLargeNumber(num: number | null): string {
  if (num === null || num === undefined || num === 0) return "N/D";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toFixed(2);
}

function formatChange(val: number | null): { text: string; positive: boolean } | null {
  if (val === null || val === undefined) return null;
  const positive = val >= 0;
  return {
    text: (positive ? "+" : "") + val.toFixed(2) + "%",
    positive,
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ChangeBadge({ label, value }: { label: string; value: number | null }) {
  const c = formatChange(value);
  if (!c)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        {label}: <span className="text-muted-foreground/60">--</span>
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        c.positive ? "text-green-400" : "text-red-400"
      }`}
    >
      {label}: {c.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {c.text}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  href,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <Card className="group relative h-full overflow-hidden border-white/[0.08] bg-white/[0.02] backdrop-blur-sm transition-all hover:border-white/15 hover:bg-white/[0.04]">
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric/10 text-electric">
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className="mt-3 font-mono text-lg font-semibold text-foreground">{value}</p>
        {sub && <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">{sub}</div>}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }
  return content;
}

/* ------------------------------------------------------------------ */
/*  Embed tabs                                                         */
/* ------------------------------------------------------------------ */

const EMBED_TABS = [
  {
    id: "gecko" as const,
    label: "GeckoTerminal",
    buildUrl: (pair: string) =>
      `https://www.geckoterminal.com/bsc/pools/${pair}?embed=1`,
  },
  {
    id: "dexscreener" as const,
    label: "DexScreener",
    buildUrl: (pair: string) =>
      `https://dexscreener.com/bsc/${pair}?embed=1&trades=0&info=0`,
  },
];

type EmbedTabId = (typeof EMBED_TABS)[number]["id"];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function LiveStatsSection() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeEmbed, setActiveEmbed] = useState<EmbedTabId>("gecko");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  /* ---- Fetch stats ---- */
  const fetchStats = useCallback(async function () {
    try {
      const res = await fetch("/api/token-stats");
      const data = await res.json();
      if (data.error) {
        setFetchError(true);
        setStats(null);
      } else {
        setStats(data);
        setFetchError(false);
      }
      setLastUpdated(new Date());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  /* ---- Derived ---- */
  const pc = stats?.priceChange;
  const h24Txns = stats?.txns?.h24;
  const h24Vol = stats?.volume?.h24;
  const h6Vol = stats?.volume?.h6;

  const embedUrl = stats
    ? EMBED_TABS.find((t) => t.id === activeEmbed)?.buildUrl(stats.pairAddress) ?? ""
    : "";

  return (
    <section
      id="estadisticas"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <SectionHeading
            eyebrow="DATOS EN TIEMPO REAL"
            title="Estadisticas on-chain"
            description="Chart, tabla de transacciones y datos directamente de GeckoTerminal + PancakeSwap en BNB Smart Chain. Sin simulaciones."
          />
          <div className="flex items-center gap-3 shrink-0">
            <Badge className="bg-green-500/15 text-green-400 border-green-500/30 gap-1.5 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              LIVE
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && !stats ? (
          <div className="mt-10 flex items-center justify-center gap-3 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Conectando con GeckoTerminal + BSC...
            </span>
          </div>
        ) : fetchError && !stats ? (
          <div className="mt-10 flex flex-col items-center gap-3 py-16">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              No se pudieron leer los datos on-chain.
            </p>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            {/* ===== PRICE HERO ===== */}
            <Reveal className="mt-10">
              <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Precio SERVI / USDT
                      </p>
                      <p className="mt-2 font-mono text-3xl font-bold text-foreground sm:text-4xl">
                        ${formatPrice(stats?.priceUsd ?? null)}
                      </p>
                      {stats && stats.rate > 0 && (
                        <p className="mt-1 text-sm text-electric font-medium">
                          1 USDT = {stats.rate.toLocaleString("en-US", { maximumFractionDigits: 0 })} SERVI
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <ChangeBadge label="5m" value={pc?.m5 ?? null} />
                      <ChangeBadge label="15m" value={pc?.m15 ?? null} />
                      <ChangeBadge label="1H" value={pc?.h1 ?? null} />
                      <ChangeBadge label="6H" value={pc?.h6 ?? null} />
                      <ChangeBadge label="24H" value={pc?.h24 ?? null} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* ===== EMBEDDED CHART + DATA ===== */}
            <Reveal className="mt-4" delay={0.05}>
              <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  {/* Tab bar */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Chart y Datos en Vivo
                      </span>
                    </div>
                    <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1">
                      {EMBED_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveEmbed(tab.id);
                            setIframeLoaded(false);
                          }}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            activeEmbed === tab.id
                              ? "bg-electric text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* iframe */}
                  <div className="relative">
                    {!iframeLoaded && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Cargando {EMBED_TABS.find((t) => t.id === activeEmbed)?.label}...
                        </span>
                      </div>
                    )}
                    <iframe
                      key={activeEmbed}
                      src={embedUrl}
                      onLoad={() => setIframeLoaded(true)}
                      className="w-full border-0"
                      style={{ height: "560px" }}
                      title={`${activeEmbed === "gecko" ? "GeckoTerminal" : "DexScreener"} SERVI/USDT Chart`}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      loading="lazy"
                    />
                  </div>

                  {/* Source footer */}
                  <div className="flex items-center justify-center gap-2 border-t border-white/[0.06] px-4 py-2.5">
                    <span className="text-[10px] text-muted-foreground/50">
                      Datos integrados directamente de {EMBED_TABS.find((t) => t.id === activeEmbed)?.label} · BNB Smart Chain
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* ===== STATS GRID ===== */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Reveal delay={0.1}>
                <StatCard
                  label="Market Cap"
                  value={"$" + formatLargeNumber(stats?.marketCap ?? null)}
                  icon={BarChart3}
                  sub={
                    stats?.totalSupply
                      ? <span className="text-xs text-muted-foreground">Supply: {formatLargeNumber(stats.totalSupply)}</span>
                      : undefined
                  }
                />
              </Reveal>

              <Reveal delay={0.15}>
                <StatCard
                  label="Liquidez Total"
                  value={stats?.liquidityFormatted ?? "N/D"}
                  icon={Droplets}
                  sub={
                    stats?.usdtReserve ? (
                      <span className="text-xs text-muted-foreground">
                        {stats.usdtReserve.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT en pool
                      </span>
                    ) : null
                  }
                />
              </Reveal>

              <Reveal delay={0.2}>
                <StatCard
                  label="Volumen 24H"
                  value={"$" + formatLargeNumber(h24Vol ?? null)}
                  icon={Activity}
                  sub={
                    h6Vol ? (
                      <span className="text-xs text-muted-foreground">6H: ${formatLargeNumber(h6Vol)}</span>
                    ) : undefined
                  }
                />
              </Reveal>

              <Reveal delay={0.25}>
                <StatCard
                  label="Transacciones 24H"
                  value={h24Txns ? (h24Txns.buys + h24Txns.sells).toLocaleString() : "N/D"}
                  icon={Coins}
                  sub={
                    h24Txns ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <ArrowUpRight className="h-3 w-3" />
                          {h24Txns.buys} buys
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <ArrowDownRight className="h-3 w-3" />
                          {h24Txns.sells} sells
                        </span>
                      </>
                    ) : undefined
                  }
                />
              </Reveal>

              <Reveal delay={0.3}>
                <StatCard
                  label="SERVI en Pool"
                  value={
                    stats?.serviReserve
                      ? formatLargeNumber(stats.serviReserve) + " SERVI"
                      : "N/D"
                  }
                  icon={Coins}
                />
              </Reveal>

              <Reveal delay={0.35}>
                <StatCard
                  label="Abrir en GeckoTerminal"
                  value="Ver pagina completa"
                  icon={ExternalLink}
                  href={stats?.geckoTerminalUrl}
                />
              </Reveal>
            </div>

            {/* ===== FOOTER ===== */}
            {lastUpdated && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-[11px] text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" />
                  Ultima lectura: {lastUpdated.toLocaleTimeString("es-ES")} · Auto-refresh cada 15s
                </p>
                <div className="flex gap-4">
                  <a
                    href={stats?.bscScanPairUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-muted-foreground/60 hover:text-electric transition-colors"
                  >
                    Par en BscScan →
                  </a>
                  <a
                    href={stats?.geckoTerminalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-muted-foreground/60 hover:text-electric transition-colors"
                  >
                    GeckoTerminal →
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
