import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://preview-chat-ec6a6232-901a-4149-b6e4-5416240adb49.space-z.ai",
  ],
  turbopack: {
    resolveAlias: {
      "@reown/appkit-scaffold-ui": path.join(process.cwd(), "src/empty-modules/appkit-scaffold-ui.js"),
    },
  },
};

export default nextConfig;
