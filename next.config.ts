import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Evitar que Turbopack/webpack intenten bundlear
  // @walletconnect/ethereum-provider durante SSR (usa indexedDB)
  serverExternalPackages: ["@walletconnect/ethereum-provider"],
  turbopack: {
    resolveAlias: {
      // El módulo 'accounts' es interno de @wagmi/core/tempo
      // Turbopack no lo resuelve en SSR
      accounts: "./empty-module.js",
    },
  },
};

export default nextConfig;
