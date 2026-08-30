"use client";

import { ExternalLink, CreditCard, Smartphone, Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";

const PANCAKESWAP_URL =
  "https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443";

const PAYMENT_METHODS = [
  {
    name: "PancakeSwap",
    description: "Intercambio descentralizado en BSC. Conecta tu wallet y compra SERVI directamente.",
    status: "Disponible",
    statusIcon: "check" as const,
    href: PANCAKESWAP_URL,
    logo: (
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
        <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
          <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.15" />
          <path d="M14 24c3-4 6-8 12-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="28" cy="15" r="3" fill="currentColor" />
          <path d="M26 24c-3-4-6-8-12-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="15" r="3" fill="currentColor" />
        </svg>
      </span>
    ),
    disabled: false,
  },
  {
    name: "Google Pay",
    description: "Compra SERVI con Google Pay. Mas formas de pago proximamente.",
    status: "Proximamente",
    statusIcon: "sparkles" as const,
    href: null,
    logo: (
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground ring-1 ring-white/10">
        <CreditCard className="h-6 w-6" />
      </span>
    ),
    disabled: true,
  },
  {
    name: "Apple Pay",
    description: "Compra SERVI con Apple Pay. Mas formas de pago proximamente.",
    status: "Proximamente",
    statusIcon: "sparkles" as const,
    href: null,
    logo: (
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground ring-1 ring-white/10">
        <Smartphone className="h-6 w-6" />
      </span>
    ),
    disabled: true,
  },
];

const COMPATIBLE_WALLETS = [
  { name: "MetaMask", icon: "🦊" },
  { name: "Trust Wallet", icon: "🛡️" },
  { name: "WalletConnect", icon: "🔗" },
];

export function PurchaseSection() {
  return (
    <section
      id="compra"
      className="relative scroll-mt-16 border-t border-white/5 bg-background"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          eyebrow="METODOS DE PAGO"
          title="Compra SERVI"
          description="Diferentes formas de adquirir el token de servicios. PancakeSwap disponible ahora."
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
          {PAYMENT_METHODS.map(function (method, i) {
            const isDisabled = method.disabled;
            return (
              <Reveal key={method.name} delay={i * 0.08}>
                <Card
                  className={`relative h-full overflow-hidden transition-all ${
                    isDisabled
                      ? "border-dashed border-white/10 bg-white/[0.01] opacity-60"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4">{method.logo}</div>
                    <h3 className="text-base font-semibold text-foreground">
                      {method.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {method.description}
                    </p>
                    <div className="mt-4">
                      {method.statusIcon === "check" ? (
                        <Badge className="bg-green-500/15 text-green-400 border-green-500/30 gap-1">
                          <Check className="h-3 w-3" />
                          {method.status}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 gap-1">
                          <Sparkles className="h-3 w-3" />
                          {method.status}
                        </Badge>
                      )}
                    </div>
                    {method.href ? (
                      <Button
                        asChild
                        className="mt-5 w-full bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_8px_24px_-8px_rgba(46,107,255,0.6)] hover:-translate-y-0.5 transition-transform"
                      >
                        <a
                          href={method.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ir a PancakeSwap
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="mt-5 w-full cursor-not-allowed opacity-50"
                        disabled
                      >
                        No disponible
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.3}>
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Billeteras compatibles
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {COMPATIBLE_WALLETS.map(function (wallet) {
                  return (
                    <div
                      key={wallet.name}
                      className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground/80"
                    >
                      <span className="text-base">{wallet.icon}</span>
                      <span>{wallet.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
