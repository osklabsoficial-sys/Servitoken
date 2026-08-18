"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading, Reveal } from "@/components/landing/section-primitives";
import { faqs } from "@/lib/token-data";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Resolvemos tus dudas"
          description="Encuentra respuestas claras sobre Servitoken. Si falta información, se irá actualizando conforme se confirmen los datos oficiales."
        />

        <Reveal delay={0.1}>
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="mt-10 space-y-3"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`item-${i}`}
                className="rounded-xl border border-white/8 bg-white/[0.02] px-5 transition-colors data-[state=open]:border-electric/30 data-[state=open]:bg-electric/[0.04]"
              >
                <AccordionTrigger className="py-5 text-left text-[15px] font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
