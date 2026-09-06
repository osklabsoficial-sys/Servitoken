"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AtSign,
  BadgeCheck,
  Coins,
  Loader2,
  Mail,
  Search,
  Send,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TokenLiveTicker } from "@/components/app/token-pulse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatServi } from "@/lib/format";

const MAX_TOKENS = 1_000_000;
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

interface UserResult {
  username: string;
  isSelf: boolean;
}

type Phase = "form" | "sending" | "success";

export function EnviarClient({ username, balance }: { username: string; balance: number }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recipient, setRecipient] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amount: number; to: string } | null>(null);

  // Clave de idempotencia: una por operación; se regenera tras cada envío.
  const idempotencyRef = useRef<string>(crypto.randomUUID());

  /* ------------------- Búsqueda de destinatario ------------------- */

  useEffect(() => {
    if (recipient || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setResults(data.users ?? []);
          setShowResults(true);
        }
      } catch {
        /* silencioso */
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, recipient]);

  function chooseUser(u: UserResult) {
    setRecipient(u.username);
    setQuery(`@${u.username}`);
    setShowResults(false);
  }

  function clearRecipient() {
    setRecipient(null);
    setQuery("");
    setResults([]);
  }

  /* --------------------------- Validación --------------------------- */

  const amountNum = useMemo(() => {
    const trimmed = amount.trim();
    if (!AMOUNT_RE.test(trimmed)) return null;
    return parseFloat(trimmed);
  }, [amount]);

  useEffect(() => {
    if (amount === "") {
      setAmountError(null);
      return;
    }
    if (amountNum === null) {
      setAmountError("Solo números con máximo 2 decimales.");
      return;
    }
    if (amountNum <= 0) {
      setAmountError("La cantidad debe ser mayor a 0.");
      return;
    }
    if (amountNum > MAX_TOKENS) {
      setAmountError(`La cantidad máxima es ${formatServi(MAX_TOKENS)} SERVI.`);
      return;
    }
    if (amountNum > balance) {
      setAmountError(`Saldo insuficiente. Disponible: ${formatServi(balance)} SERVI.`);
      return;
    }
    setAmountError(null);
  }, [amountNum, amount, balance]);

  const canSubmit = recipient !== null && amountNum !== null && !amountError;

  /* ----------------------------- Envío ----------------------------- */

  async function submit() {
    if (!canSubmit || !recipient || amountNum === null) return;
    setConfirmOpen(false);
    setError(null);
    setPhase("sending");
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          amount: amountNum,
          note: note.trim() || undefined,
          idempotencyKey: idempotencyRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "No se pudo completar la transferencia.");
        setPhase("form");
        return;
      }
      setSuccess({ amount: data.transfer.amount, to: data.transfer.receiverUsername });
      setPhase("success");
      idempotencyRef.current = crypto.randomUUID(); // nueva clave para el próximo envío
      router.refresh();
    } catch {
      setError("Error de conexión. La transferencia no fue procesada.");
      setPhase("form");
    }
  }

  if (phase === "success" && success) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-brand-green/30 bg-card">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-10">
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-green/15 text-brand-green ring-1 ring-brand-green/30">
                <BadgeCheck className="size-9" aria-hidden />
              </span>
              <h1 className="text-2xl font-bold text-foreground">Transferencia completada</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                <span className="font-bold text-gold-bright">{formatServi(success.amount)} SERVI</span>{" "}
                fueron enviados correctamente a{" "}
                <span className="font-semibold text-foreground">@{success.to}</span>.
              </p>
              <div className="mt-2 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                <Button
                  onClick={() => {
                    setPhase("form");
                    setSuccess(null);
                    clearRecipient();
                    setAmount("");
                    setNote("");
                  }}
                  className="bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
                >
                  <Send className="size-4" /> Enviar otra transferencia
                </Button>
                <Button asChild variant="outline" className="border-white/15">
                  <Link href="/historial">Ver historial</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <TokenLiveTicker />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <Send className="size-6 text-electric-bright" aria-hidden />
          Enviar SERVI
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Busca al destinatario por su <span className="text-foreground">@usuario</span> o correo y
          transfiere al instante, sin comisiones.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="mt-6 border-white/10 bg-card">
          <CardContent className="space-y-5 p-6">
            {/* Destinatario */}
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Destinatario</Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="recipient"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (recipient) clearRecipient();
                  }}
                  onFocus={() => results.length > 0 && setShowResults(true)}
                  placeholder="usuario o correo@ejemplo.com"
                  className="h-11 border-white/10 bg-input/60 pl-9"
                  autoComplete="off"
                  aria-expanded={showResults}
                  role="combobox"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
                )}

                {showResults && results.length > 0 && !recipient && (
                  <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-popover shadow-xl">
                    <ul className="max-h-56 overflow-y-auto p-1">
                      {results.map((u) => (
                        <li key={u.username}>
                          <button
                            type="button"
                            onClick={() => chooseUser(u)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
                          >
                            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-electric to-electric-bright text-[11px] font-bold text-white">
                              {u.username.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="font-medium text-foreground">@{u.username}</span>
                            {u.isSelf && (
                              <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                                tú
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {showResults && results.length === 0 && !recipient && query.trim().length >= 2 && !searching && (
                  <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-white/10 bg-popover p-4 text-center text-sm text-muted-foreground shadow-xl">
                    <UserPlus className="mx-auto mb-1.5 size-5 opacity-50" aria-hidden />
                    No se encontró ningún usuario. Verifica el @usuario o correo.
                  </div>
                )}
              </div>
            </div>

            {/* Cantidad */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Cantidad de SERVI</Label>
                <span className="text-xs text-muted-foreground">
                  Disponible: <span className="font-semibold text-gold-bright">{formatServi(balance)} SERVI</span>
                </span>
              </div>
              <div className="relative">
                <Coins className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold" aria-hidden />
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-11 border-white/10 bg-input/60 pl-9 pr-16"
                  autoComplete="off"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  SERVI
                </span>
              </div>
              {amountError && (
                <p role="alert" className="text-xs text-destructive">
                  {amountError}
                </p>
              )}
              <div className="flex gap-2 pt-0.5">
                {[50, 100, 250].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    disabled={v > balance}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-40"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Nota */}
            <div className="space-y-1.5">
              <Label htmlFor="note">
                Nota <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden />
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 200))}
                  placeholder="Ej: pago de servicio, regalo…"
                  rows={2}
                  className="w-full rounded-md border border-white/10 bg-input/60 px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <p className="text-right text-[11px] text-muted-foreground">{note.length}/200</p>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!canSubmit || phase === "sending"}
              className="h-11 w-full bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_6px_20px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
            >
              {phase === "sending" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Procesando…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Enviar SERVI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-white/10 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar transferencia</DialogTitle>
            <DialogDescription>Revisa los datos antes de enviar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 rounded-xl border border-white/10 bg-navy-2/60 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Para</span>
              <span className="font-semibold text-foreground">@{recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad</span>
              <span className="font-bold text-gold-bright">{formatServi(amountNum ?? 0)} SERVI</span>
            </div>
            {note.trim() && (
              <div className="flex justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">Nota</span>
                <span className="text-right text-foreground">{note.trim()}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="border-white/15">
              Cancelar
            </Button>
            <Button
              onClick={submit}
              className="bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
            >
              <Send className="size-4" /> Confirmar y enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
