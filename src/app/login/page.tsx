import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta de ServiToken para gestionar tu saldo de SERVI.",
};

/**
 * Ruta de destino tras autenticarse: acepta `returnTo` (especificación)
 * o `next` (retrocompatibilidad). Se sanitiza para evitar open-redirect.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; returnTo?: string }>;
}) {
  const { next, returnTo } = await searchParams;
  const target = returnTo ?? next ?? "/inicio";
  return <LoginForm next={target} />;
}
