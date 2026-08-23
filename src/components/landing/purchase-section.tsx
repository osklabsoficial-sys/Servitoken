"use client";

import { SectionHeading } from "@/components/landing/section-primitives";

export function PurchaseSection() {
  return (
    <section
      id="compra"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          eyebrow="COMPRA DIRECTA"
          title="Comprar SERVI"
          description="Realiza tu compra directamente a través de PancakeSwap.
          Conecta tu wallet, selecciona la cantidad y confirma la transacción."
        />

        <div className="mx-auto mt-10 max-w-[500px]">
          <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/20">
            <iframe
              src="https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443"
              title="PancakeSwap - Comprar SERVI"
              width="100%"
              height="600"
              className="block border-0"
              allow="clipboard-read; clipboard-write; web-share"
            >
              Tu navegador no soporta iframes.
            </iframe>
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground/70">
            Interfaz oficial de PancakeSwap. Tu wallet interactúa directamente
            con el contrato — Servitoken no tiene acceso a tus fondos.
          </p>
        </div>
      </div>
    </section>
  );
}
