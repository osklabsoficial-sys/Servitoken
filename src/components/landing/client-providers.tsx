"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const WalletProviderInner = dynamic(
  () =>
    import("@/components/landing/wallet-provider-inner").then(
      (m) => m.WalletProviderInner,
    ),
  { ssr: false },
);

export function ClientProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  );

  return (
    <WalletProviderInner>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WalletProviderInner>
  );
}
