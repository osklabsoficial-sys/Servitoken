"use client";

import { ArrowDownUp, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/section-primitives";
import { Reveal } from "@/components/landing/section-primitives";

export function PurchaseSection() {
  return (
    <section
      id="compra"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[260px] w-[600px] -translate-x-1/2 rounded-full bg-electric/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          eyebrow="COMPRA EN"
          title="Comprar SERVI"
          description="Realiza tu compra directamente a través de PancakeSwap.
          Conecta tu wallet, selecciona la cantidad y confirma la transacción."
        />

        <div className="mx-auto mt-10 max-w-[500px]">
          <Reveal>
            <div className="glass-card relative overflow-hidden rounded-2xl p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Comprar SERVI
              </p>

              {/* You pay — USDT */}
              <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Pagas
                  </label>
                  <span className="text-xs font-semibold text-foreground">
                    USDT
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">
                  1
                </div>
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
                  <label className="text-xs text-muted-foreground">
                    Recibes
                  </label>
                  <span className="text-xs font-semibold text-foreground">
                    SERVI
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">
                  48.114,13
                </div>
              </div>

              {/* Quote info */}
              <div className="mt-4 space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Tasa estimada</span>
                  <span className="font-mono text-muted-foreground">
                    1 USDT ≈ 48.114,13 SERVI
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">
                    Slippage máximo
                  </span>
                  <span className="text-muted-foreground">2.0%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Router</span>
                  <span className="text-muted-foreground">
                    PancakeSwap V2
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Red</span>
                  <span className="text-muted-foreground">
                    BNB Smart Chain
                  </span>
                </div>
              </div>

              {/* Gas warning */}
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400/80" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Necesitarás BNB para pagar las tarifas de gas de la transacción.
                  Verifica siempre la dirección del contrato antes de operar.
                </p>
              </div>

              {/* CTA: PRÓXIMAMENTE */}
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
          </Reveal>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground/70">
            Interfaz oficial de PancakeSwap. Tu wallet interactúa directamente
            con el contrato — Servitoken no tiene acceso a tus fondos.
          </p>
        </div>
      </div>
    </section>
  );
}
