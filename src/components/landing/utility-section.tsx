"use client";

import { SectionHeading, Reveal } from "@/components/landing/section-primitives";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { utilityCards } from "@/lib/token-data";

export function UtilitySection() {
  return (
    <section
      id="utilidad"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow="Utilidad"
          title="Un token con utilidad real"
          description="Servitoken está pensado para usarse dentro de un ecosistema de servicios y comercios participantes, no como una promesa de rentabilidad."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {utilityCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric/30 hover:shadow-[0_18px_50px_-20px_rgba(46,107,255,0.35)]">
                {/* brillo superior */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="flex size-12 items-center justify-center rounded-xl bg-electric/15 text-electric-bright ring-1 ring-electric/20 transition-colors group-hover:bg-electric/25">
                  <LucideIconByName name={card.icon} className="size-5.5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
