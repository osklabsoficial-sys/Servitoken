"use client";

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import {
  type DetectedWallet,
  type WalletInfo,
  detectInstalledWallets,
  getNotInstalledWallets,
} from "@/lib/wallet-registry";

function getSnapshot(): DetectedWallet[] {
  return detectInstalledWallets();
}

function getServerSnapshot(): DetectedWallet[] {
  return [];
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("ethereum#initialized", callback);
  return () => window.removeEventListener("ethereum#initialized", callback);
}

/**
 * Hook que detecta wallets EVM instaladas y retorna
 * las detectadas + las no instaladas con links de instalación.
 */
export function useDetectedWallets() {
  const detected = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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
