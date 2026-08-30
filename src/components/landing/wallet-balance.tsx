"use client";

import { useWalletStore } from "@/lib/wallet-store";
import { formatEther, formatUnits } from "viem";
import { useState } from "react";
import { Wallet, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "./logo";
import { BscLogo, UsdtLogo } from "./brand-logos";
import { useWalletBalances } from "@/hooks/use-wallet-balances";

function formatBalance(formatted: string, displayDecimals = 4): string {
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  if (num < 0.0001) return "<0.0001";
  return num.toFixed(displayDecimals).replace(/\.?0+$/, "");
}

export function WalletBalance({
  variant = "default",
}: {
  variant?: "default" | "compact" | "card";
}) {
  const { address, isConnected } = useWalletStore();
  const { bnb, servi, usdt, refetch } = useWalletBalances();
  const [expanded, setExpanded] = useState(false);

  const totalUsd = (() => {
    const bnbVal = bnb.value ? parseFloat(formatEther(bnb.value)) * 600 : 0;
    const usdtVal = parseFloat(usdt.formatted) || 0;
    return bnbVal + usdtVal;
  })();

  if (!isConnected || !address) return null;

  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BscLogo className="h-3.5 w-3.5" />
        <span>{bnb.value ? formatBalance(bnb.formatted) : "..."} BNB</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="rounded-xl border border-white/10 bg-navy-2/60 backdrop-blur-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-electric" />
            <span className="text-sm font-medium">Mi Billetera</span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="font-mono text-xs text-muted-foreground">{shortAddr}</p>

        <div className="space-y-2">
          <BalanceRow
            logo={<BscLogo className="h-5 w-5" />}
            name="BNB"
            balance={bnb.value ? formatBalance(bnb.formatted) : undefined}
            usdValue={bnb.value ? (parseFloat(formatEther(bnb.value)) * 600).toFixed(2) : undefined}
            isLoading={bnb.isLoading}
          />
          <BalanceRow
            logo={<Logo size="xs" showWordmark={false} />}
            name="SERVI"
            balance={servi.value ? formatBalance(servi.formatted) : undefined}
            isLoading={servi.isLoading}
          />
          <BalanceRow
            logo={<UsdtLogo className="h-5 w-5" />}
            name="USDT"
            balance={usdt.value ? formatBalance(usdt.formatted) : undefined}
            usdValue={usdt.value ? parseFloat(usdt.formatted).toFixed(2) : undefined}
            isLoading={usdt.isLoading}
          />
        </div>

        {totalUsd > 0 && (
          <div className="pt-2 border-t border-white/5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Estimado total</span>
              <span className="font-medium text-foreground">~${totalUsd.toFixed(2)} USD</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: expandable panel
  return (
    <div className="w-full max-w-sm mx-auto rounded-xl border border-white/10 bg-navy-2/60 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-electric/15">
            <Wallet className="h-4 w-4 text-electric" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Mi Billetera</p>
            <p className="text-xs text-muted-foreground font-mono">{shortAddr}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">{bnb.value ? formatBalance(bnb.formatted) : "..."} <span className="text-xs text-muted-foreground">BNB</span></p>
            {totalUsd > 0 && (
              <p className="text-xs text-muted-foreground">~${totalUsd.toFixed(2)}</p>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-3">
          <BalanceRow
            logo={<BscLogo className="h-5 w-5" />}
            name="BNB"
            balance={bnb.value ? formatBalance(bnb.formatted) : undefined}
            usdValue={bnb.value ? (parseFloat(formatEther(bnb.value)) * 600).toFixed(2) : undefined}
            isLoading={bnb.isLoading}
          />
          <BalanceRow
            logo={<Logo size="xs" showWordmark={false} />}
            name="SERVI"
            balance={servi.value ? formatBalance(servi.formatted) : undefined}
            isLoading={servi.isLoading}
          />
          <BalanceRow
            logo={<UsdtLogo className="h-5 w-5" />}
            name="USDT"
            balance={usdt.value ? formatBalance(usdt.formatted) : undefined}
            usdValue={usdt.value ? parseFloat(usdt.formatted).toFixed(2) : undefined}
            isLoading={usdt.isLoading}
          />

          <button
            onClick={() => refetch()}
            className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            <RefreshCw className="h-3 w-3" />
            Actualizar saldos
          </button>
        </div>
      )}
    </div>
  );
}

function BalanceRow({
  logo,
  name,
  balance,
  usdValue,
  isLoading,
}: {
  logo: React.ReactNode;
  name: string;
  balance?: string;
  usdValue?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2.5">
        {logo}
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="text-right">
        {isLoading ? (
          <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />
        ) : (
          <>
            <p className="text-sm font-mono">{balance ?? "0"}</p>
            {usdValue && (
              <p className="text-[10px] text-muted-foreground">
                ~${usdValue}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
