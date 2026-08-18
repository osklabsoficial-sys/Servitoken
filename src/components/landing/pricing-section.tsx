"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";
import { project, display } from "@/lib/token-data";
import { toast } from "sonner";

const dataFields = [
  { label: "Precio actual", value: project.price, icon: "CircleDollarSign" as const },
  { label: "Red", value: project.network, icon: "Network" as const },
  { label: "Contrato", value: project.contractAddress, icon: "FileText" as const },
];

export function PricingSection() {
  const [copied, setCopied] = useState(false);
  const hasContract = project.contractAddress.trim().length > 0;
  const hasBuyUrl = project.buyUrl.trim().length > 0;

  const copyContract = async () => {
    if (!hasContract) return;
    try {
      await navigator.clipboard.writeText(project.contractAddress);
      setCopied(true);
      toast.success("Dirección del contrato copiada");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar la dirección");
    }
  };

  return (
    <section
      id="precio"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      {/* Glow de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-electric/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow="Precio y compra"
          title="Adquiere Servitoken"
          description="Toda la información para adquirir el token estará disponible aquí cuando se confirme oficialmente."
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          {/* Panel de datos + CTA */}
          <Reveal>
            <div className="glass-card relative h-full overflow-hidden rounded-3xl p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Información de compra
              </p>

              <dl className="mt-6 space-y-3">
                {dataFields.map((field) => (
                  <div
                    key={field.label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {field.label}
                    </dt>
                    <dd className="flex items-center gap-2 text-right">
                      <span className="font-mono text-sm font-semibold text-foreground/90">
                        {display(field.value)}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              {/* CTA Comprar */}
              <div className="mt-6">
                {hasBuyUrl ? (
                  <Button
                    asChild
                    size="lg"
                    className="h-12 w-full bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_10px_30px_-10px_rgba(46,107,255,0.8)] hover:opacity-95"
                  >
                    <a
                      href={project.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Comprar Servitoken
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      size="lg"
                      disabled
                      className="h-12 w-full cursor-not-allowed border border-white/10 bg-white/5 text-muted-foreground"
                    >
                      <Lock className="size-4" />
                      Comprar Servitoken
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      Botón preparado para enlazar a la plataforma oficial
                      cuando se confirme.
                    </p>
                  </div>
                )}
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

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Aquí se mostrará la dirección completa del contrato de
                Servitoken cuando el cliente la proporcione. Incluirá el botón
                de copiar y el enlace al explorador de la red correspondiente.
              </p>

              {/* Campo de dirección */}
              <div className="mt-6">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-navy/60 px-4 py-3.5">
                  <code className="truncate font-mono text-xs text-foreground/90 sm:text-sm">
                    {hasContract ? project.contractAddress : "Por confirmar"}
                  </code>
                  <button
                    type="button"
                    onClick={copyContract}
                    disabled={!hasContract}
                    aria-label="Copiar dirección del contrato"
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      hasContract
                        ? "text-gold hover:bg-gold/10"
                        : "cursor-not-allowed text-muted-foreground/50"
                    }`}
                  >
                    {copied ? (
                      <Check className="size-4 text-brand-green" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    <span className="hidden sm:inline">Copiar</span>
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {hasContract
                    ? "Toca para copiar la dirección del contrato."
                    : "Disponible cuando se publique el contrato."}
                </p>
              </div>

              {/* Ver en explorador */}
              <Button
                asChild={hasContract}
                disabled={!hasContract}
                variant="outline"
                className="mt-4 h-11 w-full border-white/15 bg-white/5 text-foreground hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hasContract ? (
                  <a
                    href={`${project.explorerBaseUrl}${project.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en explorador
                    <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="size-4" /> Ver en explorador
                  </span>
                )}
              </Button>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                ¿Buscas plataformas externas para adquirir el token?{" "}
                <Link
                  href="#plataformas"
                  className="font-medium text-electric-bright hover:underline"
                >
                  Ver plataformas
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
