"use client";

import { useAccount, useConnect } from "wagmi";
import {
  Smartphone,
  Monitor,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useDetectedWallets } from "@/hooks/use-detected-wallets";
import { WALLET_REGISTRY } from "@/lib/wallet-registry";

export function HeroWalletConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { detected, mounted } = useDetectedWallets();

  const wcConnector = connectors.find((c) => c.id !== "injected");
  const injectedConnector = connectors.find((c) => c.id === "injected");

  const handleConnectWC = () => {
    if (wcConnector) connect({ connector: wcConnector });
  };

  const handleConnectInjected = () => {
    if (injectedConnector) connect({ connector: injectedConnector });
  };

  if (isConnected || !mounted) return null;

  const detectedLabel =
    detected.length > 0
      ? detected.length + " wallet" + (detected.length > 1 ? "s" : "") + " detectada" + (detected.length > 1 ? "s" : "") + " · BNB Smart Chain"
      : "BNB Smart Chain · " + WALLET_REGISTRY.length + "+ wallets compatibles";

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#3B99FC]/15 ring-1 ring-[#3B99FC]/20">
          <WcLogo />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Conectar Wallet
          </p>
          <p className="text-[11px] text-muted-foreground">
            {detectedLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <WalletConnectRow
          wcConnector={wcConnector}
          isPending={isPending}
          onConnect={handleConnectWC}
        />

        <DetectedList
          detected={detected}
          isPending={isPending}
          onConnect={handleConnectInjected}
        />

        <InstallList detected={detected} />
      </div>

      <div className="border-t border-white/[0.06] px-5 py-2.5">
        <p className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
          <span className="size-1.5 rounded-full bg-[#F3BA2F]" />
          {WALLET_REGISTRY.length} wallets disponibles · Auto-switch a BSC
        </p>
      </div>
    </div>
  );
}

/* ─── WalletConnect row ─── */
function WalletConnectRow({
  wcConnector,
  isPending,
  onConnect,
}: {
  wcConnector: any;
  isPending: boolean;
  onConnect: () => void;
}) {
  if (!wcConnector) return null;

  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={isPending}
      className="group flex w-full items-center gap-3 rounded-xl bg-[#3B99FC]/10 px-4 py-3.5 text-left ring-1 ring-[#3B99FC]/20 transition-all hover:bg-[#3B99FC]/20 disabled:opacity-50"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-[#3B99FC]/20">
        <Smartphone className="size-5 text-[#3B99FC]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">WalletConnect</p>
        <p className="text-[11px] text-muted-foreground">
          QR · Trust Wallet, MetaMask Mobile, 100+ wallets
        </p>
      </div>
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-[#3B99FC]" />
      ) : (
        <ArrowRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#3B99FC]" />
      )}
    </button>
  );
}

/* ─── Detected extensions ─── */
function DetectedList({
  detected,
  isPending,
  onConnect,
}: {
  detected: any[];
  isPending: boolean;
  onConnect: () => void;
}) {
  if (detected.length === 0) return null;

  return (
    <>
      {detected.slice(0, 3).map((w: any) => (
        <button
          key={w.id}
          type="button"
          onClick={onConnect}
          disabled={isPending}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          <WalletAvatar name={w.shortName} color={w.color} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{w.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-brand-green">
              <span className="size-1 rounded-full bg-brand-green" />
              Detectada
            </p>
          </div>
          <Monitor className="size-4 text-muted-foreground/30" />
        </button>
      ))}
    </>
  );
}

/* ─── Install links when none detected ─── */
function InstallList({ detected }: { detected: any[] }) {
  if (detected.length > 0) return null;

  return (
    <>
      {WALLET_REGISTRY.slice(0, 3).map((w) => (
        <a
          key={w.id}
          href={w.installUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/5"
        >
          <WalletAvatar name={w.shortName} color={w.color} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{w.name}</p>
            <p className="text-[11px] text-muted-foreground/60">
              Instalar extensión
            </p>
          </div>
          <ExternalLink className="size-3.5 text-muted-foreground/30" />
        </a>
      ))}
    </>
  );
}

/* ─── Shared components ─── */
function WalletAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 3).toUpperCase()}
    </span>
  );
}

function WcLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M6.09 9.55c3.26-3.19 8.56-3.19 11.82 0l.39.38a.4.4 0 010 .57l-1.34 1.3a.22.22 0 01-.3 0l-.54-.53c-2.27-2.22-5.96-2.22-8.23 0l-.58.56a.22.22 0 01-.3 0L5.67 10.5a.4.4 0 010-.57l.42-.38zm14.6 2.68l1.19 1.16a.4.4 0 010 .57l-5.4 5.28a.42.42 0 01-.58 0l-3.83-3.75a.12.12 0 00-.17 0l-3.83 3.75a.42.42 0 01-.58 0L2.09 14a.4.4 0 010-.57l1.19-1.16a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0z"
        fill="#3B99FC"
      />
    </svg>
  );
}
