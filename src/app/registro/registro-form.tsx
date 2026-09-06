"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/landing/logo";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        ok ? "text-brand-green" : "text-muted-foreground"
      }`}
    >
      {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {label}
    </li>
  );
}

/** Evita open-redirect: solo se aceptan rutas internas. */
function safeReturnTo(raw: string | undefined): string {
  if (!raw) return "/inicio";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/inicio";
  return raw;
}

export function RegistroForm({ next }: { next: string }) {
  const router = useRouter();
  const target = safeReturnTo(next);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uname = username.trim().toLowerCase();
  const rules = useMemo(
    () => ({
      username: USERNAME_RE.test(uname),
      email: EMAIL_RE.test(email.trim()),
      length: password.length >= 8,
      alphaNum: /[A-Za-z]/.test(password) && /\d/.test(password),
    }),
    [uname, email, password]
  );
  const allValid = Object.values(rules).every(Boolean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allValid) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uname, email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "No se pudo crear la cuenta.");
        return;
      }
      router.replace(target);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
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
              Crear Cuenta
            </h1>
            <p className="mt-1.5 text-center text-sm text-muted-foreground">
              Tu billetera interna de SERVI en 1 minuto
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="tu_usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  className="h-11 border-white/10 bg-input/60"
                />
                <p className="text-xs text-muted-foreground">
                  Así te identificarán otros usuarios para enviarte SERVI.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete="new-password"
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
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                  <Rule ok={rules.length} label="Mínimo 8 caracteres" />
                  <Rule ok={rules.alphaNum} label="Letras y números" />
                </ul>
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
                disabled={loading || !allValid}
                className="h-11 w-full bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_6px_20px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Creando cuenta…
                  </>
                ) : (
                  "Crear mi cuenta"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                href={`/login?returnTo=${encodeURIComponent(target)}`}
                className="font-semibold text-electric-bright transition-colors hover:text-electric"
              >
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
