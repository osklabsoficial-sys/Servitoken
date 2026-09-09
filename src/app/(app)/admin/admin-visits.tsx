"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Eye, Globe, RefreshCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

/**
 * ============================================================
 *  ADMIN · Pestaña "Visitas" — analytics de la aplicación
 * ============================================================
 *  KPIs (hoy / 7d / 30d / únicos), gráfico de barras de 14
 *  días, rutas más visitadas y últimas visitas con usuario
 *  resuelto. Datos: GET /api/admin/visits (solo privilegiados).
 * ============================================================
 */

interface VisitsData {
  totals: { all: number; today: number; d7: number; d30: number; unique7d: number };
  topPaths: { path: string; count: number }[];
  series: { date: string; count: number }[];
  recent: {
    id: string;
    path: string;
    username: string | null;
    referrer: string | null;
    createdAt: string;
  }[];
}

function dayLabel(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function AdminVisits() {
  const [data, setData] = useState<VisitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/visits", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron cargar las visitas.");
      setData((await res.json()) as VisitsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card className="border-white/10 bg-card">
        <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <RefreshCcw className="size-4 animate-spin" aria-hidden /> Cargando visitas…
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30 bg-card">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-destructive">{error ?? "Sin datos"}</p>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCcw className="size-4" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const maxSeries = Math.max(1, ...data.series.map((s) => s.count));
  const maxPath = Math.max(1, ...data.topPaths.map((p) => p.count));

  const kpis = [
    { label: "Hoy", value: data.totals.today, icon: CalendarDays },
    { label: "Últimos 7 días", value: data.totals.d7, icon: Eye },
    { label: "Últimos 30 días", value: data.totals.d30, icon: Globe },
    { label: "Visitantes únicos (7d)", value: data.totals.unique7d, icon: Users },
    { label: "Total histórico", value: data.totals.all, icon: Eye },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="border-white/10 bg-card">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <k.icon className="size-3.5 text-gold" aria-hidden /> {k.label}
              </p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Serie de 14 días */}
      <Card className="border-white/10 bg-card">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">Visitas por día (14 días)</h3>
          <div className="mt-4 flex h-40 items-end gap-1.5 sm:gap-2.5" role="img" aria-label="Gráfico de barras de visitas por día, últimos 14 días">
            {data.series.map((s) => {
              const h = Math.round((s.count / maxSeries) * 100);
              return (
                <div key={s.date} className="group flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {s.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-gold/40 to-gold-bright/90 transition-all group-hover:from-gold/60 group-hover:to-gold-bright"
                    style={{ height: `${Math.max(h, 3)}%`, minHeight: "4px" }}
                    title={`${dayLabel(s.date)}: ${s.count} visitas`}
                  />
                  <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                    {dayLabel(s.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Rutas más visitadas */}
        <Card className="border-white/10 bg-card">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Rutas más visitadas <span className="text-muted-foreground">(30 días)</span>
            </h3>
            {data.topPaths.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">Aún sin datos suficientes.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {data.topPaths.map((p) => (
                  <li key={p.path}>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-foreground">{p.path}</span>
                      <span className="shrink-0 font-semibold text-gold-bright">{p.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright"
                        style={{ width: `${Math.max((p.count / maxPath) * 100, 4)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Últimas visitas */}
        <Card className="border-white/10 bg-card">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground">Últimas visitas en vivo</h3>
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1 servibot-scroll">
              {data.recent.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs hover:bg-white/5"
                >
                  <span className="truncate font-mono text-foreground">{v.path}</span>
                  <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                    {v.username ? (
                      <span className="font-medium text-gold-bright">@{v.username}</span>
                    ) : (
                      <span className="italic">anónimo</span>
                    )}
                    <span>{formatDateTime(v.createdAt)}</span>
                  </span>
                </li>
              ))}
              {data.recent.length === 0 && (
                <li className="py-4 text-center text-xs text-muted-foreground">
                  Sin visitas registradas todavía.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
