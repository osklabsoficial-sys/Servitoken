"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X, ExternalLink, Shield, Monitor, Smartphone, Cpu, CheckCircle2, WalletMinimal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WALLET_REGISTRY, getChromeUrl, type WalletEntry } from "@/lib/wallet-registry";

function CategoryIcon({ category }: { category: string }) {
  if (category === "mobile") return <Smartphone className="h-3 w-3 text-muted-foreground" />;
  if (category === "hardware") return <Cpu className="h-3 w-3 text-muted-foreground" />;
  return <Monitor className="h-3 w-3 text-muted-foreground" />;
}

function getDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return ""; }
}

/* Wallet icon: loads REAL original logo from the wallet's own website favicon.
   Google favicon → DuckDuckGo icon → colored initials fallback */
function WalletIcon({ wallet, size = 24 }: { wallet: WalletEntry; size?: number }) {
  const domain = getDomain(wallet.homepage);
  const parts = wallet.name.replace(/[^a-zA-Z ]/g, "").split(/\s+/);
  const initials = parts.slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join("");
  const fontSize = size * 0.4;
  const primaryUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : "";

  return (
    <div className="shrink-0 relative" style={{ width: size, height: size }}>
      {primaryUrl && (
        <img
          src={primaryUrl}
          alt={wallet.name}
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
          referrerPolicy="no-referrer"
          onError={function (e) {
            const img = e.currentTarget as HTMLImageElement;
            if (!img.dataset.fb && domain) {
              img.dataset.fb = "1";
              img.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
            } else {
              img.style.display = "none";
              const next = img.nextElementSibling as HTMLElement;
              if (next) next.style.display = "flex";
            }
          }}
          loading="lazy"
          decoding="async"
        />
      )}
      <div
        className="rounded-full items-center justify-center font-bold text-white select-none absolute inset-0"
        style={{
          width: size, height: size,
          backgroundColor: wallet.color,
          fontSize,
          display: primaryUrl ? "none" : "flex",
        }}
      >
        {initials || "?"}
      </div>
    </div>
  );
}

/* EIP-1193 injected provider scanner */
function scanInjectedProviders(): string[] {
  if (typeof window === "undefined") return [];
  const w = window as unknown as Record<string, unknown>;
  const eth = w.ethereum as Record<string, unknown> | undefined;
  if (!eth) return [];
  const names: string[] = [];
  const detectors: Array<[string, string]> = [
    ["isMetaMask", "metamask"],
    ["isTrust", "trust-wallet"],
    ["isOkxWallet", "okx-wallet"],
    ["isCoinbaseWallet", "coinbase-wallet"],
    ["isRabby", "rabby"],
    ["isBitKeep", "bitget-wallet"],
    ["isBinance", "binance-web3"],
    ["isBraveWallet", "brave"],
    ["isSafePal", "safepal"],
    ["isOneKey", "onekey"],
    ["isPhantom", "phantom"],
    ["isMathWallet", "mathwallet"],
    ["isCoin98", "coin98"],
    ["isTokenPocket", "tokenpocket"],
    ["isXDEFI", "xdefi"],
    ["isEnkrypt", "enkrypt"],
    ["isFrontier", "frontier"],
    ["isBybit", "bybit"],
    ["isZerion", "zerion"],
    ["isDeBank", "debank"],
    ["isTaho", "taho"],
    ["isFrame", "frame"],
    ["isHalo", "halo"],
    ["isNabox", "nabox"],
    ["isTalisman", "talisman"],
    ["isSubWallet", "subwallet"],
    ["isNovaWallet", "nova"],
    ["isNightly", "nightly"],
    ["isSolflare", "solflare"],
    ["isBackpack", "backpack"],
    ["isSlope", "slope"],
    ["isBlockWallet", "blockwallet"],
    ["isKlever", "klever"],
    ["isOKXWallet", "okx-wallet"],
  ];
  const providers = (eth.providers as Record<string, unknown>[]) || [eth];
  for (const prov of providers) {
    if (!prov) continue;
    for (const [flag, id] of detectors) {
      if (prov[flag] === true && !names.includes(id)) names.push(id);
    }
    if (providers.indexOf(prov) === 0 && names.length === 0) {
      names.push("metamask");
    }
  }
  return names;
}

interface WalletListModalProps {
  open: boolean;
  onClose: () => void;
  onConnectWallet: (walletName: string) => void;
  onWalletConnectQR: () => void;
}

