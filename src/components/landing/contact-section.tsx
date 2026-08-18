"use client";

import { SectionHeading, Reveal } from "@/components/landing/section-primitives";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { socialChannels, contactSection } from "@/lib/token-data";

export function ContactSection() {
  return (
    <section
      id="contacto"
      className="relative scroll-mt-16 border-t border-white/5 bg-gradient-to-b from-background to-navy-2/40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-electric/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow={contactSection.eyebrow}
          title={contactSection.title}
          description={contactSection.subtitle}
        />

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {socialChannels.map((channel, i) => {
            const active = channel.url.trim().length > 0;
            const Wrapper = active ? "a" : "div";
            return (
              <Reveal key={channel.name} delay={i * 0.06}>
                <Wrapper
                  {...(active
                    ? {
                        href: channel.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {})}
                  className={`group flex h-full flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 ${
                    active
                      ? "border-white/8 bg-white/[0.02] hover:-translate-y-1 hover:border-electric/30 hover:bg-electric/[0.04]"
                      : "cursor-default border-white/[0.06] bg-white/[0.01] opacity-70"
                  }`}
                >
                  <span
                    className={`flex size-11 items-center justify-center rounded-xl ring-1 ${
                      active
                        ? "bg-electric/15 text-electric-bright ring-electric/20 transition-colors group-hover:bg-electric/25"
                        : "bg-white/5 text-muted-foreground ring-white/10"
                    }`}
                  >
                    <LucideIconByName name={channel.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {channel.name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                      {channel.handle}
                    </p>
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-medium ${
                      active ? "text-brand-green" : "text-muted-foreground/70"
                    }`}
                  >
                    {active ? "Disponible" : "Próximamente"}
                  </span>
                </Wrapper>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
            Los canales oficiales se habilitarán conforme el cliente los
            confirme. Mientras tanto, solo se muestran los canales confirmados
            como activos.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
