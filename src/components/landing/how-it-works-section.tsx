"use client";

import { SectionHeading, Reveal } from "@/components/landing/section-primitives";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { howItWorks, howItWorksSection } from "@/lib/token-data";

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="relative scroll-mt-16 border-t border-white/5 bg-gradient-to-b from-background via-navy-2/30 to-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow={howItWorksSection.eyebrow}
          title={howItWorksSection.title}
        />

        <div className="relative mt-14">
          {/* Línea conectora horizontal elegante (desktop) */}
          <div
            aria-hidden
            className="absolute left-[16.66%] right-[16.66%] top-[52px] hidden h-px bg-gradient-to-r from-electric/30 via-gold/40 to-electric/30 lg:block"
          />
          {/* Puntos de la línea */}
          <div
            aria-hidden
            className="absolute left-[16.66%] top-[50px] hidden size-3 -translate-x-1/2 rounded-full border border-gold/40 bg-navy-2 lg:block"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-[50px] hidden size-3 -translate-x-1/2 rounded-full border border-gold/40 bg-navy-2 lg:block"
          />
          <div
            aria-hidden
            className="absolute left-[83.33%] top-[50px] hidden size-3 -translate-x-1/2 rounded-full border border-gold/40 bg-navy-2 lg:block"
          />

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {howItWorks.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.1}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Círculo con número/icono */}
                  <div className="relative z-10 flex size-[104px] items-center justify-center rounded-full border border-white/10 bg-navy-2/80 backdrop-blur-sm">
                    <div className="absolute inset-2 rounded-full border border-electric/20" />
                    <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-electric to-electric-bright text-white shadow-[0_8px_24px_-8px_rgba(46,107,255,0.8)]">
                      <LucideIconByName name={step.icon} className="size-5.5" />
                    </span>
                    <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full border border-gold/30 bg-navy-2 font-mono text-xs font-semibold text-gold">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
