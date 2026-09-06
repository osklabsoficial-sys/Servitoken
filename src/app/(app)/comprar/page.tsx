import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Comprar SERVI · Servitoken",
  description:
    "Compra ServiToken (SERVI) desde la experiencia centralizada de compra.",
};

/**
 * /comprar ahora redirige a la experiencia centralizada de compra:
 * /compra (ruta privada protegida por middleware y validación de sesión).
 * Los enlaces antiguos siguen funcionando sin duplicar sistemas.
 */
export default function ComprarRedirectPage() {
  redirect("/compra");
}
