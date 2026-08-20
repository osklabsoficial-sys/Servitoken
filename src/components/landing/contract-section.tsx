"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Eye,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";
import { project, contractSection } from "@/lib/token-data";
import { toast } from "sonner";

const trustBadges = [
  { icon: ShieldCheck, label: "Contrato verificable" },
  { icon: Eye, label: "Suministro auditable" },
  { icon: Boxes, label: "Operación on-chain" },
];

export function ContractSection() {
  const [copied, setCopied] = useState(false);
  const hasExplorerUrl = project.explorerBaseUrl.trim().length > 0;

  const copyContract = async () => {
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
    <section
      id="contrato"
      className="relative scroll-mt-16 border-t border-white/5 bg-gradient-to-b from-background to-navy-2/40"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          eyebrow={contractSection.eyebrow}
          title={contractSection.title}
          description={contractSection.subtitle}
        />

        <Reveal delay={0.1}>
          <div className="glass-card relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

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

            <div className="mt-5">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Dirección del contrato
              </p>
              <div className="mx-auto mt-3 max-w-xl">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy/60 px-4 py-4">
                  <code className="block w-full break-all text-center font-mono text-xs text-foreground/90 sm:text-sm">
                    {project.contractAddress}
                  </code>
                  <button
                    type="button"
                    onClick={copyContract}
                    aria-label="Copiar dirección del contrato"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/10"
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

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={copyContract}
                className="h-11 w-full bg-gradient-to-r from-gold to-gold-bright text-navy hover:opacity-95 sm:w-auto"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Contrato copiado ✓" : "Copiar contrato"}
              </Button>

              {hasExplorerUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full border-white/15 bg-white/5 text-foreground hover:bg-white/10 sm:w-auto"
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
                <Button
                  variant="outline"
                  disabled
                  className="h-11 w-full cursor-not-allowed border-white/10 bg-white/[0.03] text-muted-foreground sm:w-auto"
                >
                  Ver contrato ↗
                  <ExternalLink className="size-4" />
                </Button>
              )}
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              Consulta la dirección del contrato directamente en la blockchain
              para verificar la información del token.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
