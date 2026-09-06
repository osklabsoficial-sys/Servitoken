import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, isPrivileged } from "@/lib/auth";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "Administración",
  description: "Panel administrativo de ServiToken.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  // Solo ADMIN y SUPER_ADMIN pueden entrar; el resto vuelve a su panel.
  if (!isPrivileged(user.role)) {
    redirect("/inicio");
  }

  return <AdminClient adminRole={user.role} />;
}
