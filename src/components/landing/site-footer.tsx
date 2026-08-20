"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, ExternalLink, BadgeCheck } from "lucide-react";
import { Logo } from "./logo";
import { LucideIconByName } from "./lucide-icon";
import { LegalModal } from "./legal-modal";
import {
  footerLinks,
  socialChannels,
  project,
  legalSections,
} from "@/lib/token-data";
import type { LegalSection } from "@/lib/token-data";

function abbreviate(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function SiteFooter() {
  const year = 2026;
  const hasExplorerUrl = project.explorerBaseUrl.trim().length > 0;

  const [legalOpen, setLegalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<LegalSection | null>(null);

  const openLegal = (section: LegalSection) => {
    setActiveSection(section);
    setLegalOpen(true);
  };

  return (
    <>
      <LegalModal
        section={activeSection}
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
      />

      {/* ─── Disclaimer bar ─── */}
      <div className="border-t border-amber-500/20 bg-amber-500/[0.04]">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <AlertTriangle className="size-4 shrink-0 text-amber-400/80" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-amber-200/90">
              Aviso importante:
            </span>{" "}
            Este sitio es de carácter exclusivamente informativo. No constituye
            asesoramiento financiero, recomendación de inversión ni garantía de
            rentabilidad. Los criptoactivos conllevan riesgos significativos
            incluyendo la posible pérdida total del capital invertido. Consulta
            nuestro{" "}
            <button
              type="button"
              onClick={() =>
                openLegal(legalSections.find((s) => s.id === "aviso-de-riesgo")!)
              }
              className="font-medium text-amber-300 underline decoration-amber-300/30 underline-offset-2 transition-colors hover:text-amber-200 hover:decoration-amber-200/50"
            >
              Aviso de Riesgo completo
            </button>
            .
          </p>
        </div>
      </div>

      <footer className="mt-auto border-t border-white/10 bg-navy">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Sitio oficial badge */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <BadgeCheck className="size-4 text-brand-green" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-green/90">
              Sitio Oficial
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Marca */}
            <div className="lg:col-span-4">
              <Logo size="md" />
              <p className="mt-1 text-xs font-medium text-muted-foreground/60">
                {project.symbol} · Token de utilidad · Ecosistema de pagos
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {project.shortDescription}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <ShieldCheck className="size-4 text-brand-green" />
                <span className="text-xs text-muted-foreground">
                  Información validable en canales oficiales
                </span>
              </div>
            </div>

            {/* Navegación + Contrato */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Navegación
              </h4>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 lg:grid-cols-1">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                  Contrato oficial
                </p>
                {hasExplorerUrl ? (
                  <a
                    href={`${project.explorerBaseUrl}${project.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-2 font-mono text-xs text-gold transition-colors hover:text-gold-bright"
                  >
                    {abbreviate(project.contractAddress)}
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="mt-1.5 inline-block font-mono text-xs text-gold/80">
                    {abbreviate(project.contractAddress)}
                  </span>
                )}
              </div>
            </div>

            {/* Legal + Redes */}
            <div className="lg:col-span-5">
              {/* Legal links */}
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Legal
              </h4>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {legalSections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => openLegal(section)}
                      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <LucideIconByName
                        name={section.icon}
                        className="size-3.5 shrink-0"
                      />
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Redes */}
              <div className="mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Comunidad
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialChannels.map((channel) => {
                    const active = channel.url.trim().length > 0;
                    const Icon = (
                      <LucideIconByName
                        name={channel.icon}
                        className="size-4 transition-colors group-hover:text-foreground"
                      />
                    );
                    return active ? (
                      <a
                        key={channel.name}
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={channel.name}
                        className="group flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-electric/30 hover:text-foreground"
                      >
                        {Icon}
                      </a>
                    ) : (
                      <span
                        key={channel.name}
                        title={`${channel.name} · Próximamente`}
                        className="flex size-10 cursor-default items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.01] text-muted-foreground/40"
                      >
                        {Icon}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-muted-foreground/70">
                  Los canales se habilitarán conforme se confirmen.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-5 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {year} Servitoken. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {legalSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => openLegal(section)}
                  className="text-[11px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
