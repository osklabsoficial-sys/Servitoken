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
          eyebrow="COMPRA"
          title="Comprar SERVI"
          description="Realiza tu compra directamente a través de PancakeSwap.
          Conecta tu wallet, selecciona la cantidad y confirma la transacción."
        />

        <div className="mx-auto mt-10 max-w-[500px]">
          <div
            style={{
              width: "100%",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <iframe
              src="https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443"
              title="PancakeSwap"
              width="100%"
              height={600}
              style={{ border: "none" }}
              allow="clipboard-read; clipboard-write; web-share"
            >
              Tu navegador no soporta iframes.
            </iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
