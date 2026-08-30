import type { Metadata } from "next";
import { CompraPageClient } from "./compra-client";

export const metadata: Metadata = {
  title: "Comprar SERVI · Servitoken",
  description: "Compra Servitoken (SERVI) directamente con tu wallet, Google Pay o Apple Pay en BNB Smart Chain.",
};

export default function CompraPage() {
  return <CompraPageClient />;
}
