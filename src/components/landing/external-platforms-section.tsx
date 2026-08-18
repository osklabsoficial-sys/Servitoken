"use client";

import { ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading, Reveal } from "@/components/landing/section-primitives";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { externalPlatforms, platformsSection } from "@/lib/token-data";

export function ExternalPlatformsSection() {
  return (
    <section
      id="plataformas"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow={platformsSection.eyebrow}
          title={platformsSection.title}
          description={platformsSection.subtitle}
        />

        <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
          {externalPlatforms.map((platform, i) => {
            const active = platform.url.trim().length > 0;
            return (
              <Reveal key={platform.name} delay={i * 0.1}>
                <article className="group glass-card relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric/30">
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex size-12 items-center justify-center rounded-xl ${platform.accent}`}
                    >
                      <LucideIconByName name={platform.icon} className="size-6" />
                    </span>
                    {active ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[10px] font-medium text-brand-green">
                        <span className="size-1.5 rounded-full bg-brand-green" />
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Próximamente
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {platform.name}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {platform.description}
                  </p>

                  <Button
                    asChild={active}
                    disabled={!active}
                    variant="outline"
                    className="mt-5 h-10 w-full border-white/15 bg-white/5 text-foreground hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {active ? (
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir {platform.name}
                        <ExternalLink className="size-4" />
                      </a>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="size-4" /> Enlace por confirmar
                      </span>
                    )}
                  </Button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
