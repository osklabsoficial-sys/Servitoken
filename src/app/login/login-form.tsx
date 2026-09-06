"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/landing/logo";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice] = useState<boolean>(next !== "/inicio");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "No se pudo iniciar sesión.");
        return;
      }
      router.replace(next || "/inicio");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      {/* Fondo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, rgba(46,107,255,0.12), transparent 70%), radial-gradient(45% 35% at 85% 90%, rgba(212,176,106,0.07), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Volver al inicio"
        >
          <Logo size="md" />
        </Link>

        <Card className="border-white/10 bg-card/80 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-center text-2xl font-bold tracking-tight text-foreground">
              Iniciar Sesión
            </h1>
            <p className="mt-1.5 text-center text-sm text-muted-foreground">
              Accede a tu billetera interna de SERVI
            </p>

            {notice && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-gold/25 bg-gold/10 p-3.5 text-sm text-gold-bright">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>Debes iniciar sesión para comprar tokens y acceder a tu panel.</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Usuario o correo</Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="tu-usuario o correo@ejemplo.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="h-11 border-white/10 bg-input/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 border-white/10 bg-input/60 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || !identifier || !password}
                className="h-11 w-full bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_6px_20px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Verificando…
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href="/registro"
                className="font-semibold text-electric-bright transition-colors hover:text-electric"
              >
                Regístrate gratis
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-brand-green" />
          Sesión protegida con cookies cifradas de ServiToken
        </p>
      </motion.div>
    </div>
  );
}
