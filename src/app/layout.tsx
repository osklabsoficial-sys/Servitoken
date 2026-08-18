import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { token } from "@/lib/token-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${token.name} (${token.ticker}) · Token para pago de servicios`,
  description: token.description,
  keywords: [
    token.ticker,
    token.name,
    "token",
    "pago de servicios",
    "BEP-20",
    "BNB Smart Chain",
    "criptomoneda",
    "blockchain",
  ],
  authors: [{ name: token.name }],
  openGraph: {
    title: `${token.name} (${token.ticker})`,
    description: token.description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${token.name} (${token.ticker})`,
    description: token.description,
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
        {children}
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
