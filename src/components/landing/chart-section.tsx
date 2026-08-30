"use client";

import { SectionHeading } from "@/components/landing/section-primitives";

export function ChartSection() {
  return (
    <section
      id="grafico"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          eyebrow="MERCADO"
          title="Gráfico"
          description="Comportamiento del par SERVI/USDT en tiempo real."
        />

        <div className="mt-10">
          <style>{`#dexscreener-embed{position:relative;width:100%;padding-bottom:125%;}@media(min-width:1400px){#dexscreener-embed{padding-bottom:65%;}}#dexscreener-embed iframe{position:absolute;width:100%;height:100%;top:0;left:0;border:0;}`}</style>
          <div id="dexscreener-embed">
            <iframe
              src="https://dexscreener.com/bsc/0xAd48f36F851cE4dcA85a07BB3D6a573a4c70ed18?embed=1&loadChartSettings=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"
              title="Gráfico SERVI/USDT en DexScreener"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
