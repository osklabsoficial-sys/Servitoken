"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Coins,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatServi, formatUsd } from "@/lib/format";

declare global {
  interface Window {
    paypal?: any;
  }
}


const PRESETS = [100, 500, 1000];
const MIN_TOKENS = 10;
const MAX_TOKENS = 1_000_000;
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

interface PaypalSdkConfig {
  configured: boolean;
  clientId: string | null;
  env: string;
}

type Phase = "idle" | "processing" | "success" | "cancelled" | "error";

export function ComprarClient({
  rateServiPerUsd,
  username,
}: {
  rateServiPerUsd: number;
  username: string;
}) {
  const router = useRouter();

  const [preset, setPreset] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [amount, setAmount] = useState<number | null>(500);
  const [quote, setQuote] = useState<{ usd: string; rateServiPerUsd: number } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  const [sdkConfig, setSdkConfig] = useState<PaypalSdkConfig | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [success, setSuccess] = useState<{ tokens: number; usd: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const amountRef = useRef<number | null>(500);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRenderedRef = useRef(false);

  /* ------------------------- Cantidad ------------------------- */

  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  function selectPreset(value: number) {
    setPreset(value);
    setCustom("");
    setAmount(value);
    setAmountError(null);
  }

  function onCustomChange(raw: string) {
    setCustom(raw);
    setPreset(null);
    if (raw.trim() === "") {
      setAmount(null);
      setAmountError(null);
      setQuote(null);
      return;
    }
    if (!AMOUNT_RE.test(raw.trim())) {
      setAmount(null);
      setAmountError("Solo se permiten números con máximo 2 decimales.");
      return;
    }
    const value = parseFloat(raw.trim());
    if (value < MIN_TOKENS) {
      setAmount(null);
      setAmountError(`La cantidad mínima es ${MIN_TOKENS} SERVI.`);
      return;
    }
    if (value > MAX_TOKENS) {
      setAmount(null);
      setAmountError(`La cantidad máxima es ${formatServi(MAX_TOKENS)} SERVI.`);
      return;
    }
    setAmount(value);
    setAmountError(null);
  }

  /* --------------------- Cotización server --------------------- */

  useEffect(() => {
    if (amount === null) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const res = await fetch(`/api/payments/paypal/quote?tokens=${amount}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setQuote({ usd: data.usdFormatted, rateServiPerUsd: data.rateServiPerUsd });
        }
      } catch {
        /* la UI muestra el cálculo local de respaldo */
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount]);

  /* ------------------------ SDK PayPal ------------------------ */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/paypal/config", { cache: "no-store" });
        const data = (await res.json()) as PaypalSdkConfig;
        if (cancelled) return;
        setSdkConfig(data);
        if (!data.configured || !data.clientId || window.paypal) {
          if (window.paypal) setSdkReady(true);
          return;
        }
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          data.clientId
        )}&currency=USD&intent=capture&components=buttons`;
        script.async = true;
        script.onload = () => {
          if (!cancelled) setSdkReady(true);
        };
        script.onerror = () => {
          if (!cancelled) setSdkError(true);
        };
        document.body.appendChild(script);
      } catch {
        if (!cancelled) setSdkError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------- Botones PayPal ---------------------- */

  useEffect(() => {
    if (!sdkReady || buttonsRenderedRef.current || !containerRef.current) return;
    if (!window.paypal?.Buttons) return;

    buttonsRenderedRef.current = true;
    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 46 },
        createOrder: async () => {
          const tokens = amountRef.current;
          if (!tokens) throw new Error("Selecciona una cantidad primero.");
          const res = await fetch("/api/payments/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokensAmount: tokens }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message ?? "No se pudo iniciar el pago.");
          }
          return data.orderId as string;
        },
        onApprove: async (data: { orderID: string }) => {
          setPhase("processing");
          setMessage("Confirmando tu pago de forma segura…");
          try {
            const res = await fetch("/api/payments/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const body = await res.json();
            if (!res.ok) {
              setPhase("error");
              setMessage(body.message ?? "No se pudo confirmar el pago.");
              return;
            }
            setSuccess({ tokens: body.tokensAmount, usd: quote?.usd ?? "" });
            setPhase("success");
            router.refresh();
          } catch {
            setPhase("error");
            setMessage("Error de conexión al confirmar el pago.");
          }
        },
        onCancel: () => {
          setPhase("cancelled");
          setMessage("Has cancelado el pago. Puedes intentarlo de nuevo cuando quieras.");
        },
        onError: () => {
          setPhase("error");
          setMessage("Ocurrió un error con PayPal. Intenta de nuevo.");
        },
      })
      .render(containerRef.current)
      .catch(() => {
        buttonsRenderedRef.current = false;
        setSdkError(true);
      });
  }, [sdkReady, quote, router]);

  function resetFlow() {
    setPhase("idle");
    setMessage(null);
    setSuccess(null);
  }

  const usdLocal = amount !== null ? amount / rateServiPerUsd : null;
  const canPay = amount !== null && !amountError;

  /* ------------------------- Estados -------------------------- */

  if (phase === "success" && success) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-brand-green/30 bg-card">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-10">
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-green/15 text-brand-green ring-1 ring-brand-green/30">
                <BadgeCheck className="size-9" aria-hidden />
              </span>
              <h1 className="text-2xl font-bold text-foreground">Pago recibido</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                <span className="font-bold text-gold-bright">
                  {formatServi(success.tokens)} SERVI
                </span>{" "}
                fueron agregados correctamente a tu saldo.
              </p>
              <div className="mt-2 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                <Button
                  asChild
                  className="bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
                >
                  <a href="/inicio">Ir a mi Dashboard</a>
                </Button>
                <Button variant="outline" onClick={resetFlow} className="border-white/15">
                  <RefreshCw className="size-4" /> Comprar más
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Comprar SERVI
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Hola <span className="font-medium text-foreground">@{username}</span>, elige la cantidad
          de SERVI que quieres agregar a tu billetera interna. El precio se calcula en el servidor
          con la tasa oficial ({formatServi(rateServiPerUsd)} SERVI = $1 USD).
        </p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Selector de cantidad */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-white/10 bg-card">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                1 · Elige tu cantidad
              </h2>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {PRESETS.map((value) => {
                  const active = preset === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectPreset(value)}
                      aria-pressed={active}
                      className={`rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5 ${
                        active
                          ? "border-gold/60 bg-gold/10 shadow-[0_8px_24px_-10px_rgba(212,176,106,0.5)]"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <Coins className={`mx-auto size-5 ${active ? "text-gold" : "text-muted-foreground"}`} aria-hidden />
                      <p className={`mt-1.5 text-lg font-bold ${active ? "text-gold-bright" : "text-foreground"}`}>
                        {formatServi(value)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">SERVI</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <label htmlFor="custom-amount" className="text-sm font-medium text-foreground">
                  Otra cantidad
                </label>
                <div className="relative mt-1.5">
                  <Input
                    id="custom-amount"
                    inputMode="decimal"
                    placeholder="Ej: 250"
                    value={custom}
                    onChange={(e) => onCustomChange(e.target.value)}
                    className="h-11 border-white/10 bg-input/60 pr-16"
                    autoComplete="off"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    SERVI
                  </span>
                </div>
                {amountError && (
                  <p role="alert" className="mt-1.5 text-xs text-destructive">
                    {amountError}
                  </p>
                )}
              </div>

              {/* Resumen de precio */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-navy-2/60 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cantidad</span>
                  <span className="font-semibold text-foreground">
                    {amount !== null ? `${formatServi(amount)} SERVI` : "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    Total a pagar
                    {quoteLoading && <Loader2 className="size-3 animate-spin" aria-hidden />}
                  </span>
                  <span className="text-lg font-bold text-gold-bright">
                    ${quote?.usd ?? (usdLocal !== null ? formatUsd(usdLocal) : "—")}{" "}
                    <span className="text-xs font-medium text-muted-foreground">USD</span>
                  </span>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
                  El monto final lo confirma el servidor al crear la orden (protección anti
                  manipulación de precios).
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pago */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-white/10 bg-card">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                2 · Paga con PayPal
              </h2>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/5 px-3.5 py-2.5 text-xs text-brand-green">
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
                Pago real y seguro con PayPal · Protección al comprador
              </div>

              {phase === "processing" && (
                <div className="mt-5 flex items-center justify-center gap-2.5 rounded-xl border border-electric/25 bg-electric/5 px-4 py-3.5 text-sm text-electric-bright">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {message ?? "Procesando…"}
                </div>
              )}

              {phase === "cancelled" && (
                <div className="mt-5">
                  <div className="flex items-start gap-2.5 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3.5 text-sm text-gold-bright">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {message}
                  </div>
                  <Button onClick={resetFlow} variant="outline" className="mt-3 w-full border-white/15">
                    <RefreshCw className="size-4" /> Intentar de nuevo
                  </Button>
                </div>
              )}

              {phase === "error" && (
                <div className="mt-5">
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-sm text-destructive">
                    <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {message}
                  </div>
                  <Button onClick={resetFlow} variant="outline" className="mt-3 w-full border-white/15">
                    <RefreshCw className="size-4" /> Intentar de nuevo
                  </Button>
                </div>
              )}

              <div className={phase === "idle" ? "mt-5" : "hidden"}>
                {sdkError ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-6 text-center">
                    <AlertTriangle className="size-5 text-destructive" aria-hidden />
                    <p className="text-sm text-foreground">No se pudo cargar PayPal.</p>
                    <p className="text-xs text-muted-foreground">
                      Verifica tu conexión y recarga la página para intentarlo de nuevo.
                    </p>
                  </div>
                ) : sdkConfig && !sdkConfig.configured ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-4 py-6 text-center">
                    <AlertTriangle className="size-5 text-gold" aria-hidden />
                    <p className="text-sm font-medium text-gold-bright">
                      Pasarela no configurada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Las credenciales de PayPal aún no están activas en el servidor.
                    </p>
                  </div>
                ) : !sdkReady ? (
                  <div className="flex h-[46px] items-center justify-center rounded-md border border-white/10 bg-white/5 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Cargando PayPal…
                  </div>
                ) : (
                  <div ref={containerRef} aria-label="Botones de pago de PayPal" />
                )}
              </div>

              {phase === "idle" && (
                <p className="mt-4 text-center text-[11px] text-muted-foreground">
                  Al pagar, los SERVI se acreditan automáticamente en tu billetera interna.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 rounded-2xl border border-white/10 bg-card/60 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">¿Cómo funciona?</p>
            <ol className="mt-1.5 list-inside list-decimal space-y-1">
              <li>Elige la cantidad de SERVI (mínimo {MIN_TOKENS}).</li>
              <li>Paga el monto en USD con tu cuenta PayPal.</li>
              <li>El servidor confirma el pago con PayPal y acredita tu saldo al instante.</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
