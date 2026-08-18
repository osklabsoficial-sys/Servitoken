"use client";

import { motion } from "framer-motion";
import { LucideIconByName } from "@/components/landing/lucide-icon";
import { Reveal } from "@/components/landing/section-primitives";
import { tokenStats, display } from "@/lib/token-data";

/**
 * Tarjeta horizontal premium con los datos clave del token.
 * Se muestra debajo del hero. Todos los campos "Por confirmar"
 * hasta que el cliente entregue los datos reales.
 */
export function TokenDataSection() {
  return (
    <section
      id="datos-token"
      className="relative scroll-mt-16 bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 -mt-2 sm:px-6 lg:px-8">
        <Reveal delay={0.05}>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-1.5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:rounded-3xl">
            {/* Borde luminoso superior */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent" />

            <div className="rounded-[1rem] bg-navy-2/40 p-1 sm:p-1.5">
              <dl className="grid grid-cols-2 divide-y divide-white/[0.06] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                {tokenStats.map((stat, i) => {
                  const value = display(stat.value);
                  const isPending = value === "Por confirmar";
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.45,
                        delay: 0.05 * i,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group relative px-4 py-4 sm:px-5 sm:py-5"
                    >
                      {/* Brillo superior sutil en hover */}
                      <span
                        aria-hidden
                        className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />

                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-electric/10 text-electric-bright ring-1 ring-electric/20 transition-colors group-hover:bg-electric/20">
                          <LucideIconByName name={stat.icon} className="size-4" />
                        </span>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {stat.label}
                        </dt>
                      </div>

                      <dd className="mt-3 font-mono text-sm font-semibold leading-snug text-foreground">
                        {isPending ? (
                          <span className="text-gold/90">{value}</span>
                        ) : (
                          <span className="break-all">{value}</span>
                        )}
                      </dd>

                      <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground/60">
                        {stat.hint}
                      </p>
                    </motion.div>
                  );
                })}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
