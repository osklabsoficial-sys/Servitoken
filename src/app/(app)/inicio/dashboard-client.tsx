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
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatServi, formatUsd, LEDGER_TYPE_LABELS, POSITIVE_TYPES } from "@/lib/format";

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
    href: "/comprar",
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
  recent,
}: {
  username: string;
  email: string;
  isAdmin: boolean;
  balance: number;
  rateServiPerUsd: number;
  recent: RecentEntry[];
}) {
  const usd = balance / rateServiPerUsd;

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

      {/* Saldo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="mt-6 overflow-hidden border-white/10 bg-gradient-to-br from-card via-card to-navy-2">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Wallet className="size-3.5" aria-hidden />
                  Saldo disponible
                </p>
                <p className="mt-2 flex items-baseline gap-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  <span className="tabular-nums text-gold-bright">{formatServi(balance)}</span>
                  <span className="text-lg font-semibold text-muted-foreground sm:text-xl">SERVI</span>
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  ≈ ${formatUsd(usd)} USD · Tasa: {formatServi(rateServiPerUsd)} SERVI = $1 USD
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-md lg:grid-cols-2 xl:grid-cols-4">
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin quick access */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <Link
            href="/admin"
            className="mt-4 flex items-center justify-between rounded-2xl border border-gold/25 bg-gold/5 px-5 py-3.5 transition-colors hover:bg-gold/10"
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
          <Card className="border-dashed border-white/15 bg-card/50">
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
                <Link href="/comprar">Comprar SERVI</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-white/10 bg-card">
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
