"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { socialLinks, supportChannels, faqs } from "@/lib/token-data";
import { LucideIconByName } from "@/components/landing/lucide-icon";

export function ContactSection() {
  return (
    <section
      id="contacto"
      className="relative scroll-mt-16 border-t border-slate-100 bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Contacto
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Conéctate con la comunidad y el soporte
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-slate-600">
            Sigue las redes oficiales para estar al día con las novedades del
            proyecto y contacta con el equipo de soporte si necesitas ayuda.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Redes sociales oficiales */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">
              Redes sociales oficiales
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Únete y mantente informado sobre el proyecto.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                    <LucideIconByName name={social.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {social.name}
                    </span>
                    <span className="block truncate font-mono text-xs text-slate-500">
                      {social.handle}
                    </span>
                  </span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Canales de soporte */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">
              Canales de soporte
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Dudas, incidencias o colaboración: escríbenos por cualquiera de
              estos medios.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {supportChannels.map((channel, i) => (
                <motion.a
                  key={channel.name}
                  href={channel.url}
                  target={channel.url.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                    <LucideIconByName name={channel.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {channel.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {channel.detail}
                    </span>
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h3 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Preguntas frecuentes
          </h3>
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="mt-8 space-y-3"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`item-${i}`}
                className="rounded-2xl border border-slate-200 bg-white px-5 data-[state=open]:border-emerald-200 data-[state=open]:bg-emerald-50/30"
              >
                <AccordionTrigger className="py-5 text-left text-[15px] font-semibold text-slate-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
