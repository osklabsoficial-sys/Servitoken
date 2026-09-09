"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/landing/logo";

/**
 * ============================================================
 *  CLIENTE · /crear/admin (ruta secreta)
 * ============================================================
 *  Paso 1 · Cortina de PIN (el servidor es quien de verdad
 *           valida; aquí solo se revela el formulario).
 *  Paso 2 · Formulario de creación SUPER_ADMIN.
 *  Paso 3 · Confirmación con acceso directo al login.
 * ============================================================
 */

type Step = "pin" | "form" | "done";

interface CreatedAdmin {
  username: string;
  email: string;
  role: string;
}

function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 8) issues.push("mínimo 8 caracteres");
  if (!/[A-Za-z]/.test(pw)) issues.push("al menos una letra");
  if (!/\d/.test(pw)) issues.push("al menos un número");
  return issues;
}

export function CrearAdminClient() {
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedAdmin | null>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  const pwIssues = useMemo(() => passwordIssues(password), [password]);
  const usernameValid = /^[a-z0-9_]{3,20}$/.test(username.trim().toLowerCase());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const formOk = usernameValid && emailValid && pwIssues.length === 0;

  async function callApi(payload: Record<string, unknown>) {
    const res = await fetch("/api/crear/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, data: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  }

  async function verifyPin() {
    if (pin.length < 4 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { ok, data } = await callApi({ action: "verify-pin", pin });
      if (ok) {
        setStep("form");
      } else {
        setError((data.message as string) ?? "PIN incorrecto.");
        setPin("");
        pinRef.current?.focus();
      }
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function createAdmin() {
    if (!formOk || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { ok, data } = await callApi({
        action: "create",
        pin,
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });
      if (ok && data.admin) {
        setCreated(data.admin as CreatedAdmin);
        setStep("done");
      } else {
        setError((data.message as string) ?? "No se pudo crear la cuenta.");
      }
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step === "pin") verifyPin();
      else if (step === "form") createAdmin();
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>

        <Card className="border-white/10 bg-card shadow-2xl shadow-gold/5">
          <CardContent className="p-6 sm:p-8">
            {step === "pin" && (
              <section aria-label="Verificación de PIN">
                <div className="flex flex-col items-center text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                    <KeyRound className="size-7" aria-hidden />
                  </span>
                  <h1 className="mt-4 text-xl font-bold text-foreground">Zona restringida</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Introduce el PIN de seguridad para crear una cuenta de administración.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <Label htmlFor="pin" className="sr-only">
                    PIN de seguridad
                  </Label>
                  <Input
                    id="pin"
                    ref={pinRef}
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={32}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="• • • •"
                    className="h-14 text-center text-2xl font-bold tracking-[0.5em]"
                    autoFocus
                  />
                  {error && (
                    <p role="alert" className="text-center text-sm font-medium text-destructive">
                      {error}
                    </p>
                  )}
                  <Button
                    onClick={verifyPin}
                    disabled={pin.length < 4 || busy}
                    className="h-12 w-full gap-2 bg-gradient-to-br from-gold to-gold-bright text-base font-semibold text-background hover:opacity-90"
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                    Desbloquear
                  </Button>
                </div>
              </section>
            )}

            {step === "form" && (
              <section aria-label="Crear cuenta SUPER ADMIN">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => {
                      setStep("pin");
                      setPin("");
                      setError(null);
                    }}
                    aria-label="Volver al PIN"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div>
                    <h1 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <ShieldCheck className="size-5 text-gold" aria-hidden />
                      Nueva cuenta SUPER ADMIN
                    </h1>
                    <p className="text-xs text-muted-foreground">PIN verificado ✓</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="nuevo.admin"
                      autoComplete="off"
                      maxLength={20}
                    />
                    {username.length > 0 && !usernameValid && (
                      <p className="text-xs text-destructive">
                        3-20 caracteres: minúsculas, números o guion bajo.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="admin@servitoken.io"
                      autoComplete="off"
                    />
                    {email.length > 0 && !emailValid && (
                      <p className="text-xs text-destructive">Correo inválido.</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Mínimo 8 caracteres, letras y números"
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {password.length > 0 && pwIssues.length > 0 && (
                      <p className="text-xs text-muted-foreground">Falta: {pwIssues.join(", ")}.</p>
                    )}
                  </div>

                  {error && (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    onClick={createAdmin}
                    disabled={!formOk || busy}
                    className="h-12 w-full gap-2 bg-gradient-to-br from-gold to-gold-bright text-base font-semibold text-background hover:opacity-90"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}
                    Crear SUPER ADMIN
                  </Button>
                </div>
              </section>
            )}

            {step === "done" && created && (
              <section aria-label="Cuenta creada" className="text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                  <BadgeCheck className="size-7" aria-hidden />
                </span>
                <h1 className="mt-4 text-xl font-bold text-foreground">¡Cuenta creada!</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  La cuenta de administración ya está activa.
                </p>

                <dl className="mt-5 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Usuario</dt>
                    <dd className="font-semibold text-gold-bright">{created.username}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Correo</dt>
                    <dd className="truncate font-medium text-foreground">{created.email}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Rol</dt>
                    <dd className="font-semibold text-foreground">{created.role}</dd>
                  </div>
                </dl>

                <Button
                  asChild
                  className="mt-5 h-12 w-full gap-2 bg-gradient-to-br from-gold to-gold-bright text-base font-semibold text-background hover:opacity-90"
                >
                  <Link href="/login">Ir a iniciar sesión</Link>
                </Button>
              </section>
            )}
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          🔒 Ruta secreta protegida por PIN · Solo para el propietario de ServiToken
        </p>
      </motion.div>
    </main>
  );
}
