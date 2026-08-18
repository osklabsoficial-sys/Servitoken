"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/logo";
import { Reveal } from "@/components/landing/section-primitives";
import {
  hero,
  heroIndicators,
  project,
  display,
} from "@/lib/token-data";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-background"
    >
      {/* Fondo decorativo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-electric/15 blur-[120px]" />
        <div className="absolute right-[-160px] top-24 h-[360px] w-[360px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-px w-full max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          {/* Columna izquierda */}
          <div className="flex flex-col items-start">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
            >
              <span className="size-1.5 rounded-full bg-brand-green" />
              {hero.eyebrow}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-5 text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[3rem] lg:leading-[1.05]"
            >
              Pagos de servicios, ahora con{" "}
              <span className="text-gradient-gold">Servitoken</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <Button
                asChild
                size="lg"
                className="h-11 bg-gradient-to-r from-electric to-electric-bright px-6 text-white shadow-[0_10px_30px_-10px_rgba(46,107,255,0.8)] hover:opacity-95"
              >
                <Link href="#precio">
                  {hero.primaryCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 border-white/15 bg-white/5 px-6 text-foreground backdrop-blur-sm hover:bg-white/10"
              >
                <Link href="#que-es">{hero.secondaryCta}</Link>
              </Button>
            </motion.div>

            {/* Indicadores del token */}
            <motion.dl
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-10 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:grid-cols-4"
            >
              {heroIndicators.map((ind) => (
                <div key={ind.label} className="bg-transparent px-4 py-3.5">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {ind.label}
                  </dt>
                  <dd className="mt-1 truncate font-mono text-sm font-semibold text-foreground/90">
                    {display(ind.value)}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Columna derecha: composición visual premium */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            aria-hidden="true"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      {/* Glow base */}
      <div className="absolute inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-electric/20 via-gold/10 to-transparent blur-2xl" />

      {/* Tarjeta de pago premium (mockup de interfaz) */}
      <div className="glass-card relative rounded-[1.75rem] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)] sm:p-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" showWordmark={false} />
            <div className="leading-none">
              <p className="text-sm font-semibold text-foreground">Servitoken Pay</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Interfaz de pago
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[10px] font-medium text-brand-green">
            <span className="size-1.5 rounded-full bg-brand-green" />
            En línea
          </span>
        </div>

        {/* Comercio + importe */}
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Comercio participante</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3 text-brand-green" /> Verificado
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            Servicios digitales
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Importe</p>
              <p className="mt-0.5 font-mono text-2xl font-semibold text-foreground">
                — —
              </p>
            </div>
            <span className="font-mono text-xs text-gold">SVT</span>
          </div>
        </div>

        {/* Detalle red */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-[11px]">
          <span className="text-muted-foreground">Red</span>
          <span className="font-mono text-muted-foreground">{display(project.network)}</span>
        </div>

        {/* Botón confirmar (decorativo) */}
        <div className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-electric-bright text-sm font-medium text-white">
          <Check className="size-4" /> Confirmar pago
        </div>
      </div>

      {/* Coin flotante */}
      <div className="animate-float absolute -right-3 -top-5 sm:-right-6 sm:-top-7">
        <div className="glow-gold rounded-2xl border border-gold/30 bg-navy-2/80 p-2 backdrop-blur-sm">
          <Logo size="md" showWordmark={false} />
        </div>
      </div>

      {/* Chip blockchain flotante */}
      <div className="animate-float-slow absolute -left-3 bottom-8 sm:-left-6">
        <div className="glass-card flex items-center gap-2 rounded-xl px-3 py-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-electric/15 text-electric-bright">
            <Zap className="size-3.5" />
          </span>
          <div className="leading-none">
            <p className="text-[11px] font-medium text-foreground">Blockchain</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Registro on-chain</p>
          </div>
        </div>
      </div>
    </div>
  );
}
