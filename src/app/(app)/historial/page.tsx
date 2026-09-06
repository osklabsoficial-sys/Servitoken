import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { HistorialClient } from "./historial-client";

export const metadata: Metadata = {
  title: "Historial",
  description: "Historial completo de movimientos de tu billetera SERVI.",
};

export default async function HistorialPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <HistorialClient />;
}
