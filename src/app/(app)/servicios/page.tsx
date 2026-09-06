import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { ServiciosClient } from "./servicios-client";

export const metadata: Metadata = {
  title: "Usar SERVI",
  description: "Paga los servicios de ServiToken con tu saldo de SERVI.",
};

export default async function ServiciosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <ServiciosClient />;
}
