import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getServiPerUsd } from "@/lib/ledger";
import { ComprarClient } from "./comprar-client";

export const metadata: Metadata = {
  title: "Comprar SERVI",
  description: "Compra ServiToken (SERVI) con PayPal y recíbelo en tu billetera interna.",
};

export default async function ComprarPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const rate = await getServiPerUsd();

  return <ComprarClient rateServiPerUsd={rate} username={user.username} />;
}
