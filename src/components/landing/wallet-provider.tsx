"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { tryReconnect } from "@/lib/wallet-store";

export function WalletProviderCore({ children }: { children: ReactNode }) {
  // Try to reconnect on mount (user may have previously connected)
  useEffect(function () {
    tryReconnect();
  }, []);

  return <>{children}</>;
}
