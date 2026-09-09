import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ChatClient } from "./chat-client";

export const metadata: Metadata = {
  title: "OSK LLM - ULTRA · Chat inteligente de ServiToken",
  description:
    "Chatea con OSK LLM - ULTRA: el asistente agente de ServiToken que responde todo y te lleva por la plataforma en tiempo real.",
};

export const dynamic = "force-dynamic";

/**
 * RUTA PRIVADA — /chat
 * Defensa en profundidad: el proxy valida la cookie y aquí se
 * valida la sesión completa contra la base de datos.
 */
export default async function ChatPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?returnTo=%2Fchat");
  }

  if (user.status !== "ACTIVE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-foreground">Cuenta no activa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta está {user.status === "BLOCKED" ? "bloqueada" : "suspendida"} y no puede
            usar el asistente. Contacta al soporte de ServiToken.
          </p>
        </div>
      </div>
    );
  }

  return <ChatClient username={user.username} />;
}
