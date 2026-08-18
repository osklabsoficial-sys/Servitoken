"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Lock,
  ShieldCheck,
  Eye,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";
import { project, display, contractSection } from "@/lib/token-data";
import { toast } from "sonner";

const trustBadges = [
  { icon: ShieldCheck, label: "Contrato verificable" },
  { icon: Eye, label: "Suministro auditable" },
  { icon: Boxes, label: "Operación on-chain" },
];

export function ContractSection() {
  const [copied, setCopied] = useState(false);
  const hasContract = project.contractAddress.trim().length > 0;
  const hasExplorer = project.explorerBaseUrl.trim().length > 0;

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
      id="contrato"
      className="relative scroll-mt-16 border-t border-white/5 bg-gradient-to-b from-background to-navy-2/40"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow={contractSection.eyebrow}
          title={contractSection.title}
          description={contractSection.subtitle}
        />

        <Reveal delay={0.1}>
          <div className="glass-card relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

            {/* Badges de confianza */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {trustBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  <badge.icon className="size-3.5 text-brand-green" />
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Dirección */}
            <div className="mt-6">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Dirección del contrato
              </p>
              <div className="mx-auto mt-3 max-w-xl">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy/60 px-4 py-4">
                  <code className="block w-full break-all text-center font-mono text-xs text-foreground/90 sm:text-sm">
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
                  </button>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={copyContract}
                disabled={!hasContract}
                className="h-11 w-full bg-gradient-to-r from-gold to-gold-bright text-navy hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                Copiar dirección
              </Button>

              <Button
                asChild={hasContract && hasExplorer}
                disabled={!hasContract || !hasExplorer}
                variant="outline"
                className="h-11 w-full border-white/15 bg-white/5 text-foreground hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {hasContract && hasExplorer ? (
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
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
              {hasContract
                ? "Verifica siempre la dirección en los canales oficiales antes de operar."
                : "La red y el explorador correspondiente se confirmarán junto con la dirección del contrato."}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
