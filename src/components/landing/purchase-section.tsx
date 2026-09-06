"use client";

import Link from "next/link";
import { ExternalLink, CreditCard, Smartphone, Check, Sparkles, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";

const PANCAKESWAP_URL =
  "https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443";

const PAYMENT_METHODS = [
  {
    name: "PayPal",
    description:
      "Compra SERVI en USD con tu cuenta PayPal o tarjeta asociada. Acreditación inmediata en tu billetera interna.",
    status: "Disponible",
    statusIcon: "check" as const,
    href: "/compra",
    internal: true,
    logo: (
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-white/20">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#003087" aria-hidden>
          <path d="M7.076 21.337H2.47a.64.64 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
        </svg>
      </span>
    ),
    disabled: false,
  },
  {
    name: "PancakeSwap",
    description: "Intercambio descentralizado en BSC. Conecta tu wallet y compra SERVI directamente.",
    status: "Disponible",
    statusIcon: "check" as const,
    href: PANCAKESWAP_URL,
    internal: false,
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
    internal: false,
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
    internal: false,
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
          description="Diferentes formas de adquirir el token de servicios. PayPal y PancakeSwap disponibles ahora."
        />

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                      method.internal ? (
                        <Button
                          asChild
                          className="mt-5 w-full bg-gradient-to-r from-gold to-gold-bright text-navy shadow-[0_8px_24px_-8px_rgba(212,176,106,0.6)] hover:-translate-y-0.5 transition-transform"
                        >
                          <Link href={method.href}>
                            <ShoppingBag className="h-4 w-4" />
                            Comprar SERVI
                          </Link>
                        </Button>
                      ) : (
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
                      )
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
