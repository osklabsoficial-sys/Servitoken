"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceServi: number;
  status: string;
  paymentsCount: number;
}

export function AdminServices() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({ slug: "", name: "", description: "", priceServi: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setServices(data.services);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createService() {
    setCreating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug.trim().toLowerCase(),
          name: form.name.trim(),
          description: form.description.trim(),
          priceServi: parseFloat(form.priceServi),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.message ?? "No se pudo crear el servicio." });
        return;
      }
      setFeedback({ type: "ok", text: `Servicio "${data.service.name}" creado.` });
      setForm({ slug: "", name: "", description: "", priceServi: "" });
      setShowForm(false);
      await load();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(s: ServiceRow) {
    setBusyId(s.id);
    try {
      await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function updatePrice(s: ServiceRow, price: string) {
    const value = parseFloat(price);
    if (!/^\d+(\.\d{1,2})?$/.test(price.trim()) || !Number.isFinite(value) || value <= 0) return;
    setBusyId(s.id);
    try {
      await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceServi: value }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const formValid =
    /^[a-z0-9-]{2,40}$/.test(form.slug.trim()) &&
    form.name.trim().length >= 3 &&
    form.description.trim().length > 0 &&
    /^\d+(\.\d{1,2})?$/.test(form.priceServi.trim()) &&
    parseFloat(form.priceServi) > 0;

  return (
    <Card className="border-white/10 bg-card">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Servicios</h2>
            <p className="text-xs text-muted-foreground">
              Los usuarios pagan estos servicios con su saldo SERVI.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
          >
            <Plus className="size-4" /> Nuevo
          </Button>
        </div>

        {feedback && (
          <p
            role="status"
            className={`mt-3 rounded-xl border px-3.5 py-2 text-sm ${
              feedback.type === "ok"
                ? "border-brand-green/30 bg-brand-green/10 text-brand-green"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.text}
          </p>
        )}

        {showForm && (
          <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-navy-2/50 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-slug">Slug (identificador)</Label>
              <Input
                id="svc-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                placeholder="plan-premium"
                className="border-white/10 bg-input/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-name">Nombre</Label>
              <Input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Plan Premium Mensual"
                className="border-white/10 bg-input/60"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="svc-desc">Descripción</Label>
              <Input
                id="svc-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Qué incluye el servicio…"
                className="border-white/10 bg-input/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-price">Precio en SERVI</Label>
              <Input
                id="svc-price"
                inputMode="decimal"
                value={form.priceServi}
                onChange={(e) => setForm({ ...form, priceServi: e.target.value })}
                placeholder="500"
                className="border-white/10 bg-input/60"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={createService}
                disabled={!formValid || creating}
                className="w-full bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
              >
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Crear servicio
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="sticky top-0 bg-navy-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Servicio</th>
                <th className="px-4 py-3 font-medium">Precio (SERVI)</th>
                <th className="px-4 py-3 font-medium">Ventas</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Cargando…
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="max-w-[280px] truncate text-xs text-muted-foreground">
                        {s.description}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground/70">{s.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        defaultValue={s.priceServi}
                        onBlur={(e) => {
                          if (parseFloat(e.target.value) !== s.priceServi) updatePrice(s, e.target.value);
                        }}
                        inputMode="decimal"
                        aria-label={`Precio de ${s.name}`}
                        className="h-8 w-24 rounded-md border border-white/10 bg-input/60 px-2 text-sm tabular-nums text-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.paymentsCount}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          s.status === "ACTIVE"
                            ? "border-brand-green/30 text-brand-green"
                            : "border-white/15 text-muted-foreground"
                        }
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === s.id}
                        onClick={() => toggleStatus(s)}
                        className="h-8 border-white/15"
                      >
                        {busyId === s.id && <Loader2 className="size-3.5 animate-spin" />}
                        {s.status === "ACTIVE" ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Consejo: edita el precio directamente en la tabla y presiona fuera del campo para
          guardarlo.
        </p>
      </CardContent>
    </Card>
  );
}
