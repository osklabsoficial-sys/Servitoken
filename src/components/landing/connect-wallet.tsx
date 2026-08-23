"use client";

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import { useState, useEffect, useRef } from "react";
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVI_ADDRESS, USDT_ADDRESS } from "@/lib/contracts";
import { bsc } from "wagmi/chains";
import { formatEther } from "viem";
import { toast } from "sonner";

function abbreviate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected, chain, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const switchAttempted = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: bnbBalance } = useBalance({ address });
  const { data: usdtBalance } = useBalance({
    address,
    token: USDT_ADDRESS as `0x${string}`,
  });
  const { data: serviBalance } = useBalance({
    address,
    token: SERVI_ADDRESS as `0x${string}`,
  });

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [showDropdown]);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Dirección copiada");
    setTimeout(() => setCopied(false), 2000);
  };

  const isWrongNetwork = isConnected && chain?.id !== bsc.id;

  // Auto-switch to BSC when connected to wrong network
  useEffect(() => {
    if (!isWrongNetwork) {
      switchAttempted.current = false;
      return;
    }
    if (!switchChain || switchAttempted.current) return;
    switchAttempted.current = true;
    switchChain({ chainId: bsc.id }).catch(() => {
      // Wallet rejected or doesn't support switching
    });
  }, [isWrongNetwork, switchChain]);

  const handleConnect = (connectorId: number) => {
    const c = connectors.find((x) => x.id === connectorId);
    if (c) {
      connect({ connector: c });
      setShowModal(false);
    }
  };

  // ── Not connected: connect button ──
  if (!isConnected) {
    return (
      <>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          disabled={isPending}
          className="gap-2 border-electric/30 bg-electric/10 text-electric-bright hover:bg-electric/20"
        >
          <Wallet className="size-4" />
          {isPending ? "Conectando..." : "Conectar Wallet"}
        </Button>

        {/* Wallet selection modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Seleccionar wallet"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-navy shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Conectar Wallet
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Cerrar"
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Wallet options */}
              <div className="p-3">
                {connectors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleConnect(c.id)}
                    disabled={isPending}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                      <WalletIcon connectorName={c.name} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {c.id === "injected"
                          ? "Conecta con tu extensión de navegador"
                          : "Escanea QR o elige en tu app móvil"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] px-6 py-3">
                <p className="text-center text-[10px] leading-relaxed text-muted-foreground/60">
                  Al conectar aceptas los{" "}
                  <span className="text-muted-foreground">
                    Términos de Uso
                  </span>{" "}
                  y{" "}
                  <span className="text-muted-foreground">
                    Aviso de Riesgo
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Connected: address + dropdown ──
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 rounded-lg border border-brand-green/30 bg-brand-green/10 px-3 py-1.5 text-sm font-medium text-brand-green transition-all"
      >
        <span className="size-2 rounded-full bg-brand-green" />
        {abbreviate(address!)}
        <ChevronDown className="size-3" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-navy shadow-2xl">
          {/* Connected via */}
          <div className="border-b border-white/[0.06] px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Conectado vía
            </p>
            <p className="mt-1 text-xs text-foreground">
              {connector?.name ?? "Wallet"}
            </p>
          </div>

          {/* Balances */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Tus balances
            </p>
            <div className="mt-3 space-y-2.5">
              <BalanceRow
                label="BNB"
                value={
                  bnbBalance
                    ? parseFloat(formatEther(bnbBalance.value)).toFixed(4)
                    : "0.0000"
                }
              />
              <BalanceRow
                label="USDT"
                value={
                  usdtBalance
                    ? parseFloat(formatEther(usdtBalance.value)).toFixed(2)
                    : "0.00"
                }
              />
              <BalanceRow
                label="SERVI"
                value={
                  serviBalance
                    ? parseFloat(formatEther(serviBalance.value)).toFixed(2)
                    : "0.00"
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-white/[0.06]">
            <button
              type="button"
              onClick={copyAddress}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {copied ? (
                <Check className="size-3.5 text-brand-green" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copiada" : "Copiar dirección"}
            </button>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400 transition-colors hover:bg-red-500/5"
            >
              <LogOut className="size-3.5" />
              Desconectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BalanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function WalletIcon({ connectorName }: { connectorName: string }) {
  const name = connectorName.toLowerCase();
  if (name.includes("metamask")) {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M21.3 2L13.2 8.2L14.7 4.5L21.3 2Z"
          fill="#E2761B"
          stroke="#E2761B"
          strokeWidth="0.2"
        />
        <path
          d="M2.7 2L10.7 8.3L9.3 4.5L2.7 2Z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth="0.2"
        />
        <path
          d="M18.4 16.8L15.9 20.7L20.8 22.1L22.2 16.9L18.4 16.8Z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth="0.2"
        />
        <path
          d="M1.8 16.9L3.2 22.1L8.1 20.7L5.6 16.8L1.8 16.9Z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth="0.2"
        />
        <path
          d="M7.9 10.5L6.5 12.3L11.4 12.5L11.2 7.2L7.9 10.5Z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth="0.2"
        />
        <path
          d="M16.1 10.5L12.7 7.1L12.6 12.5L17.5 12.3L16.1 10.5Z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth="0.2"
        />
        <path
          d="M8.1 20.7L11.1 19.3L8.6 17.2L8.1 20.7Z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth="0.2"
        />
        <path
          d="M12.9 19.3L15.9 20.7L15.4 17.2L12.9 19.3Z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeWidth="0.2"
        />
      </svg>
    );
  }
  if (name.includes("walletconnect") || name.includes("wc")) {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M6.09 9.55c3.26-3.19 8.56-3.19 11.82 0l.39.38a.4.4 0 010 .57l-1.34 1.3a.22.22 0 01-.3 0l-.54-.53c-2.27-2.22-5.96-2.22-8.23 0l-.58.56a.22.22 0 01-.3 0L5.67 10.5a.4.4 0 010-.57l.42-.38zm14.6 2.68l1.19 1.16a.4.4 0 010 .57l-5.4 5.28a.42.42 0 01-.58 0l-3.83-3.75a.12.12 0 00-.17 0l-3.83 3.75a.42.42 0 01-.58 0L2.09 14a.4.4 0 010-.57l1.19-1.16a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0z"
          fill="#3B99FC"
        />
      </svg>
    );
  }
  // Generic wallet icon fallback
  return <Wallet className="size-5 text-muted-foreground" />;
}
