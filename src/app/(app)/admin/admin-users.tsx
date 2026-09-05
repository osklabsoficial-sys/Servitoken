"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, CheckCircle2, Loader2, Search, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatServi } from "@/lib/format";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  createdAt: string;
  counts: { purchases: number; transfersSent: number; servicePayments: number; ledgerEntries: number };
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-brand-green/15 text-brand-green border-brand-green/30",
  BLOCKED: "bg-destructive/15 text-destructive border-destructive/30",
  SUSPENDED: "bg-gold/15 text-gold-bright border-gold/30",
};

export function AdminUsers({ onChanged }: { onChanged: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}&page=${pageNum}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q, 1), 300);
    return () => clearTimeout(t);
  }, [q, load]);

  async function changeStatus(userId: string, status: "ACTIVE" | "BLOCKED" | "SUSPENDED") {
    setBusyId(userId);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "No se pudo actualizar el estado.");
        return;
      }
      await load(q, page);
      onChanged();
    } catch {
      setError("Error de conexión.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="border-white/10 bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por @usuario o correo…"
              className="h-10 border-white/10 bg-input/60 pl-9"
              aria-label="Buscar usuarios"
            />
          </div>
          <p className="text-xs text-muted-foreground">{total} usuarios</p>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="sticky top-0 bg-navy-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Saldo</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Registro</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-8 w-full bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">@{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {u.counts.purchases} compras · {u.counts.transfersSent} envíos ·{" "}
                        {u.counts.ledgerEntries} movimientos
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-gold-bright">
                      {formatServi(u.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          u.role === "USER"
                            ? "border-white/15 text-muted-foreground"
                            : "border-gold/40 text-gold-bright"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_BADGE[u.status] ?? "border-white/15"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {u.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === u.id}
                            onClick={() => changeStatus(u.id, "BLOCKED")}
                            className="h-8 border-destructive/30 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            {busyId === u.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Ban className="size-3.5" />
                            )}
                            Bloquear
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === u.id}
                            onClick={() => changeStatus(u.id, "ACTIVE")}
                            className="h-8 border-brand-green/30 px-2.5 text-brand-green hover:bg-brand-green/10 hover:text-brand-green"
                          >
                            {busyId === u.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-3.5" />
                            )}
                            Activar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {page < totalPages && (
          <div className="mt-3 flex justify-center">
            <Button variant="outline" size="sm" onClick={() => load(q, page + 1)} className="border-white/15">
              Cargar más (página {page}/{totalPages})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
