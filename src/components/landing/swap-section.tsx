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

        <Reveal delay={0.08}>
          <div className="mx-auto mt-10 max-w-md">
            <Link
              href="/compra"
              className="group flex items-center gap-3.5 rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/10 to-transparent p-4 transition-all hover:border-gold/45 hover:bg-gold/15"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-white/20">
                <svg viewBox="0 0 24 24" className="size-6" fill="#003087" aria-hidden>
                  <path d="M7.076 21.337H2.47a.64.64 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Compra con PayPal
                  </span>
                  <span className="inline-flex items-center rounded-full bg-brand-green/15 px-2 py-0.5 text-[9px] font-semibold text-brand-green ring-1 ring-brand-green/30">
                    NUEVO
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Paga en USD y recibe SERVI al instante en tu billetera interna.
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-6 max-w-md">
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
