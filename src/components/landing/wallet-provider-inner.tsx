"use client";

import { type ReactNode, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors/injected";
import { walletConnect } from "wagmi/connectors/walletConnect";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export function WalletProviderInner({ children }: { children: ReactNode }) {
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

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
