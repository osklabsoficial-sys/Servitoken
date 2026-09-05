import type { Metadata } from "next";
import { RegistroForm } from "./registro-form";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Crea tu cuenta de ServiToken y empieza a usar tu billetera interna de SERVI.",
};

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <RegistroForm next={next ?? "/inicio"} />;
}
