import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServiPerUsd } from "@/lib/ledger";
import { getEnabledPaymentMethods } from "@/lib/payment-methods";
import { CompraClient } from "./compra-client";

export const metadata: Metadata = {
  title: "Comprar SERVI · Servitoken",
  description:
    "Experiencia centralizada de compra de Servitoken (SERVI): elige la cantidad, paga con PayPal o on-chain y recíbelo en tu billetera interna.",
};

export const dynamic = "force-dynamic";

/**
 * RUTA PRIVADA — /compra
 * Defensa en profundidad: además del middleware, aquí se valida la
 * sesión completa contra la base de datos antes de renderizar nada.
 */
export default async function CompraPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?returnTo=%2Fcompra");
  }

  if (user.status !== "ACTIVE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-foreground">Cuenta no activa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta está{" "}
            {user.status === "BLOCKED" ? "bloqueada" : "suspendida"} y no puede
            realizar compras. Contacta al soporte de ServiToken.
          </p>
        </div>
      </div>
    );
  }

  const [wallet, rate] = await Promise.all([
    db.wallet.findUnique({ where: { userId: user.id } }),
    getServiPerUsd(),
  ]);

  // Solo se anuncian los métodos realmente configurados en el servidor.
  const methods = getEnabledPaymentMethods();

  return (
    <CompraClient
      username={user.username}
      balance={wallet?.balance ?? 0}
      rateServiPerUsd={rate}
      methods={methods}
    />
  );
}
