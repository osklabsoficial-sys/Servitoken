import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getServiPerUsd } from "@/lib/ledger";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Mi Panel",
  description: "Tu dashboard personal de ServiToken: saldo, compras, transferencias y servicios.",
};

export default async function InicioPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [wallet, rate, recent] = await Promise.all([
    db.wallet.findUnique({ where: { userId: user.id } }),
    getServiPerUsd(),
    db.ledgerEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <DashboardClient
      username={user.username}
      userId={user.id}
      email={user.email}
      isAdmin={user.role === "ADMIN" || user.role === "SUPER_ADMIN"}
      balance={wallet?.balance ?? 0}
      rateServiPerUsd={rate}
      memberSince={user.createdAt ?? null}
      recent={recent.map((e) => ({
        id: e.id,
        type: e.type,
        amount: e.amount,
        description: e.description,
        status: e.status,
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}
