"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { token, heroStats } from "@/lib/token-data";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      toast.success("Dirección del contrato copiada");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar la dirección");
    }
  };

  const shortAddress = `${token.contractAddress.slice(
    0,
    6
  )}…${token.contractAddress.slice(-4)}`;

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white"
    >
      {/* Fondo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-200/40 to-teal-200/40 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-[320px] w-[320px] rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute left-[-100px] top-60 h-[260px] w-[260px] rounded-full bg-teal-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          {/* Columna izquierda: presentación */}
          <div className="flex flex-col items-start">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <Badge
                variant="secondary"
                className="gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
              >
                <Sparkles className="size-3.5" />
                Proyecto de token para pagos
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]"
            >
              Paga tus servicios con{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                confianza y claridad
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg"
            >
              {token.description}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                asChild
                size="lg"
                className="h-11 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
              >
                <Link href="#precio">
                  Comprar {token.ticker}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50"
              >
                <Link href="#informacion">Cómo funciona</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.dl
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-10 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4"
            >
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white px-4 py-3.5 text-center sm:text-left"
                >
                  <dd className="font-mono text-lg font-semibold text-slate-900">
                    {stat.value}
                  </dd>
                  <dt className="mt-0.5 text-xs font-medium text-slate-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Columna derecha: tarjeta del token */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-20px_rgba(16,185,129,0.25)] backdrop-blur-xl sm:p-7">
              {/* Cabecera de tarjeta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                    <span className="font-mono text-lg font-bold">
                      {token.ticker.slice(0, 2)}
                    </span>
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {token.name}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      ${token.ticker} · {token.network}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  <ShieldCheck className="size-3.5" />
                  Verificado
                </Badge>
              </div>

              {/* Precio destacado */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/60 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Precio actual
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="font-mono text-3xl font-semibold tracking-tight text-slate-900">
                    ${token.price.current.toFixed(4)}
                  </span>
                  <span className="mb-1 inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-emerald-700">
                    ▲ {token.price.change24h.toFixed(2)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Últimas 24 horas</p>
              </div>

              {/* Contrato */}
              <div className="mt-5">
                <p className="text-xs font-medium text-slate-500">
                  Dirección del contrato
                </p>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="group mt-1.5 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
                  aria-label="Copiar dirección del contrato"
                >
                  <code className="truncate font-mono text-xs text-slate-700 sm:text-sm">
                    {token.contractAddress}
                  </code>
                  <span className="flex shrink-0 items-center gap-1 text-emerald-600">
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4 transition-transform group-hover:scale-110" />
                    )}
                  </span>
                </button>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Toca para copiar ·</span>
                  <span className="font-mono">{shortAddress}</span>
                </p>
              </div>

              {/* Datos del token */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    Suministro total
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                    {token.totalSupply}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    En circulación
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                    {token.circulatingSupply}
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="mt-5 w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                <a
                  href={`https://bscscan.com/address/${token.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver contrato en el explorador
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>

            {/* Glow decorativo */}
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-200/40 to-teal-200/30 blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
