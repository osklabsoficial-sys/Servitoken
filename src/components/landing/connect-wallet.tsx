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
  ExternalLink,
  Search,
  Monitor,
  Smartphone,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVI_ADDRESS, USDT_ADDRESS } from "@/lib/contracts";
import { bsc } from "wagmi/chains";
import { formatEther } from "viem";
import { toast } from "sonner";
import { useDetectedWallets } from "@/hooks/use-detected-wallets";
import {
  type DetectedWallet,
  type WalletInfo,
  WALLET_REGISTRY,
} from "@/lib/wallet-registry";

function abbreviate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected, chain, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { detected, mounted } = useDetectedWallets();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
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

  // Auto-switch to BSC silently
  useEffect(() => {
    if (!isWrongNetwork) {
      switchAttempted.current = false;
      return;
    }
    if (!switchChain || switchAttempted.current) return;
    switchAttempted.current = true;
    switchChain({ chainId: bsc.id }).catch(() => {});
  }, [isWrongNetwork, switchChain]);

  const handleConnectInjected = (wallet: DetectedWallet) => {
    if (!wallet.provider) return;
    const injectedConn = connectors.find((c) => c.id === "injected");
    if (injectedConn) {
      connect({ connector: injectedConn });
      setShowModal(false);
    }
  };

  const handleConnectWC = () => {
    const wcConn = connectors.find((c) => c.id !== "injected");
    if (wcConn) {
      connect({ connector: wcConn });
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

        {/* ─── Modal completo de wallets ─── */}
        {showModal && (
          <WalletModal
            detected={detected}
            search={search}
            setSearch={setSearch}
            isPending={isPending}
            onClose={() => { setShowModal(false); setSearch(""); }}
            onConnectInjected={handleConnectInjected}
            onConnectWC={handleConnectWC}
            hasWC={!!connectors.find((c) => c.id !== "injected")}
          />
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
          <div className="border-b border-white/[0.06] px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Conectado vía
            </p>
            <p className="mt-1 text-xs text-foreground">
              {connector?.name ?? "Wallet"}
            </p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Tus balances
            </p>
            <div className="mt-3 space-y-2.5">
              <BalanceRow label="BNB" value={bnbBalance ? parseFloat(formatEther(bnbBalance.value)).toFixed(4) : "0.0000"} />
              <BalanceRow label="USDT" value={usdtBalance ? parseFloat(formatEther(usdtBalance.value)).toFixed(2) : "0.00"} />
              <BalanceRow label="SERVI" value={serviBalance ? parseFloat(formatEther(serviBalance.value)).toFixed(2) : "0.00"} />
            </div>
          </div>

          <div className="border-t border-white/[0.06]">
            <button type="button" onClick={copyAddress} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              {copied ? <Check className="size-3.5 text-brand-green" /> : <Copy className="size-3.5" />}
              {copied ? "Copiada" : "Copiar dirección"}
            </button>
            <button type="button" onClick={() => { disconnect(); setShowDropdown(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400 transition-colors hover:bg-red-500/5">
              <LogOut className="size-3.5" />
              Desconectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MODAL COMPLETO DE WALLETS
   ═══════════════════════════════════════════ */
function WalletModal({
  detected,
  search,
  setSearch,
  isPending,
  onClose,
  onConnectInjected,
  onConnectWC,
  hasWC,
}: {
  detected: DetectedWallet[];
  search: string;
  setSearch: (v: string) => void;
  isPending: boolean;
  onClose: () => void;
  onConnectInjected: (w: DetectedWallet) => void;
  onConnectWC: () => void;
  hasWC: boolean;
}) {
  const [tab, setTab] = useState<"installed" | "popular" | "all">("installed");

  // Filtrar wallets por búsqueda
  const q = search.toLowerCase().trim();

  const filteredDetected = q
    ? detected.filter((w) => w.name.toLowerCase().includes(q))
    : detected;

  const filteredAll = q
    ? WALLET_REGISTRY.filter((w) => w.name.toLowerCase().includes(q))
    : WALLET_REGISTRY;

  // Top 10 populares
  const popular = WALLET_REGISTRY.slice(0, 10);
  const filteredPopular = q
    ? popular.filter((w) => w.name.toLowerCase().includes(q))
    : popular;

  const installedIds = new Set(detected.map((w) => w.id));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Conectar wallet"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy shadow-2xl"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            Conectar Wallet
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* WalletConnect siempre primero */}
        {hasWC && (
          <div className="border-b border-white/[0.06] p-3">
            <button
              type="button"
              onClick={onConnectWC}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#3B99FC]/15 ring-1 ring-[#3B99FC]/25">
                <WalletConnectIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">WalletConnect</p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Smartphone className="size-3" />
                  QR · Trust Wallet, MetaMask Mobile, 100+ wallets
                </p>
              </div>
              <QrCode className="size-4 text-muted-foreground/30" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/[0.06] px-3 pt-3">
          <TabBtn active={tab === "installed"} onClick={() => setTab("installed")}>
            Detectadas{detected.length > 0 && <span className="ml-1.5 rounded-full bg-brand-green/20 px-1.5 py-0.5 text-[10px] text-brand-green">{detected.length}</span>}
          </TabBtn>
          <TabBtn active={tab === "popular"} onClick={() => setTab("popular")}>Populares</TabBtn>
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>Todas ({WALLET_REGISTRY.length})</TabBtn>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <Search className="size-4 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Buscar wallet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Wallet list */}
        <div className="flex-1 overflow-y-auto p-2">
          {tab === "installed" && <WalletListDetected wallets={filteredDetected} isPending={isPending} onConnect={onConnectInjected} />}
          {tab === "popular" && <WalletListAll wallets={filteredPopular} installedIds={installedIds} isPending={isPending} onConnect={onConnectInjected} />}
          {tab === "all" && <WalletListAll wallets={filteredAll} installedIds={installedIds} isPending={isPending} onConnect={onConnectInjected} />}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#F3BA2F]" />
            <p className="text-[10px] text-muted-foreground/70">
              Red: <strong className="text-foreground">BNB Smart Chain</strong> · Auto-switch activado
            </p>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
            Al conectar aceptas los Términos de Uso y Aviso de Riesgo
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Lista de wallets detectadas ─── */
function WalletListDetected({
  wallets,
  isPending,
  onConnect,
}: {
  wallets: DetectedWallet[];
  isPending: boolean;
  onConnect: (w: DetectedWallet) => void;
}) {
  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Monitor className="size-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No se detectaron extensiones</p>
        <p className="text-[11px] text-muted-foreground/60">
          Usa WalletConnect o instala una wallet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {wallets.map((w) => (
        <button
          key={w.id}
          type="button"
          onClick={() => onConnect(w)}
          disabled={isPending}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          <WalletAvatar name={w.shortName} color={w.color} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{w.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-brand-green">
              <span className="size-1 rounded-full bg-brand-green" />
              Detectada · Listo para conectar
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Lista de todas las wallets (con install) ─── */
function WalletListAll({
  wallets,
  installedIds,
  isPending,
  onConnect,
}: {
  wallets: WalletInfo[];
  installedIds: Set<string>;
  isPending: boolean;
  onConnect: (w: DetectedWallet) => void;
}) {
  return (
    <div className="space-y-1">
      {wallets.map((w) => {
        const isInstalled = installedIds.has(w.id);
        return (
          <div key={w.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
            <WalletAvatar name={w.shortName} color={w.color} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{w.name}</p>
              {isInstalled ? (
                <p className="flex items-center gap-1 text-[11px] text-brand-green">
                  <span className="size-1 rounded-full bg-brand-green" />
                  Instalada
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground/60">
                  Click para instalar
                </p>
              )}
            </div>
            {isInstalled ? (
              <button
                type="button"
                onClick={() => onConnect({ ...w, installed: true })}
                disabled={isPending}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Conectar
              </button>
            ) : w.installUrl ? (
              <a
                href={w.installUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                Instalar
                <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Avatar de wallet (letra + color) ─── */
function WalletAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 3).toUpperCase()}
    </span>
  );
}

/* ─── Tab button ─── */
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

/* ─── Balance row ─── */
function BalanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ─── WalletConnect blue logo ─── */
function WalletConnectIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M6.09 9.55c3.26-3.19 8.56-3.19 11.82 0l.39.38a.4.4 0 010 .57l-1.34 1.3a.22.22 0 01-.3 0l-.54-.53c-2.27-2.22-5.96-2.22-8.23 0l-.58.56a.22.22 0 01-.3 0L5.67 10.5a.4.4 0 010-.57l.42-.38zm14.6 2.68l1.19 1.16a.4.4 0 010 .57l-5.4 5.28a.42.42 0 01-.58 0l-3.83-3.75a.12.12 0 00-.17 0l-3.83 3.75a.42.42 0 01-.58 0L2.09 14a.4.4 0 010-.57l1.19-1.16a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0z"
        fill="#3B99FC"
      />
    </svg>
  );
}