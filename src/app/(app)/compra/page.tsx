import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServiPerUsd } from "@/lib/ledger";
import { getPaymentMethods } from "@/lib/payment-methods";
import { CompraClient } from "./compra-client";

export const metadata: Metadata = {
  title: "Comprar SERVI · Servitoken",
  description:
    "Experiencia centralizada de compra de Servitoken (SERVI): elige la cantidad, paga con PayPal o on-chain y recíbelo en tu billetera interna.",
};

export const dynamic = "force-dynamic";

/**
 * RUTA PRIVADA — /compra
 * Antes vivía fuera del grupo (app) y duplicaba el shell completo
 * (header, footer, aurora, ServiBot). Ahora el shell —incluida la
 * barra lateral estilo Instagram— lo aporta el layout del grupo,
 * así que aquí solo queda la carga de datos de la compra.
 *
 * Defensa en profundidad: el layout ya valida sesión y estado, y
 * aquí se re-verifica la sesión antes de renderizar.
 */
export default async function CompraPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?returnTo=%2Fcompra");
  }

  const [wallet, rate] = await Promise.all([
    db.wallet.findUnique({ where: { userId: user.id } }),
    getServiPerUsd(),
  ]);

  return (
    <CompraClient
      username={user.username}
      balance={wallet?.balance ?? 0}
      rateServiPerUsd={rate}
      memberSince={user.createdAt ?? null}
      methods={getPaymentMethods()}
    />
  );
}