export function WalletListModal({ open, onClose, onConnectWallet, onWalletConnectQR }: WalletListModalProps) {
  const [search, setSearch] = useState("");
  const [detectedIds] = useState(function () {
    if (typeof window === "undefined") return [];
    return scanInjectedProviders();
  });

  const isDetected = useCallback(
    function (wallet: WalletEntry) { return detectedIds.includes(wallet.id); },
    [detectedIds]
  );

  const query = search.toLowerCase().trim();
  const filtered = useMemo(
    function () {
      if (!query) return WALLET_REGISTRY;
      return WALLET_REGISTRY.filter(function (w) {
        return w.name.toLowerCase().includes(query) || w.id.includes(query);
      });
    },
    [query]
  );

  const verifiedWallets = filtered.filter(function (w) { return w.verified; });
  const detectedWallets = filtered.filter(function (w) { return isDetected(w) && !w.verified; });
  const allWallets = filtered.filter(function (w) { return !w.verified; });
  const hasResults = verifiedWallets.length > 0 || detectedWallets.length > 0 || allWallets.length > 0;

  return (
    <Dialog open={open} onOpenChange={function (v) { if (!v) onClose(); }}>
      <DialogContent
        className="sm:max-w-[520px] p-0 gap-0 overflow-hidden sm:rounded-2xl rounded-none sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] top-0 left-0 translate-x-0 translate-y-0 sm:h-auto sm:max-h-[85vh] h-[100dvh] max-h-[100dvh] sm:w-[520px] w-full flex flex-col bg-background border-border"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-6 sm:pt-5 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <WalletMinimal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-tight">Conectar Wallet</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">Elige entre 300+ wallets</DialogDescription>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 sm:px-6 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text" placeholder="Buscar wallet..." value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              autoFocus
            />
            {search && (
              <button onClick={function () { setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* WalletConnect QR Button */}
        {!query && (
          <div className="px-4 py-3 sm:px-6 shrink-0">
            <button
              onClick={function () { onWalletConnectQR(); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15 hover:bg-primary/10 hover:border-primary/25 transition-all cursor-pointer"
            >
              <img src="https://www.google.com/s2/favicons?domain=walletconnect.com&sz=128" alt="WalletConnect" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">WalletConnect</p>
                <p className="text-xs text-muted-foreground">Escanea con tu wallet movil</p>
              </div>
              <Smartphone className="h-4 w-4 text-primary" />
            </button>
          </div>
        )}

        {/* Wallet list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!hasResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No se encontraron wallets</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Intenta con otro termino de busqueda</p>
            </div>
          ) : (
            <>
              {verifiedWallets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sticky top-0 bg-background z-10">
                    <Shield className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verificadas</span>
                    <span className="text-xs text-muted-foreground/60">({verifiedWallets.length})</span>
                  </div>
                  {verifiedWallets.map(function (wallet) {
                    return <WalletRow key={wallet.id} wallet={wallet} detected={isDetected(wallet)} onConnect={function () { onConnectWallet(wallet.name); onClose(); }} />;
                  })}
                </div>
              )}

              {detectedWallets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sticky top-0 bg-background z-10 border-t">
                    <Monitor className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detectadas en tu navegador</span>
                    <span className="text-xs text-muted-foreground/60">({detectedWallets.length})</span>
                  </div>
                  {detectedWallets.map(function (wallet) {
                    return <WalletRow key={wallet.id} wallet={wallet} detected={true} onConnect={function () { onConnectWallet(wallet.name); onClose(); }} />;
                  })}
                </div>
              )}

              {allWallets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sticky top-0 bg-background z-10 border-t">
                    <WalletMinimal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Todas las wallets</span>
                    <span className="text-xs text-muted-foreground/60">({allWallets.length})</span>
                  </div>
                  {allWallets.map(function (wallet) {
                    return <WalletRow key={wallet.id} wallet={wallet} detected={isDetected(wallet)} onConnect={function () { onConnectWallet(wallet.name); onClose(); }} />;
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 sm:px-6 border-t shrink-0 text-center">
          <p className="text-[11px] text-muted-foreground/60">{WALLET_REGISTRY.length} wallets disponibles</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Individual wallet row with extra-small 24px round real logos */
function WalletRow({ wallet, detected, onConnect }: { wallet: WalletEntry; detected: boolean; onConnect: () => void }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 sm:px-6 hover:bg-muted/40 transition-colors cursor-pointer group"
      onClick={detected ? onConnect : undefined}
    >
      <WalletIcon wallet={wallet} size={24} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{wallet.name}</span>
          {wallet.verified && <Shield className="h-3 w-3 text-blue-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <CategoryIcon category={wallet.category} />
          <span className="text-[11px] text-muted-foreground capitalize">
            {wallet.category === "all" ? "Multi-plataforma" : wallet.category === "extension" ? "Extension" : wallet.category === "mobile" ? "Movil" : "Hardware"}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        {detected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Conectar</span>
          </div>
        ) : wallet.chromeId ? (
          <a href={getChromeUrl(wallet.chromeId)} target="_blank" rel="noopener noreferrer" onClick={function (e) { e.stopPropagation(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs font-medium">Instalar</span>
          </a>
        ) : (
          <a href={wallet.homepage} target="_blank" rel="noopener noreferrer" onClick={function (e) { e.stopPropagation(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs font-medium">Web</span>
          </a>
        )}
      </div>
    </div>
  );
}
