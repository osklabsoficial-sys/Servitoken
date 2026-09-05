import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { RecibirClient } from "./recibir-client";

export const metadata: Metadata = {
  title: "Recibir SERVI",
  description: "Comparte tu nombre de usuario para recibir SERVI de otros usuarios.",
};

export default async function RecibirPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <RecibirClient username={user.username} />;
}
