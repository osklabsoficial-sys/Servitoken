"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  ExternalLink,
  X,
  Network,
  BarChart3,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";
import { project, pricingSection } from "@/lib/token-data";
import { toast } from "sonner";

const PANCAKESWAP_URL =
  "https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443";

function QrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="QR de PancakeSwap"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-navy p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
            <QrCode className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Escanea para comprar
            </p>
            <p className="text-[11px] text-muted-foreground">
              PancakeSwap · SERVI/USDT
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-center rounded-xl border border-white/[0.08] bg-white p-3">
          <Image
            src="/pancakeswap-qr.png"
            alt="QR PancakeSwap para comprar SERVI"
            width={280}
            height={280}
            className="h-auto w-full max-w-[280px]"
          />
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Escanea este código con la cámara de tu teléfono para abrir
          PancakeSwap y comprar SERVI directamente.
        </p>
      </div>
    </div>
  );
}

export function PricingSection() {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const hasContract = project.contractAddress.trim().length > 0;
  const hasMarketUrl = project.marketUrl.trim().length > 0;

  const copyContract = async () => {
    if (!hasContract) return;
    try {
      await navigator.clipboard.writeText(project.contractAddress);
      setCopied(true);
      toast.success("Contrato copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar la dirección");
    }
  };

  return (
    <>
      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} />

      <section
        id="precio"
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
            eyebrow={pricingSection.eyebrow}
            title={pricingSection.title}
            description="Compra SERVI en PancakeSwap y consulta el mercado en DexScreener."
          />

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-2">
            {/* Panel de precio + CTA */}
            <Reveal>
              <div className="glass-card relative h-full overflow-hidden rounded-3xl p-6 sm:p-8">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Información de compra
                </p>

                {/* Precio → enlace al mercado */}
                <div className="mt-5 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-electric/[0.08] via-white/[0.02] to-transparent p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Precio actual
                  </p>
                  {project.marketUrl ? (
                    <a
                      href={project.marketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 font-mono text-xl font-semibold leading-none text-electric-bright transition-colors hover:text-electric sm:text-2xl"
                    >
                      CONSULTA PRECIO AQUÍ
                      <ExternalLink className="size-4" />
                    </a>
                  ) : null}
                </div>

                {/* Red */}
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
                  <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Network className="size-4 text-electric-bright/80" />
                    Red
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground/90">
                    {project.network}
                  </span>
                </div>

                {/* Par */}
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
                  <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <BarChart3 className="size-4 text-gold/80" />
                    Par
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground/90">
                    {project.tradingPair}
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-6 space-y-3">
                  <Button
                    size="lg"
                    className="h-12 w-full bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_12px_36px_-10px_rgba(46,107,255,0.85)] transition-transform hover:-translate-y-0.5"
                    onClick={() => setQrOpen(true)}
                  >
                    <QrCode className="size-4" />
                    CONSULTAR COMPRA
                  </Button>

                  {hasMarketUrl ? (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-12 w-full border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                    >
                      <a
                        href={project.marketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver mercado
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </Reveal>

            {/* Tarjeta del contrato */}
            <Reveal delay={0.1}>
              <div className="glass-card relative h-full overflow-hidden rounded-3xl p-6 sm:p-8">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Dirección del contrato
                </p>

                <div className="mt-5">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-navy/60 px-4 py-3.5">
                    <code className="truncate font-mono text-xs text-foreground/90 sm:text-sm">
                      {project.contractAddress}
                    </code>
                    <button
                      type="button"
                      onClick={copyContract}
                      aria-label="Copiar contrato"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/10"
                    >
                      {copied ? (
                        <Check className="size-4 text-brand-green" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      <span className="hidden sm:inline">
                        {copied ? "Copiado" : "Copiar"}
                      </span>
                    </button>
                  </div>
                </div>

                {project.explorerBaseUrl.trim().length > 0 ? (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-3 h-11 w-full border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                  >
                    <a
                      href={`${project.explorerBaseUrl}${project.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver contrato ↗
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : (
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    Enlace a BscScan disponible próximamente.
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
