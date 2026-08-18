"use client";

import { SectionHeading, Reveal } from "@/components/landing/section-primitives";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { benefits } from "@/lib/token-data";

export function BenefitsSection() {
  return (
    <section className="relative scroll-mt-16 border-t border-white/5 bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-10 h-[300px] w-[400px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-10 h-[300px] w-[400px] rounded-full bg-electric/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow="Beneficios"
          title="Diseñado para la utilidad, no para la especulación"
          description="Ventajas prácticas para los usuarios dentro del ecosistema de Servitoken."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 0.1}>
              <article className="group glass-card relative h-full overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30">
                {/* Número decorativo */}
                <span className="absolute right-5 top-4 font-mono text-5xl font-semibold text-white/[0.04] transition-colors group-hover:text-white/[0.07]">
                  0{i + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 text-gold ring-1 ring-gold/20">
                  <LucideIconByName name={benefit.icon} className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
                <div className="mt-5 h-px w-12 bg-gradient-to-r from-gold/60 to-transparent" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
