import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { WalletProviderLoader } from "@/components/landing/wallet-provider-inner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://servitoken.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Servitoken (SERVI) · Token de Utilidad en BNB Smart Chain",
    template: "%s · Servitoken",
  },
  description:
    "Compra y gestiona Servitoken (SERVI) en BNB Smart Chain. Token de utilidad para pagos de servicios. Swap directo, datos en tiempo real y ecosistema completo.",
  keywords: [
    "Servitoken",
    "SERVI",
    "token de utilidad",
    "BNB Smart Chain",
    "BSC",
    "PancakeSwap",
    "criptomoneda",
    "token BEP-20",
    "pagos de servicios",
    "blockchain",
    "DeFi",
    "swap crypto",
    "comprar SERVI",
    "SERVI token",
    "ecosistema de pagos",
  ],
  authors: [{ name: "Servitoken", url: SITE_URL }],
  creator: "Servitoken",
  publisher: "Servitoken",
  icons: {
    icon: "/servitoken-logo-sm.png",
    apple: "/servitoken-logo.png",
  },
  openGraph: {
    title: "Servitoken (SERVI) · Token de Utilidad en BNB Smart Chain",
    description:
      "Compra y gestiona Servitoken (SERVI) en BNB Smart Chain. Swap directo, datos en tiempo real y ecosistema completo de pagos.",
    url: SITE_URL,
    siteName: "Servitoken",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "Servitoken (SERVI) - Token de Utilidad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servitoken (SERVI) · Token de Utilidad",
    description:
      "Compra y gestiona SERVI en BNB Smart Chain. Swap directo, datos en tiempo real.",
    images: ["/og-image.png"],
  },
  // Telegram & WhatsApp specific
  other: {
    "og:image:width": "1344",
    "og:image:height": "768",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

/* JSON-LD Structured Data */
function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Servitoken",
    url: SITE_URL,
    description:
      "Token de utilidad para conectar usuarios, servicios y comercios en un ecosistema digital de pagos.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/compra?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const tokenJsonLd = {
    "@context": "https://schema.org",
    "@type": "Token",
    name: "Servitoken",
    symbol: "SERVI",
    blockchain: "BNB Smart Chain",
    tokenStandard: "BEP-20",
    contractAddress: "0x07e6CB0876653B914Fc3805283a275b90bF7E443",
    description:
      "Token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tokenJsonLd) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <WalletProviderLoader>
            {children}
          </WalletProviderLoader>
          <SonnerToaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#0C1426",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#E8EDF6",
              },
            }}
          />
        </ThemeProvider>
        <JsonLd />
      </body>
    </html>
  );
}
