"use client";

import { motion } from "framer-motion";
import { Users, Store, Server } from "lucide-react";
import { SectionHeading, Reveal } from "@/components/landing/section-primitives";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { Logo } from "@/components/landing/logo";
import { whatIs } from "@/lib/token-data";

const nodes = [
  { label: "Usuarios", icon: Users, pos: "top-0 left-1/2 -translate-x-1/2" },
  { label: "Comercios", icon: Store, pos: "bottom-2 left-0" },
  { label: "Proveedores", icon: Server, pos: "bottom-2 right-0" },
];

export function WhatIsSection() {
  return (
    <section
      id="que-es"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Texto */}
          <div>
            <SectionHeading
              eyebrow="El proyecto"
              title={whatIs.title}
              align="left"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
                {whatIs.body}
              </p>
            </Reveal>

            <div className="mt-8 space-y-3">
              {whatIs.points.map((point, i) => (
                <Reveal key={point.title} delay={0.15 + i * 0.08}>
                  <div className="flex items-start gap-3.5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-electric/15 text-electric-bright">
                      <LucideIconByName name={point.icon} className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">
                        {point.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {point.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Visual: ecosistema Servitoken */}
          <Reveal delay={0.2} className="relative">
            <EcosystemDiagram />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function EcosystemDiagram() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* Glow */}
      <div className="absolute inset-10 -z-10 rounded-full bg-gradient-to-br from-electric/20 via-gold/10 to-transparent blur-2xl" />
      <div className="absolute inset-0 -z-10 rounded-full bg-grid opacity-30" />

      {/* Anillos concéntricos */}
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-10 rounded-full border border-white/[0.06]" />
      <div className="absolute inset-20 rounded-full border border-white/[0.04]" />

      {/* Líneas conectoras (SVG) */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <line x1="200" y1="40" x2="200" y2="200" stroke="rgba(46,107,255,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
        <line x1="60" y1="330" x2="200" y2="200" stroke="rgba(212,176,106,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
        <line x1="340" y1="330" x2="200" y2="200" stroke="rgba(212,176,106,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>

      {/* Nodo central: Servitoken */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="glow-gold rounded-3xl border border-gold/30 bg-navy-2/80 p-3 backdrop-blur-sm">
          <Logo size="lg" showWordmark={false} />
        </div>
      </div>

      {/* Nodos periféricos */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
          className={`absolute ${node.pos}`}
        >
          <div className="glass-card flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 text-center">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-gold">
              <node.icon className="size-4.5" />
            </span>
            <span className="text-xs font-medium text-foreground">{node.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
