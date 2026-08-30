"use client";

import { GooglePayLogo, ApplePayLogo, PancakeSwapLogo, BscLogo } from "./brand-logos";
import { Construction, Sparkles, ArrowRight, Lock } from "lucide-react";

const COMING_SOON_METHODS = [
  {
    name: "Google Pay",
    description: "Pago directo con tu cuenta Google",
    logo: GooglePayLogo,
    bgColor: "bg-white",
    textColor: "text-gray-800",
    borderColor: "border-gray-200",
    iconColor: "text-black",
  },
  {
    name: "Apple Pay",
    description: "Pago rápido y seguro con Apple",
    logo: ApplePayLogo,
    bgColor: "bg-white",
    textColor: "text-gray-800",
    borderColor: "border-gray-200",
    iconColor: "text-black",
  },
];

export function PaymentMethods() {
  return (
    <div className="space-y-6">
      {/* Active method */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-2 rounded-full bg-brand-green animate-pulse" />
          <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
            Disponible ahora
          </span>
        </div>
        <ActiveMethodCard />
      </div>

      {/* Coming soon methods */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Construction className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
            Próximamente
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {COMING_SOON_METHODS.map((method) => (
            <ComingSoonCard key={method.name} {...method} />
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-muted/30 p-3">
        <Lock className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium">Transacciones seguras on-chain</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Todas las compras se procesan directamente en BNB Smart Chain.
            Tus fondos nunca pasan por servidores intermedios.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActiveMethodCard() {
  return (
    <a
      href="https://pancakeswap.finance/swap?outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443&chain=bsc"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-navy-2/60 p-4 hover:border-white/20 hover:bg-navy-2/80 transition-all"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-[#D1884F]/15 shrink-0">
        <PancakeSwapLogo className="h-8 w-8" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">PancakeSwap</span>
          <BscLogo className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Intercambia BNB o USDT por SERVI directamente
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </a>
  );
}

function ComingSoonCard({
  name,
  description,
  logo: Logo,
}: {
  name: string;
  description: string;
  logo: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
}) {
  return (
    <div
      className="relative flex items-center gap-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/10 p-4 opacity-70"
    >
      <div className={`flex size-12 items-center justify-center rounded-xl bg-white/5 shrink-0`}>
        <Logo className="h-7 w-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
          <Sparkles className="h-3 w-3" />
          Próximamente
        </span>
      </div>
    </div>
  );
}
