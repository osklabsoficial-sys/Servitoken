"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, formatServi } from "@/lib/format";

interface Adjustment {
  id: string;
  operation: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
  adminUsername: string;
  targetUsername: string;
}

interface Candidate {
  id: string;
  username: string;
  email: string;
  balance: number;
}

export function AdminAdjustments() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [target, setTarget] = useState<Candidate | null>(null);

  const [operation, setOperation] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/adjustments", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setAdjustments(data.adjustments);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Búsqueda de usuarios para el ajuste
  useEffect(() => {
    if (target || query.trim().length < 2) {
      setCandidates([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query.trim())}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok) setCandidates(data.users.slice(0, 5));
      } catch {
        /* noop */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, target]);

  const amountNum = parseFloat(amount);
  const valid =
    target !== null &&
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    /^\d+(\.\d{1,2})?$/.test(amount.trim()) &&
    reason.trim().length >= 5;

  async function submit() {
    if (!target || !valid) return;
    setConfirmOpen(false);
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: target.id,
          operation,
          amount: amountNum,
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.message ?? "No se pudo completar el ajuste." });
      } else {
        setFeedback({
          type: "ok",
          text: `Ajuste ${operation === "CREDIT" ? "+" : "−"}${formatServi(amountNum)} SERVI aplicado a @${target.username} (ID ${data.adjustment.id}).`,
        });
        setTarget(null);
        setQuery("");
        setAmount("");
        setReason("");
        await loadList();
      }
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      {/* Formulario */}
      <Card className="h-fit border-white/10 bg-card">
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="font-semibold text-foreground">Ajuste manual de saldo</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toda operación queda registrada en el ledger y en la auditoría.
            </p>
          </div>

          {/* Usuario */}
          <div className="space-y-1.5">
            <Label>Usuario afectado</Label>
            {target ? (
              <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-gold-bright">@{target.username}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Saldo actual: {formatServi(target.balance)} SERVI
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTarget(null);
                    setQuery("");
                  }}
                  className="h-7 text-xs text-muted-foreground"
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar @usuario o correo…"
                  className="h-10 border-white/10 bg-input/60 pl-9"
                  aria-label="Buscar usuario para ajuste"
                />
                {candidates.length > 0 && (
                  <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-popover shadow-xl">
                    <ul className="p-1">
                      {candidates.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setTarget(c);
                              setQuery("");
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                          >
                            <span className="font-medium text-foreground">@{c.username}</span>
                            <span className="text-xs text-gold-bright">
                              {formatServi(c.balance)} SERVI
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Operación */}
          <div className="space-y-1.5">
            <Label>Operación</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOperation("CREDIT")}
                aria-pressed={operation === "CREDIT"}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  operation === "CREDIT"
                    ? "border-brand-green/50 bg-brand-green/10 text-brand-green"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <ArrowUpCircle className="size-4" /> Acreditar
              </button>
              <button
                type="button"
                onClick={() => setOperation("DEBIT")}
                aria-pressed={operation === "DEBIT"}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  operation === "DEBIT"
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <ArrowDownCircle className="size-4" /> Descontar
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <Label htmlFor="adj-amount">Cantidad de SERVI</Label>
            <Input
              id="adj-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-10 border-white/10 bg-input/60"
              autoComplete="off"
            />
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <Label htmlFor="adj-reason">Motivo (obligatorio)</Label>
            <textarea
              id="adj-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Ej: corrección de compra duplicada, bono promocional…"
              className="w-full rounded-md border border-white/10 bg-input/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {feedback && (
            <p
              role="status"
              className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                feedback.type === "ok"
                  ? "border-brand-green/30 bg-brand-green/10 text-brand-green"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.text}
            </p>
          )}

          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!valid || submitting}
            className="w-full bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "Revisar y confirmar"}
          </Button>
        </CardContent>
      </Card>

      {/* Historial de ajustes */}
      <Card className="border-white/10 bg-card">
        <CardContent className="p-4 sm:p-5">
          <h2 className="font-semibold text-foreground">Ajustes registrados</h2>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
          ) : adjustments.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
              Aún no hay ajustes administrativos.
            </p>
          ) : (
            <ul className="mt-3 max-h-[520px] divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/5">
              {adjustments.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${
                      a.operation === "CREDIT"
                        ? "bg-brand-green/10 text-brand-green ring-brand-green/20"
                        : "bg-destructive/10 text-destructive ring-destructive/20"
                    }`}
                    aria-hidden
                  >
                    {a.operation === "CREDIT" ? (
                      <ArrowUpCircle className="size-4" />
                    ) : (
                      <ArrowDownCircle className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">@{a.targetUsername}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {formatServi(a.amount)} SERVI · por @{a.adminUsername}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{a.reason}</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {a.balanceBefore} → {a.balanceAfter} · {formatDateTime(a.createdAt)} · ID{" "}
                      {a.id}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-white/10 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar ajuste</DialogTitle>
            <DialogDescription>Esta operación es inmediata y queda auditada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl border border-white/10 bg-navy-2/60 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usuario</span>
              <span className="font-semibold text-foreground">@{target?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operación</span>
              <span className={operation === "CREDIT" ? "font-semibold text-brand-green" : "font-semibold text-destructive"}>
                {operation === "CREDIT" ? "Acreditar" : "Descontar"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad</span>
              <span className="font-bold text-gold-bright">{formatServi(amountNum)} SERVI</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/5 pt-2">
              <span className="shrink-0 text-muted-foreground">Motivo</span>
              <span className="text-right text-foreground">{reason.trim()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="border-white/15">
              Cancelar
            </Button>
            <Button
              onClick={submit}
              className="bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
            >
              Confirmar ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
