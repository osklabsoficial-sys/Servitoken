import type { Metadata } from "next";
import { CrearAdminClient } from "./crear-admin-client";

export const metadata: Metadata = {
  title: "Acceso restringido",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * ============================================================
 *  RUTA SECRETA · /crear/admin
 * ============================================================
 *  Página privada de creación de cuentas SUPER_ADMIN.
 *  No aparece en ningún menú ni navegación, está excluida de
 *  buscadores (noindex) y el acceso real lo protege el PIN
 *  validado en el servidor (ver /api/crear/admin).
 * ============================================================
 */
export default function CrearAdminPage() {
  return <CrearAdminClient />;
}
