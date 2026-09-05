"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatServi, LEDGER_TYPE_LABELS, POSITIVE_TYPES } from "@/lib/format";

interface LedgerRow {
  id: string;
  username: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description: string;
  createdAt: string;
}

const FILTERS = [
  { key: "all", label: "Todo" },
  { key: "purchases", label: "Compras" },
  { key: "transfers", label: "Transferencias" },
  { key: "services", label: "Servicios" },
  { key: "adjustments", label: "Ajustes" },
];

export function AdminLedger() {
  const [entries, setEntries] = useState<LedgerRow[]>([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ledger?filter=${f}&page=${pageNum}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter, 1);
  }, [filter, load]);

  return (
    <Card className="border-white/10 bg-card">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-foreground">Movimientos (ledger global)</h2>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "border-gold/50 bg-gold/15 text-gold-bright"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="sticky top-0 bg-navy-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Cantidad</th>
                <th className="px-4 py-3 font-medium">Saldo resultante</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-7 w-full bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Sin movimientos.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-foreground">@{e.username}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {LEDGER_TYPE_LABELS[e.type] ?? e.type}
                    </td>
                    <td
                      className={`px-4 py-3 font-bold tabular-nums ${
                        POSITIVE_TYPES.has(e.type) ? "text-brand-green" : "text-foreground"
                      }`}
                    >
                      {POSITIVE_TYPES.has(e.type) ? "+" : "−"}
                      {formatServi(e.amount)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {formatServi(e.balanceAfter)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                      {e.description}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(e.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{total} movimientos</p>
          {page < totalPages && (
            <button
              onClick={() => load(filter, page + 1)}
              className="rounded-lg border border-white/15 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              Cargar más
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
