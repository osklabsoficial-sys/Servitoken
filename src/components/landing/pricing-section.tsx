"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  TrendingUp,
  Activity,
  CircleDollarSign,
  ChevronRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  buyPlatforms,
  howToBuy,
  priceHistory,
  token,
} from "@/lib/token-data";
import { LucideIconByName } from "@/components/landing/lucide-icon";

const chartData = priceHistory.map((p) => ({
  time: p.t,
  price: p.price,
}));

function PriceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] font-medium text-slate-500">{label} h</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
        ${payload[0].value.toFixed(4)}
      </p>
    </div>
  );
}

export function PricingSection() {
  const positive = token.price.change24h >= 0;

  return (
    <section
      id="precio"
      className="relative scroll-mt-16 border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Precio y compra
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Adquiere el token al precio de mercado
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-slate-600">
            Consulta el precio actual y realiza tu compra directamente desde
            las plataformas de intercambio soportadas.
          </p>
        </div>

        {/* Tarjeta de precio + gráfico */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)]"
        >
          <div className="grid lg:grid-cols-5">
            {/* Lado izquierdo: precio */}
            <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 lg:col-span-2 lg:border-b-0 lg:border-r">
              <p className="text-sm font-medium text-slate-500">
                Precio actual · {token.ticker}
              </p>
              <div className="mt-2 flex items-end gap-3">
                <span className="font-mono text-5xl font-semibold tracking-tight text-slate-900">
                  ${token.price.current.toFixed(4)}
                </span>
                <span
                  className={`mb-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-sm font-semibold ${
                    positive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  <TrendingUp className="size-3.5" />
                  {positive ? "+" : ""}
                  {token.price.change24h.toFixed(2)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Variación últimas 24 horas
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CircleDollarSign className="size-4" />
                    <span className="text-[11px] font-medium">
                      Cap. de mercado
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-base font-semibold text-slate-900">
                    ${token.price.marketCap}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Activity className="size-4" />
                    <span className="text-[11px] font-medium">
                      Volumen 24h
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-base font-semibold text-slate-900">
                    ${token.price.volume24h}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-11 flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
                >
                  <a
                    href={buyPlatforms[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Comprar ahora
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 flex-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <Link href="#contacto">Hablar con soporte</Link>
                </Button>
              </div>
            </div>

            {/* Lado derecho: gráfico */}
            <div className="p-5 sm:p-7 lg:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {token.ticker}/USD
                  </p>
                  <p className="text-xs text-slate-500">Últimas 24 horas</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  En vivo
                </div>
              </div>

              <div className="mt-4 h-[220px] w-full sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="priceFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      interval={2}
                    />
                    <YAxis
                      hide
                      domain={["dataMin - 0.0002", "dataMax + 0.0002"]}
                    />
                    <Tooltip
                      content={<PriceTooltip />}
                      cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#priceFill)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "#059669",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plataformas de compra */}
        <div className="mt-16">
          <h3 className="text-center text-lg font-semibold text-slate-900">
            Plataformas donde puedes adquirir {token.ticker}
          </h3>
          <p className="mt-1.5 text-center text-sm text-slate-600">
            Selecciona la plataforma de tu preferencia para realizar el
            intercambio.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {buyPlatforms.map((platform, i) => (
              <motion.a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_18px_40px_-20px_rgba(16,185,129,0.3)]"
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-2xl ${platform.accent}`}
                >
                  <LucideIconByName name={platform.icon} className="size-6" />
                </span>
                <h4 className="mt-4 text-base font-semibold text-slate-900">
                  {platform.name}
                </h4>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">
                  {platform.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  Ir a la plataforma
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Cómo comprar */}
        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              ¿Cómo comprar {token.ticker}?
            </h3>
            <p className="mt-3 text-pretty text-base leading-relaxed text-slate-600">
              Sigue estos sencillos pasos para obtener tu token por primera vez.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {howToBuy.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <LucideIconByName name={step.icon} className="size-5" />
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-300">
                    Paso {step.step}
                  </span>
                </div>
                <h4 className="mt-4 text-base font-semibold text-slate-900">
                  {step.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
                {i < howToBuy.length - 1 ? (
                  <ChevronRight
                    className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-slate-200 lg:block"
                    aria-hidden
                  />
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
