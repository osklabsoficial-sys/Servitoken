"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Wallet, LogOut, ArrowRightLeft, Copy, Check, WalletMinimal } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/wallet-store";
import { WalletListModal } from "./wallet-list-modal";
import { WcQrModal } from "./wc-qr-modal";
import { useWalletBalances } from "@/hooks/use-wallet-balances";

const BSC_CHAIN_ID = 56;

interface ConnectWalletProps {
  variant?: "default" | "hero" | "compact";
  className?: string;
}

export function ConnectWallet({ variant = "default", className = "" }: ConnectWalletProps) {
  const { address, isConnected, chainId, isConnecting, connect, disconnect, switchChain } = useWalletStore();
  const { bnb } = useWalletBalances();

  const [showWalletList, setShowWalletList] = useState(false);
  const [showWcQr, setShowWcQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnectWallet = useCallback(async function () {
    try {
      toast.info("Conectando wallet...");
      const addr = await connect();
      if (addr) {
        toast.success("Wallet conectada: " + addr.slice(0, 6) + "..." + addr.slice(-4));
      }
    } catch (err: any) {
      toast.error(err?.message || "Error al conectar wallet");
    }
    setShowWalletList(false);
  }, [connect]);

  const handleCopy = useCallback(function () {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  }, [address]);

  const shortAddr = address ? address.slice(0, 6) + "..." + address.slice(-4) : "";
  const isWrongNetwork = chainId !== null && chainId !== BSC_CHAIN_ID;

  /* Connected state */
  if (isConnected && address) {
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <img
                src="https://www.google.com/s2/favicons?domain=metamask.io&sz=64"
                alt=""
                className="h-4 w-4 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="hidden sm:inline font-mono text-xs">{shortAddr}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground">Conectado</p>
              <p className="text-sm font-mono">{shortAddr}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
              {copied ? (
                <span className="flex items-center gap-1.5 text-xs text-green-500"><Check className="h-3.5 w-3.5" /> Copiado</span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs"><Copy className="h-3.5 w-3.5" /> Copiar direccion</span>
              )}
            </DropdownMenuItem>
            {isWrongNetwork && (
              <DropdownMenuItem onClick={function () { switchChain(BSC_CHAIN_ID); }} className="gap-2 cursor-pointer text-yellow-500">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span className="text-xs">Cambiar a BSC</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={function () { disconnect(); }} className="gap-2 cursor-pointer text-red-400 focus:text-red-400">
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-xs">Desconectar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  /* Not connected — opens Wallet List Modal */
  const btnClass = variant === "hero"
    ? "w-full h-12 gap-2 text-sm font-medium"
    : "gap-2";

  return (
    <div className={className}>
      <Button
        onClick={function () { setShowWalletList(true); }}
        variant={variant === "hero" ? "default" : "outline"}
        className={btnClass}
        disabled={isConnecting}
      >
        <WalletMinimal className={variant === "hero" ? "h-5 w-5" : "h-4 w-4"} />
        <span>{isConnecting ? "Conectando..." : "Conectar Wallet"}</span>
        <span className="ml-1 text-[10px] opacity-60 hidden sm:inline">300+</span>
      </Button>
      <WalletListModal
        open={showWalletList}
        onClose={function () { setShowWalletList(false); }}
        onConnectWallet={handleConnectWallet}
        onWalletConnectQR={function () { setShowWcQr(true); }}
      />
      <WcQrModal open={showWcQr} onClose={function () { setShowWcQr(false); }} />
    </div>
  );
}
