import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { AppHeader } from "@/components/app/app-header";
import { AppFooter } from "@/components/app/app-footer";

/**
 * Layout de todas las rutas privadas.
 * Defensa en profundidad: además del middleware, aquí se valida
 * la sesión completa contra la base de datos.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    // Recupera la ruta original (propagada por el middleware) para
    // devolver al usuario aquí después de autenticarse.
    const h = await headers();
    const path = h.get("x-sv-path") || "/inicio";
    redirect(`/login?returnTo=${encodeURIComponent(path)}`);
  }
  if (user.status !== "ACTIVE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-foreground">Cuenta no activa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta está {user.status === "BLOCKED" ? "bloqueada" : "suspendida"} y no puede
            acceder a las funciones financieras. Contacta al soporte de ServiToken.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader user={user} />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
