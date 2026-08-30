"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const WalletProviderInner = dynamic(
  () => import("./wallet-provider-inner").then((mod) => mod.WalletProviderInner),
  { ssr: false }
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return <WalletProviderInner>{children}</WalletProviderInner>;
}
