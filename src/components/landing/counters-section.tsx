"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TrendingUp, Coins, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/landing/section-primitives";
import { AnimatedCounter } from "@/components/landing/animated-counter";

interface Metrics {
  totalSupply: number;
  recentTransfers: number;
  serviInPool: number;
  pairSupply: number;
}

const COUNTER_ITEMS = [
  {
    key: "totalSupply",
    label: "Supply Total",
    icon: Coins,
    suffix: " SERVI",
    decimals: 0,
    gradient: "from-electric to-electric-bright",
  },
  {
    key: "recentTransfers",
    label: "Transacciones Recientes",
    icon: TrendingUp,
    suffix: " txns",
    decimals: 0,
    gradient: "from-brand-green to-emerald-400",
  },
  {
    key: "serviInPool",
    label: "SERVI en Liquidez",
    icon: Droplets,
    suffix: " SERVI",
    decimals: 0,
    gradient: "from-gold to-gold-bright",
  },
];

export function CountersSection() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const initialized = useRef(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/onchain-metrics");
      const data = await res.json();
      if (!data.error) {
        setMetrics(data);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const load = async () => {
      await fetchMetrics();
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return (
    <section className="relative border-t border-white/5 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              MÉTRICAS ON-CHAIN
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Números que hablan por sí solos
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Datos reales leídos directamente de la blockchain de BNB Smart Chain
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {COUNTER_ITEMS.map((item, i) => {
            const value = metrics ? (metrics[item.key as keyof Metrics] as number) : 0;
            return (
              <Reveal key={item.key} delay={i * 0.1}>
                <Card className="group relative overflow-hidden border-white/[0.08] bg-white/[0.02] backdrop-blur-sm transition-all hover:border-white/15">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 font-mono text-2xl font-bold sm:text-3xl text-foreground">
                      {metrics ? (
                        <AnimatedCounter
                          target={value}
                          suffix={item.suffix}
                          decimals={item.decimals}
                          duration={2500}
                        />
                      ) : (
                        <span className="animate-pulse">--</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}