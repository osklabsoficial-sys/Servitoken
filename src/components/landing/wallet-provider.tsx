"use client";

import { type ReactNode, useEffect, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Config } from "wagmi";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// Config base — SSR safe (solo injected)
const baseConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [injected()],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(baseConfig);

  useEffect(() => {
    if (!WC_PROJECT_ID) return;
    let cancelled = false;

    // Importación completamente dinámica para evitar que Turbopack
    // intente resolver 'accounts' (walletconnect) durante SSR
    const loadWC = async () => {
      try {
        // @ts-expect-error — import dinámico intencional
        const mod = await Function('return import("wagmi/connectors")')();
        if (cancelled) return;
        const wc = mod.walletConnect({
          projectId: WC_PROJECT_ID,
          metadata: {
            name: "Servitoken",
            description: "Token de utilidad · Ecosistema de pagos",
            url: "https://servitoken.com",
            icons: ["/servitoken-logo.png"],
          },
          showQrModal: true,
        });
        const newConfig = createConfig({
          chains: [bsc, bscTestnet],
          connectors: [injected(), wc],
          transports: {
            [bsc.id]: http(),
            [bscTestnet.id]: http(),
          },
          ssr: true,
        });
        setConfig(newConfig);
      } catch {
        // WalletConnect no disponible
      }
    };

    loadWC();
    return () => { cancelled = true; };
  }, []);

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
