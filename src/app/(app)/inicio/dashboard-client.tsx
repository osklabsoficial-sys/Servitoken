"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Coins,
  History,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiCard } from "@/components/app/servi-card";
import {
  formatDateTime,
  formatServi,
  formatTokenPriceUsd,
  LEDGER_TYPE_LABELS,
  POSITIVE_TYPES,
} from "@/lib/format";

export interface RecentEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  PURCHASE: <ShoppingCart className="size-4" />,
  TRANSFER_SENT: <ArrowUpRight className="size-4" />,
  TRANSFER_RECEIVED: <ArrowDownLeft className="size-4" />,
  SERVICE_PAYMENT: <Store className="size-4" />,
  ADMIN_CREDIT: <ShieldCheck className="size-4" />,
  ADMIN_DEBIT: <ShieldCheck className="size-4" />,
};

function typeAccent(type: string): string {
  if (POSITIVE_TYPES.has(type)) {
    return type === "TRANSFER_RECEIVED"
      ? "bg-brand-green/10 text-brand-green ring-brand-green/20"
      : "bg-gold/10 text-gold ring-gold/20";
  }
  return "bg-electric/10 text-electric-bright ring-electric/20";
}

const ACTIONS = [
  {
    href: "/compra",
    label: "Comprar SERVI",
    description: "Paga con PayPal",
    icon: ShoppingCart,
    primary: true,
  },
  { href: "/enviar", label: "Enviar SERVI", description: "A otros usuarios", icon: Send },
  { href: "/recibir", label: "Recibir SERVI", description: "Comparte tu @usuario", icon: ArrowDownLeft },
  { href: "/servicios", label: "Usar SERVI", description: "Paga servicios", icon: Sparkles },
];

export function DashboardClient({
  username,
  email,
  isAdmin,
  balance,
  rateServiPerUsd,
  memberSince,
  recent,
}: {
  username: string;
  email: string;
  isAdmin: boolean;
  balance: number;
  rateServiPerUsd: number;
  memberSince: Date | null;
  recent: RecentEntry[];
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Saludo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Hola, <span className="text-gold-bright">@{username}</span>
        </h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </motion.div>

      {/* Tarjeta de crédito SERVI + acciones rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mt-6"
      >
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <ServiCard
            username={username}
            balance={balance}
            rateServiPerUsd={rateServiPerUsd}
            memberSince={memberSince ?? undefined}
          />

          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Acciones rápidas
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group flex flex-col gap-1.5 rounded-2xl border p-3.5 transition-all hover:-translate-y-0.5 ${
                      action.primary
                        ? "border-transparent bg-gradient-to-br from-electric to-electric-bright text-white shadow-[0_10px_28px_-12px_rgba(46,107,255,0.8)]"
                        : "border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`size-5 ${action.primary ? "text-white" : "text-electric-bright"}`} aria-hidden />
                    <span className="text-sm font-semibold leading-tight">{action.label}</span>
                    <span
                      className={`text-[11px] leading-tight ${
                        action.primary ? "text-white/75" : "text-muted-foreground"
                      }`}
                    >
                      {action.description}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Precio real del token (tasa oficial del servidor) */}
            <div className="glow-card mt-4 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="size-3.5 text-brand-green" aria-hidden />
                  Precio del token
                </p>
                <span className="flex items-center gap-1.5 rounded-full border border-brand-green/25 bg-brand-green/10 px-2 py-0.5">
                  <span
                    className="size-1.5 animate-pulse rounded-full bg-brand-green shadow-[0_0_8px_rgba(45,212,167,0.9)]"
                    aria-hidden
                  />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-brand-green">
                    En vivo · Servidor
                  </span>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-3xl font-bold tabular-nums text-gold-bright drop-shadow-[0_2px_14px_rgba(212,176,106,0.35)]">
                  ${formatTokenPriceUsd(1 / rateServiPerUsd)}
                </span>
                <span className="text-xs font-medium text-muted-foreground">USD / 1 SERVI</span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                  Tasa oficial: {formatServi(rateServiPerUsd)} SERVI = $1 USD
                </span>
              </div>

              <Link
                href="/compra"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-electric-bright transition-colors hover:text-electric"
              >
                Comprar al precio oficial →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admin quick access */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <Link
            href="/admin"
            className="glow-card mt-4 flex items-center justify-between rounded-2xl border-gold/25 bg-gold/5 px-5 py-3.5 transition-colors hover:bg-gold/10"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium text-gold-bright">
              <ShieldCheck className="size-4" />
              Tienes acceso al panel de administración
            </span>
            <span className="text-xs font-semibold text-gold-bright underline-offset-2 hover:underline">
              Abrir →
            </span>
          </Link>
        </motion.div>
      )}

      {/* Actividad reciente */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8"
        aria-label="Actividad reciente"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <History className="size-4.5 text-electric-bright" aria-hidden />
            Actividad reciente
          </h2>
          <Link
            href="/historial"
            className="text-sm font-medium text-electric-bright transition-colors hover:text-electric"
          >
            Ver historial completo →
          </Link>
        </div>

        {recent.length === 0 ? (
          <Card className="glow-card border-dashed border-white/15 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <Coins className="size-7" aria-hidden />
              </span>
              <p className="font-medium text-foreground">Aún no tienes movimientos</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Compra tus primeros SERVI con PayPal y empieza a usar tu billetera interna.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-1 bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
              >
                <Link href="/compra">Comprar SERVI</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glow-card overflow-hidden border-white/10 bg-card">
            <ul className="divide-y divide-white/5">
              {recent.map((entry) => {
                const positive = POSITIVE_TYPES.has(entry.type);
                return (
                  <li key={entry.id} className="flex items-center gap-3.5 px-4 py-3.5 sm:px-6">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${typeAccent(entry.type)}`}
                      aria-hidden
                    >
                      {TYPE_ICONS[entry.type] ?? <Coins className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {LEDGER_TYPE_LABELS[entry.type] ?? entry.type} ·{" "}
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          positive ? "text-brand-green" : "text-foreground"
                        }`}
                      >
                        {positive ? "+" : "−"}
                        {formatServi(entry.amount)} SERVI
                      </p>
                      <p className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                        <BadgeCheck className="size-3 text-brand-green" aria-hidden />
                        {entry.status}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </motion.section>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-48 bg-white/5" />
      <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
      <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
    </div>
  );
}
