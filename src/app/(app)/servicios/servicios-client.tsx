"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Coins,
  Headphones,
  Loader2,
  Megaphone,
  Rocket,
  Shield,
  Sparkles,
  Star,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenLiveTicker } from "@/components/app/token-pulse";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatUsd } from "@/lib/format";

interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceServi: number;
  icon: string | null;
}

const ICONS: Record<string, React.ReactNode> = {
  zap: <Zap className="size-6" />,
  shield: <Shield className="size-6" />,
  rocket: <Rocket className="size-6" />,
  headphones: <Headphones className="size-6" />,
  megaphone: <Megaphone className="size-6" />,
  star: <Star className="size-6" />,
  sparkles: <Sparkles className="size-6" />,
};

type Phase = "idle" | "confirm" | "paying" | "success" | "error";

export function ServiciosClient() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [rate, setRate] = useState(100);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const idempotencyRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    (async () => {
      try {
        const [servicesRes, meRes] = await Promise.all([
          fetch("/api/services", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        const servicesData = await servicesRes.json();
        const meData = await meRes.json();
        if (servicesRes.ok) {
          setServices(servicesData.services);
          setRate(servicesData.rateServiPerUsd);
        }
        if (meRes.ok) setWalletBalance(meData.balance);
      } catch {
        /* se muestra estado vacío */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function pay() {
    if (!selected) return;
    setPhase("paying");
    setMessage(null);
    try {
      const res = await fetch("/api/services/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: selected.id, idempotencyKey: idempotencyRef.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("error");
        setMessage(data.message ?? "No se pudo completar el pago del servicio.");
        return;
      }
      setPhase("success");
      idempotencyRef.current = crypto.randomUUID();
      router.refresh();
      // actualizar saldo local
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = await meRes.json();
      if (meRes.ok) setWalletBalance(meData.balance);
    } catch {
      setPhase("error");
      setMessage("Error de conexión. El pago no fue procesado.");
    }
  }

  function openConfirm(service: ServiceItem) {
    setSelected(service);
    setPhase("confirm");
    setMessage(null);
  }

  function closeDialog() {
    setSelected(null);
    setPhase("idle");
    setMessage(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <TokenLiveTicker />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <Sparkles className="size-6 text-gold" aria-hidden />
          Usar SERVI
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Paga los servicios disponibles de la plataforma con tu saldo interno. Sin tarjetas, sin
          comisiones.
        </p>
        {walletBalance !== null && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-bright">
            <Coins className="size-3.5" aria-hidden />
            Saldo: {walletBalance.toLocaleString("es-DO", { maximumFractionDigits: 2 })} SERVI
          </p>
        )}
      </motion.div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="mt-6 border-dashed border-white/15 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground">
              <Sparkles className="size-7" aria-hidden />
            </span>
            <p className="font-medium text-foreground">No hay servicios disponibles ahora</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Estamos preparando nuevos servicios para que uses tus SERVI. Vuelve pronto.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex h-full flex-col border-white/10 bg-card transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)]">
                <CardContent className="flex flex-1 flex-col p-5">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-electric/10 text-electric-bright ring-1 ring-electric/20">
                    {ICONS[service.icon ?? "sparkles"] ?? ICONS.sparkles}
                  </span>
                  <h2 className="mt-3.5 font-semibold text-foreground">{service.name}</h2>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-4 flex items-end justify-between border-t border-white/5 pt-4">
                    <div>
                      <p className="text-lg font-bold text-gold-bright">
                        {service.priceServi.toLocaleString("es-DO", { maximumFractionDigits: 2 })}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">SERVI</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        ≈ ${formatUsd(service.priceServi / rate)} USD
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openConfirm(service)}
                      className="bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
                      disabled={
                        walletBalance !== null && walletBalance < service.priceServi
                      }
                    >
                      {walletBalance !== null && walletBalance < service.priceServi
                        ? "Saldo insuficiente"
                        : "Pagar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmación / resultado */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && phase !== "paying") closeDialog();
        }}
      >
        <DialogContent className="border-white/10 bg-card sm:max-w-md">
          {phase === "success" && selected ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-green/15 text-brand-green ring-1 ring-brand-green/30">
                <BadgeCheck className="size-8" aria-hidden />
              </span>
              <DialogHeader className="items-center">
                <DialogTitle>Servicio activado</DialogTitle>
                <DialogDescription>
                  Pagaste {selected.priceServi.toLocaleString("es-DO")} SERVI por{" "}
                  <span className="font-semibold text-foreground">{selected.name}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="flex w-full flex-col gap-2.5 sm:flex-row">
                <Button onClick={closeDialog} variant="outline" className="w-full border-white/15">
                  Seguir explorando
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95">
                  <Link href="/historial">Ver en historial</Link>
                </Button>
              </div>
            </div>
          ) : phase === "error" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive ring-1 ring-destructive/30">
                <XCircle className="size-8" aria-hidden />
              </span>
              <DialogHeader className="items-center">
                <DialogTitle>No se pudo completar</DialogTitle>
                <DialogDescription>{message}</DialogDescription>
              </DialogHeader>
              <Button onClick={() => setPhase("confirm")} variant="outline" className="border-white/15">
                Intentar de nuevo
              </Button>
            </div>
          ) : (
            selected && (
              <>
                <DialogHeader>
                  <DialogTitle>Confirmar pago de servicio</DialogTitle>
                  <DialogDescription>Esta acción se debita de tu saldo SERVI.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2.5 rounded-xl border border-white/10 bg-navy-2/60 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio</span>
                    <span className="font-semibold text-foreground">{selected.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio</span>
                    <span className="font-bold text-gold-bright">
                      {selected.priceServi.toLocaleString("es-DO")} SERVI
                    </span>
                  </div>
                  {walletBalance !== null && (
                    <div className="flex justify-between border-t border-white/5 pt-2.5">
                      <span className="text-muted-foreground">Saldo restante</span>
                      <span className="text-foreground">
                        {(walletBalance - selected.priceServi).toLocaleString("es-DO", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        SERVI
                      </span>
                    </div>
                  )}
                </div>
                {message && phase === "error" && <p className="text-sm text-destructive">{message}</p>}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    disabled={phase === "paying"}
                    className="border-white/15"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={pay}
                    disabled={phase === "paying"}
                    className="bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
                  >
                    {phase === "paying" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Procesando…
                      </>
                    ) : (
                      <>
                        <Coins className="size-4" /> Pagar ahora
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
