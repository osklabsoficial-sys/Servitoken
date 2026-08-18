"use client";

import { motion } from "framer-motion";
import {
  howItWorks,
  benefits,
  tokenHighlights,
} from "@/lib/token-data";
import { LucideIconByName } from "@/components/landing/lucide-icon";

function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`max-w-2xl ${
        align === "center" ? "mx-auto text-center" : "text-left"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-pretty text-base leading-relaxed text-slate-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function UtilitySection() {
  return (
    <section
      id="informacion"
      className="relative scroll-mt-16 border-t border-slate-100 bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        {/* Highlights */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tokenHighlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_40px_-20px_rgba(16,185,129,0.25)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <LucideIconByName name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Cómo funciona */}
        <div className="mt-20 sm:mt-24">
          <SectionTitle
            eyebrow="Cómo funciona"
            title="Pagar con el token es simple y directo"
            description="El proyecto está diseñado para que cualquier persona pueda usarlo sin conocimientos técnicos avanzados. Estos son los pasos del flujo de pago."
          />

          <div className="relative mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* línea conectora en desktop */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent lg:block"
            />
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                    <LucideIconByName name={step.icon} className="size-5" />
                  </span>
                  <span className="font-mono text-2xl font-semibold text-slate-100">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Usos y beneficios */}
        <div className="mt-20 sm:mt-24">
          <SectionTitle
            eyebrow="Usos y beneficios"
            title="Para qué sirve el token y qué ventajas ofrece"
            description="Conoce las principales utilidades del token dentro del ecosistema y los beneficios prácticos para sus usuarios."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_40px_-20px_rgba(16,185,129,0.25)]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                  <LucideIconByName name={item.icon} className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
