"use client";

import Link from "next/link";
import { useWalletStore } from "@/lib/wallet-store";
import { ConnectWallet } from "./connect-wallet";
import { WalletBalance } from "./wallet-balance";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRightLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroWalletConnect() {
  const { isConnected, chainId } = useWalletStore();
  const isBsc = chainId === 56;

  if (isConnected && isBsc) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-sm mx-auto flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>Wallet conectada a BSC</span>
        </div>

        {/* Saldos */}
        <WalletBalance variant="default" />

        {/* CTA: Ir a comprar */}
        <Button
          asChild
          size="sm"
          className="w-full gap-2 bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_8px_24px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
        >
          <Link href="/compra">
            <ShoppingBag className="h-4 w-4" />
            Comprar SERVI ahora
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground">
          Compra en PancakeSwap · Proximamente Google Pay y Apple Pay
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <ConnectWallet variant="hero" />
      <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
        <ArrowRightLeft className="h-3 w-3" />
        Selecciona BNB Smart Chain automaticamente
      </p>
    </motion.div>
  );
}
