"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Monitor, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/logo";
import { hero } from "@/lib/token-data";
import { HeroWalletConnect } from "@/components/landing/hero-wallet-connect";

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
      {/* Fondo decorativo: navy + gradientes sutiles + geometría blockchain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Grid sutil */}
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
        {/* Glow eléctrico */}
        <div className="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-electric/12 blur-[140px]" />
        {/* Glow dorado */}
        <div className="absolute right-[-160px] top-32 h-[360px] w-[360px] rounded-full bg-gold/8 blur-[120px]" />
        {/* Glow verde muy puntual */}
        <div className="absolute bottom-[-80px] left-[-100px] h-[260px] w-[260px] rounded-full bg-brand-green/5 blur-[100px]" />
        {/* Línea horizontal superior */}
        <div className="absolute bottom-0 left-1/2 h-px w-full max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        {/* Línea decorativa diagonal */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-electric/8 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Columna izquierda */}
          <div className="flex flex-col items-start">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-green" />
              </span>
              {hero.eyebrow}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-5 text-balance text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[2.6rem] lg:text-[3.15rem] lg:leading-[1.04]"
            >
              Pagos de servicios,
              <br className="hidden sm:block" /> ahora con{" "}
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
                className="h-12 bg-gradient-to-r from-electric to-electric-bright px-7 text-[15px] text-white shadow-[0_12px_36px_-10px_rgba(46,107,255,0.85)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-10px_rgba(46,107,255,0.9)]"
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
                className="h-12 border-white/15 bg-white/[0.04] px-7 text-[15px] text-foreground backdrop-blur-sm transition-colors hover:bg-white/[0.08] hover:border-white/25"
              >
                <Link href="#que-es">{hero.secondaryCta}</Link>
              </Button>
            </motion.div>

            {/* ─── Conexión WalletConnect ─── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-8 w-full sm:w-auto"
            >
              <HeroWalletConnect />
            </motion.div>
          </div>

          {/* Columna derecha: composición visual premium con el logo */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[440px] sm:max-w-[480px] lg:max-w-none"
            aria-hidden="true"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Composición visual premium del hero.
 * Centra el logo de Servitoken como protagonista, rodeado por
 * líneas orbitales, detalles geométricos de blockchain y pequeños
 * elementos dorados/azules. Todo CSS/SVG, sin imágenes genéricas.
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
      {/* Glow base detrás del conjunto */}
      <div className="absolute inset-8 -z-10 rounded-full bg-gradient-to-br from-electric/25 via-gold/12 to-transparent blur-3xl" />

      {/* Anillos orbitales */}
      <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
      <div className="absolute inset-10 rounded-full border border-white/[0.06]" />
      <div className="absolute inset-[88px] rounded-full border border-gold/[0.10]" />

      {/* Aro animado giratorio con elementos */}
      <div
        className="absolute inset-4"
        style={{
          animation: "sv-spin 28s linear infinite",
        }}
      >
        <div className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-electric shadow-[0_0_12px_rgba(46,107,255,0.8)]" />
        <div className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,176,106,0.7)]" />
        <div className="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-gold/80 shadow-[0_0_10px_rgba(212,176,106,0.6)]" />
        <div className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-electric-bright shadow-[0_0_12px_rgba(77,133,255,0.7)]" />
      </div>

      {/* Líneas conectoras (SVG) hacia el centro */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="sv-rg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2E6BFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2E6BFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="80" fill="url(#sv-rg)" />
        {/* Líneas radiales sutiles */}
        <g stroke="rgba(255,255,255,0.10)" strokeWidth="1">
          <line x1="200" y1="40" x2="200" y2="160" strokeDasharray="2 6" />
          <line x1="360" y1="200" x2="240" y2="200" strokeDasharray="2 6" />
          <line x1="200" y1="360" x2="200" y2="240" strokeDasharray="2 6" />
          <line x1="40" y1="200" x2="160" y2="200" strokeDasharray="2 6" />
        </g>
      </svg>

      {/* Logo central de Servitoken */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Halo dorado */}
          <div className="absolute -inset-3 -z-10 rounded-full bg-gold/10 blur-xl" />
          <div className="glow-gold rounded-full border border-gold/25 bg-navy-2/60 p-2 backdrop-blur-md">
            <Logo size="lg" showWordmark={false} />
          </div>
        </motion.div>
      </div>

      {/* Chip flotante: "Blockchain" */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute right-2 top-6 sm:right-0 lg:-right-2"
      >
        <div className="glass-card flex items-center gap-2 rounded-xl px-3 py-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-electric/15 text-electric-bright ring-1 ring-electric/20">
            <BlockGridIcon />
          </span>
          <div className="leading-none">
            <p className="text-[11px] font-semibold text-foreground">Blockchain</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Registro on-chain</p>
          </div>
        </div>
      </motion.div>

      {/* Chip flotante: "Token de utilidad" */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        className="absolute left-2 bottom-14 sm:left-0 lg:-left-2"
      >
        <div className="glass-card flex items-center gap-2 rounded-xl px-3 py-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold ring-1 ring-gold/20">
            <StarIcon />
          </span>
          <div className="leading-none">
            <p className="text-[11px] font-semibold text-foreground">Token de utilidad</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Ecosistema de pagos</p>
          </div>
        </div>
      </motion.div>

      {/* Pequeño punto decorativo dorado */}
      <div className="absolute right-10 bottom-8 size-1.5 rounded-full bg-gold/70 shadow-[0_0_8px_rgba(212,176,106,0.6)]" />
      <div className="absolute left-12 top-12 size-1 rounded-full bg-electric-bright/80 shadow-[0_0_8px_rgba(77,133,255,0.6)]" />
    </div>
  );
}

/* Icono de cuadrícula blockchain (sólo decorativo) */
function BlockGridIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/* Icono estrella para "Token de utilidad" (alineado con la estrella del logo) */
function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.6 6.5 6.9.5-5.3 4.5 1.7 6.7L12 17.7l-5.9 3.3 1.7-6.7L2.5 9.5l6.9-.5L12 2.5z" />
    </svg>
  );
}
