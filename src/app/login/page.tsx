import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta de ServiToken para gestionar tu saldo de SERVI.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={next ?? "/inicio"} />;
}
