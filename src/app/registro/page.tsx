import type { Metadata } from "next";
import { RegistroForm } from "./registro-form";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Crea tu cuenta de ServiToken y empieza a usar tu billetera interna de SERVI.",
};

/**
 * Ruta de destino tras registrarse: acepta `returnTo` (especificación)
 * o `next` (retrocompatibilidad). Se sanitiza para evitar open-redirect.
 */
export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; returnTo?: string }>;
}) {
  const { next, returnTo } = await searchParams;
  const target = returnTo ?? next ?? "/inicio";
  return <RegistroForm next={target} />;
}
