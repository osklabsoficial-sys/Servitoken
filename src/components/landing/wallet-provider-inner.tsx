"use client";

import type { ReactNode } from "react";
import { WalletProviderCore } from "./wallet-provider";

export function WalletProviderLoader({ children }: { children: ReactNode }) {
  return <WalletProviderCore>{children}</WalletProviderCore>;
}
