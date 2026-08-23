import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ClientProviders } from "@/components/landing/client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Servitoken · Token de utilidad para pagos de servicios",
  description:
    "Servitoken es un token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos.",
  keywords: [
    "Servitoken",
    "token de utilidad",
    "pagos de servicios",
    "blockchain",
    "ecosistema de pagos",
  ],
  authors: [{ name: "Servitoken" }],
  icons: {
    icon: "/servitoken-logo-sm.png",
    apple: "/servitoken-logo.png",
  },
  openGraph: {
    title: "Servitoken · Token de utilidad para pagos de servicios",
    description:
      "Un token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Servitoken",
    description:
      "Token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos.",
  },
};

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
        <ClientProviders>
          {children}
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
        </ClientProviders>
      </body>
    </html>
  );
}
