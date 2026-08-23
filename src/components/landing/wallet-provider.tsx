"use client";

import { type ReactNode, useState, useEffect } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [config] = useState(() =>
    createConfig({
      chains: [bsc, bscTestnet],
      connectors: [
        injected(),
        ...(WC_PROJECT_ID
          ? [
              walletConnect({
                projectId: WC_PROJECT_ID,
                metadata: {
                  name: "Servitoken",
                  description: "Token de utilidad · Ecosistema de pagos",
                  url: "https://servitoken.com",
                  icons: ["/servitoken-logo.png"],
                },
                showQrModal: true,
              }),
            ]
          : []),
      ],
      transports: {
        [bsc.id]: http(),
        [bscTestnet.id]: http(),
      },
      ssr: true,
    }),
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
