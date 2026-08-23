"use client";

import { useState, useEffect, useMemo } from "react";
import {
  type DetectedWallet,
  type WalletInfo,
  detectInstalledWallets,
  getNotInstalledWallets,
} from "@/lib/wallet-registry";

/**
 * Hook que detecta wallets EVM instaladas y retorna
 * las detectadas + las no instaladas con links de instalación.
 */
export function useDetectedWallets() {
  const [detected, setDetected] = useState<DetectedWallet[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const wallets = detectInstalledWallets();
    setDetected(wallets);
    setMounted(true);

    // Re-escanear cuando cambia el proveedor (ej: al instalar una wallet)
    const handler = () => {
      setDetected(detectInstalledWallets());
    };
    window.addEventListener("ethereum#initialized", handler);
    return () => window.removeEventListener("ethereum#initialized", handler);
  }, []);

  const detectedIds = useMemo(
    () => new Set(detected.map((w) => w.id)),
    [detected],
  );

  const notInstalled = useMemo(
    () => getNotInstalledWallets([...detectedIds]),
    [detectedIds],
  );

  return { detected, notInstalled, mounted };
}
