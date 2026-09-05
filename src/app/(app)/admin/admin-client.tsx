"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ClipboardList,
  Coins,
  LayoutDashboard,
  Loader2,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, formatServi, formatUsd } from "@/lib/format";
import { AdminUsers } from "./admin-users";
import { AdminAdjustments } from "./admin-adjustments";
import { AdminPurchases } from "./admin-purchases";
import { AdminTransfers } from "./admin-transfers";
import { AdminLedger } from "./admin-ledger";
import { AdminServices } from "./admin-services";
import { AdminConfig } from "./admin-config";

interface Stats {
  users: { total: number; active: number; blocked: number };
  totalBalance: number;
  purchases: { count: number; usdTotal: number; tokensTotal: number; pending: number };
  transfers: { count: number; tokensTotal: number };
  servicePayments: { count: number; tokensTotal: number };
  recentAudit: { id: string; action: string; actor: string | null; entityId: string | null; createdAt: string }[];
}

export function AdminClient({ adminRole }: { adminRole: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) setStats((await res.json()) as Stats);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <ShieldCheck className="size-6 text-gold" aria-hidden />
          Panel de Administración
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Gestión de usuarios, saldos, compras y configuración · Tu rol:{" "}
          <span className="font-semibold text-gold-bright">{adminRole}</span>
        </p>
      </motion.div>

      {/* KPIs */}
      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando estadísticas…
        </div>
      ) : stats ? (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="border-white/10 bg-card">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3.5" aria-hidden /> Usuarios
              </p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{stats.users.total}</p>
              <p className="text-[11px] text-muted-foreground">
                {stats.users.active} activos · {stats.users.blocked} bloqueados
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Coins className="size-3.5 text-gold" aria-hidden /> Saldo total en circulación
              </p>
              <p className="mt-1.5 text-2xl font-bold text-gold-bright">
                {formatServi(stats.totalBalance)}
              </p>
              <p className="text-[11px] text-muted-foreground">SERVI</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShoppingBag className="size-3.5" aria-hidden /> Compras completadas
              </p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{stats.purchases.count}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatUsd(stats.purchases.usdTotal)} USD ·{" "}
                {stats.purchases.pending} pendientes
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ArrowLeftRight className="size-3.5" aria-hidden /> Transferencias
              </p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{stats.transfers.count}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatServi(stats.transfers.tokensTotal)} SERVI movidos
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs defaultValue="usuarios" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-card p-1.5">
          <TabsTrigger value="usuarios" className="gap-1.5 data-[state=active]:bg-electric data-[state=active]:text-white">
            <Users className="size-3.5" /> Usuarios
          </TabsTrigger>
          <TabsTrigger value="ajustes" className="gap-1.5 data-[state=active]:bg-electric data-[state=active]:text-white">
            <Coins className="size-3.5" /> Ajustes de saldo
          </TabsTrigger>
          <TabsTrigger value="compras" className="gap-1.5 data-[state=active]:bg-electric data-[state=active]:text-white">
            <ShoppingBag className="size-3.5" /> Compras
          </TabsTrigger>
          <TabsTrigger value="transferencias" className="gap-1.5 data-[state=active]:bg-electric data-[state=active]:text-white">
            <ArrowLeftRight className="size-3.5" /> Transferencias
          </TabsTrigger>
          <TabsTrigger value="movimientos" className="gap-1.5 data-[state=active]:bg-electric data-[state=active]:text-white">
            <ClipboardList className="size-3.5" /> Movimientos
          </TabsTrigger>
          <TabsTrigger value="servicios" className="gap-1.5 data-[state=active]:bg-electric data-[state=active]:text-white">
            <Sparkles className="size-3.5" /> Servicios
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5 data-[state=active]:bg-electric data-[state=active]:text-white">
            <Settings className="size-3.5" /> Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-4">
          <AdminUsers onChanged={loadStats} />
        </TabsContent>
        <TabsContent value="ajustes" className="mt-4">
          <AdminAdjustments />
        </TabsContent>
        <TabsContent value="compras" className="mt-4">
          <AdminPurchases />
        </TabsContent>
        <TabsContent value="transferencias" className="mt-4">
          <AdminTransfers />
        </TabsContent>
        <TabsContent value="movimientos" className="mt-4">
          <AdminLedger />
        </TabsContent>
        <TabsContent value="servicios" className="mt-4">
          <AdminServices />
        </TabsContent>
        <TabsContent value="config" className="mt-4">
          <AdminConfig />
        </TabsContent>
      </Tabs>

      {/* Auditoría reciente */}
      {stats && stats.recentAudit.length > 0 && (
        <section className="mt-10" aria-label="Auditoría reciente">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <LayoutDashboard className="size-4" aria-hidden /> Auditoría reciente
          </h2>
          <Card className="mt-3 overflow-hidden border-white/10 bg-card">
            <ul className="max-h-96 divide-y divide-white/5 overflow-y-auto">
              {stats.recentAudit.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="font-medium text-foreground">{a.action}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {a.actor ? `@${a.actor}` : "sistema"} · {formatDateTime(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
