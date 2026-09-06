"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatServi } from "@/lib/format";

interface Transfer {
  id: string;
  reference: string;
  senderUsername: string;
  receiverUsername: string;
  amount: number;
  note: string | null;
  status: string;
  createdAt: string;
}

export function AdminTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transfers?page=${pageNum}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setTransfers(data.transfers);
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
          <h2 className="font-semibold text-foreground">Transferencias entre usuarios</h2>
          <p className="text-xs text-muted-foreground">{total} registros</p>
        </div>
        <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="sticky top-0 bg-navy-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">De → Para</th>
                <th className="px-4 py-3 font-medium">Cantidad</th>
                <th className="px-4 py-3 font-medium">Nota</th>
                <th className="px-4 py-3 font-medium">Referencia</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <Skeleton className="h-7 w-full bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Todavía no hay transferencias.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">@{t.senderUsername}</span>
                      <span className="mx-1.5 text-muted-foreground">→</span>
                      <span className="font-medium text-foreground">@{t.receiverUsername}</span>
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-gold-bright">
                      {formatServi(t.amount)} SERVI
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-muted-foreground">
                      {t.note ?? "—"}
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3 font-mono text-[11px] text-muted-foreground">
                      {t.reference}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(t.createdAt)}
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
