"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatServi, formatUsd } from "@/lib/format";

interface Purchase {
  id: string;
  username: string;
  tokensAmount: number;
  usdAmount: number;
  status: string;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-brand-green/15 text-brand-green border-brand-green/30",
  PENDING: "bg-gold/15 text-gold-bright border-gold/30",
  CREATED: "bg-white/10 text-muted-foreground border-white/15",
  FAILED: "bg-destructive/15 text-destructive border-destructive/30",
  CANCELLED: "bg-destructive/10 text-destructive/80 border-destructive/20",
  REFUNDED: "bg-electric/10 text-electric-bright border-electric/30",
};

export function AdminPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/purchases?page=${pageNum}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setPurchases(data.purchases);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <Card className="border-white/10 bg-card">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Compras PayPal</h2>
          <p className="text-xs text-muted-foreground">{total} registros</p>
        </div>
        <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 bg-navy-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">SERVI</th>
                <th className="px-4 py-3 font-medium">USD</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">PayPal Order</th>
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
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Todavía no hay compras.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-foreground">@{p.username}</td>
                    <td className="px-4 py-3 font-bold tabular-nums text-gold-bright">
                      {formatServi(p.tokensAmount)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      ${formatUsd(p.usdAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_STYLE[p.status] ?? "border-white/15"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] truncate font-mono text-[11px] text-muted-foreground">
                        {p.paypalOrderId ?? "—"}
                      </p>
                      {p.paypalCaptureId && (
                        <p className="max-w-[180px] truncate font-mono text-[10px] text-brand-green/70">
                          {p.paypalCaptureId}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(p.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {page < totalPages && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => load(page + 1)}
              className="rounded-lg border border-white/15 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              Cargar más
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
