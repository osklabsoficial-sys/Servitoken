"use client";

import Link from "next/link";
import { ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { footerLinks, socialChannels, project } from "@/lib/token-data";

function abbreviate(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function SiteFooter() {
  const year = 2026;
  const hasExplorerUrl = project.explorerBaseUrl.trim().length > 0;

  return (
    <footer className="mt-auto border-t border-white/10 bg-navy">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Marca */}
          <div className="lg:col-span-5">
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

          {/* Redes */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Comunidad
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
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
            <p className="mt-4 text-xs text-muted-foreground/70">
              Los canales se habilitarán conforme se confirmen.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.01] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold/80" />
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            <span className="font-medium text-muted-foreground">
              Información de carácter informativo:
            </span>{" "}
            el contenido de esta página es informativo y no constituye
            asesoramiento financiero ni garantía de rentabilidad. Los usuarios
            deben consultar las fuentes oficiales del proyecto antes de
            realizar cualquier operación con el token.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} Servitoken. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Token de utilidad · Ecosistema de pagos
          </p>
        </div>
      </div>
    </footer>
  );
}