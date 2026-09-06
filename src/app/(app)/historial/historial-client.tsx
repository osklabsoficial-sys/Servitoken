"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  History,
  Loader2,
  ShoppingCart,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenLiveTicker } from "@/components/app/token-pulse";
import {
  formatDateTime,
  formatServi,
  LEDGER_TYPE_LABELS,
  POSITIVE_TYPES,
} from "@/lib/format";

interface Entry {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  reference: string;
  description: string;
  createdAt: string;
}

const FILTERS = [
  { key: "all", label: "Todo" },
  { key: "purchases", label: "Compras" },
  { key: "sent", label: "Enviados" },
  { key: "received", label: "Recibidos" },
  { key: "services", label: "Servicios" },
  { key: "adjustments", label: "Ajustes" },
] as const;

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

export function HistorialClient() {
  const [filter, setFilter] = useState<string>("all");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (currentFilter: string, pageNum: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/transactions?filter=${currentFilter}&page=${pageNum}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setEntries((prev) => (append ? [...prev, ...data.entries] : data.entries));
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch {
      /* la UI conserva los datos previos */
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(filter, 1, false);
  }, [filter, load]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <TokenLiveTicker />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <History className="size-6 text-electric-bright" aria-hidden />
          Historial de movimientos
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Compras, transferencias, pagos de servicios y ajustes administrativos.
        </p>
      </motion.div>

      {/* Filtros */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              filter === f.key
                ? "border-gold/50 bg-gold/15 text-gold-bright"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <Card className="mt-4 overflow-hidden border-white/10 bg-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-white/5" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground">
              <Coins className="size-7" aria-hidden />
            </span>
            <p className="font-medium text-foreground">Sin movimientos en este filtro</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Cuando compres, envíes o uses SERVI, aparecerá aquí automáticamente.
            </p>
          </CardContent>
        ) : (
          <ul className="divide-y divide-white/5">
            {entries.map((entry) => {
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
                    <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/70">
                      Ref: {entry.reference}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        positive ? "text-brand-green" : "text-foreground"
                      }`}
                    >
                      {positive ? "+" : "−"}
                      {formatServi(entry.amount)} SERVI
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Saldo: {formatServi(entry.balanceAfter)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Paginación */}
      {!loading && entries.length > 0 && page < totalPages && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => load(filter, page + 1, true)}
            disabled={loadingMore}
            className="border-white/15"
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Cargando…
              </>
            ) : (
              `Cargar más (${total - entries.length} restantes)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
