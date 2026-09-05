"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminConfig() {
  const [rate, setRate] = useState<string>("");
  const [original, setOriginal] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/config", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setRate(String(data.SERVI_PER_USD));
          setOriginal(String(data.SERVI_PER_USD));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const valid = /^\d+(\.\d{1,2})?$/.test(rate.trim()) && parseFloat(rate) > 0;
  const changed = rate !== original && valid;

  async function save() {
    if (!valid) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ SERVI_PER_USD: parseFloat(rate) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.message ?? "No se pudo guardar." });
        return;
      }
      setOriginal(String(data.SERVI_PER_USD));
      setRate(String(data.SERVI_PER_USD));
      setFeedback({ type: "ok", text: "Tasa actualizada. Las nuevas compras usarán este precio." });
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setSaving(false);
    }
  }

  const parsed = parseFloat(rate);

  return (
    <Card className="max-w-xl border-white/10 bg-card">
      <CardContent className="space-y-5 p-5">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Coins className="size-4 text-gold" aria-hidden />
            Precio del SERVI
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Define cuántos SERVI equivalen a $1 USD. Todos los precios se calculan en el servidor.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando configuración…</p>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="rate">SERVI por cada $1 USD</Label>
              <Input
                id="rate"
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="h-11 border-white/10 bg-input/60"
                autoComplete="off"
              />
            </div>

            {valid && (
              <div className="rounded-xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
                <p>
                  <span className="font-bold">{parseFloat(rate).toLocaleString("es-DO")} SERVI</span>{" "}
                  = $1.00 USD
                </p>
                <p className="mt-1 text-xs text-gold/80">
                  Ejemplos: 100 SERVI = ${rate ? (100 / parsed).toFixed(2) : "—"} USD · 500 SERVI = $
                  {rate ? (500 / parsed).toFixed(2) : "—"} USD · 1,000 SERVI = $
                  {rate ? (1000 / parsed).toFixed(2) : "—"} USD
                </p>
              </div>
            )}

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
              onClick={save}
              disabled={!changed || saving}
              className="w-full bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Guardar tasa
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
