"use client";

import { useState } from "react";
import Link from "next/link";
import { SwapPanel } from "@/components/landing/swap-panel";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";
import { Info, AlertTriangle, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export function SwapSection() {
  return (
    <section
      id="compra"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          eyebrow="INTERCAMBIO ON-CHAIN"
          title="Cambiar Tokens"
          description="Intercambia USDT y SERVI directamente desde aqui. Las transacciones se ejecutan en BNB Smart Chain a traves de PancakeSwap V2."
        />

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 max-w-md">
            <SwapPanel />
            <Link
              href="/compra"
              className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-electric hover:underline"
            >
              Ir a la pagina de compra completa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mx-auto mt-8 max-w-md">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <div className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground/80">Seguridad:</strong> Tu wallet firma todas las transacciones.
                    Nunca almacenamos claves privadas.
                  </p>
                  <p>
                    <strong className="text-foreground/80">Router:</strong> PancakeSwap V2 en BNB Smart Chain.
                    Necesitaras BNB para pagar las tarifas de gas.
                  </p>
                  <p>
                    <strong className="text-foreground/80">Verificacion:</strong> Cada transaccion puede verificarse
                    publicamente en BscScan con su hash real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
