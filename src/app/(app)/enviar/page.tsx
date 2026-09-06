import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EnviarClient } from "./enviar-client";

export const metadata: Metadata = {
  title: "Enviar SERVI",
  description: "Envía SERVI a otros usuarios de ServiToken por nombre de usuario o correo.",
};

export default async function EnviarPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const wallet = await db.wallet.findUnique({ where: { userId: user.id } });

  return <EnviarClient username={user.username} balance={wallet?.balance ?? 0} />;
}
