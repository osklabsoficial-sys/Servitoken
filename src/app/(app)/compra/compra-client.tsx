"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Blocks,
  Coins,
  ExternalLink,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConnectWallet } from "@/components/landing/connect-wallet";
import { SwapPanel } from "@/components/landing/swap-panel";
import { PancakeSwapLogo } from "@/components/landing/brand-logos";
import { ServiCard } from "@/components/app/servi-card";
import { TokenLiveTicker } from "@/components/app/token-pulse";
import {
  ApplePayFullLogo,
  GooglePayFullLogo,
  PayPalFullLogo,
  PayPalMark,
} from "@/components/brand/payment-logos";
import { formatServi, formatUsd, formatDateTime, formatTokenPriceUsd } from "@/lib/format";
import type { PaymentMethodInfo } from "@/lib/payment-methods";

declare global {
  interface Window {
    paypal?: any;
  }
}

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const PRESETS = [100, 500, 1000];
const MIN_TOKENS = 10;
const MAX_TOKENS = 1_000_000;
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

const PANCAKESWAP_URL =
  "https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443";

interface PaypalSdkConfig {
  configured: boolean;
  clientId: string | null;
  env: string;
}

interface RecentPurchase {
  id: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

type Phase = "idle" | "processing" | "success" | "cancelled" | "error";

/* ------------------------------------------------------------------ */
/*  Logo oficial por método                                            */
/* ------------------------------------------------------------------ */

function MethodBrandLogo({
  brandKey,
  className = "size-5",
}: {
  brandKey: PaymentMethodInfo["brandKey"];
  className?: string;
}) {
  switch (brandKey) {
    case "paypal":
      return <PayPalMark className={className} />;
    case "onchain":
      return <Blocks className={className} aria-hidden />;
    case "googlepay":
      return <GooglePayFullLogo className="h-5 w-auto" />;
    case "applepay":
      return <ApplePayFullLogo className="h-5 w-auto" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export function CompraClient({
  username,
  balance: initialBalance,
  rateServiPerUsd,
  memberSince,
  methods,
}: {
  username: string;
  balance: number;
  rateServiPerUsd: number;
  memberSince: Date | null;
  methods: PaymentMethodInfo[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* -------------------- Guía del agente IA --------------------- */
  /* /compra?destacar=paypal → resalta visualmente el paso 2 (método
     de pago) cuando OSK LLM trae al usuario desde el chat.          */
  const [highlightMethod, setHighlightMethod] = useState<boolean>(
    searchParams.get("destacar") === "paypal"
  );
  const methodSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!highlightMethod) return;
    // Lleva la vista a la sección señalada por el agente IA
    const t0 = setTimeout(() => {
      methodSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 600);
    const t = setTimeout(() => setHighlightMethod(false), 8_000);
    return () => {
      clearTimeout(t0);
      clearTimeout(t);
    };
  }, [highlightMethod]);

  /* --------------------------- Saldo --------------------------- */
  const [balance, setBalance] = useState<number>(initialBalance);

  /* -------------------------- Cantidad ------------------------- */
  const [preset, setPreset] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [amount, setAmount] = useState<number | null>(500);
  const [amountError, setAmountError] = useState<string | null>(null);

  /* --------------------- Cotización server --------------------- */
  const [quote, setQuote] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  /* ---------------------- Método de pago ----------------------- */
  const enabledMethods = methods.filter((m) => m.enabled);
  const paypalMethod = enabledMethods.find((m) => m.id === "paypal");
  const onchainMethod = enabledMethods.find((m) => m.id === "onchain");
  const otherMethods = enabledMethods.filter(
    (m) => m.id !== "paypal" && m.id !== "onchain"
  );

  const [methodId, setMethodId] = useState<string>(
    paypalMethod
      ? "paypal"
      : onchainMethod
        ? "onchain"
        : (enabledMethods[0]?.id ?? "")
  );
  const selectedMethod = methods.find((m) => m.id === methodId);
  const selectedIsEnabled = selectedMethod?.enabled ?? false;

  /* ------------------------ SDK PayPal ------------------------- */
  const [sdkConfig, setSdkConfig] = useState<PaypalSdkConfig | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  /* ------------------------ Flujo pago ------------------------- */
  const [phase, setPhase] = useState<Phase>("idle");
  const [success, setSuccess] = useState<{ tokens: number; usd: string } | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);

  /* --------------------- Compras recientes --------------------- */
  const [recent, setRecent] = useState<RecentPurchase[] | null>(null);

  const amountRef = useRef<number | null>(500);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRenderedRef = useRef(false);

  /* ------------------------- Cantidad -------------------------- */

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
          setQuote(data.usdFormatted as string);
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

  /* -------------------- Compras recientes ---------------------- */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/transactions?filter=purchases&page=1",
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setRecent((data.entries ?? []).slice(0, 5));
      } catch {
        if (!cancelled) setRecent([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  /* ------------------------ SDK PayPal ------------------------- */

  const [sdkAttempt, setSdkAttempt] = useState(0);
  const [embedded, setEmbedded] = useState(false);

  /* ¿La app está dentro del panel de vista previa (iframe)? */
  useEffect(() => {
    try {
      setEmbedded(window.self !== window.top);
    } catch {
      setEmbedded(true);
    }
  }, []);

  useEffect(() => {
    if (!paypalMethod) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/paypal/config", {
          cache: "no-store",
        });
        const data = (await res.json()) as PaypalSdkConfig;
        if (cancelled) return;
        setSdkConfig(data);
        if (!data.configured || !data.clientId || window.paypal) {
          if (window.paypal) setSdkReady(true);
          return;
        }
        // Reintento: limpia el <script> de un intento previo fallido
        document.getElementById("paypal-sdk-js")?.remove();
        const script = document.createElement("script");
        script.id = "paypal-sdk-js";
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          data.clientId
        )}&currency=USD&intent=capture&components=buttons`;
        script.async = true;
        // Red lenta o bloqueador: si en 15 s no hay SDK, error con reintento
        const timeout = setTimeout(() => {
          if (!cancelled && !window.paypal) setSdkError(true);
        }, 15_000);
        script.onload = () => {
          clearTimeout(timeout);
          if (!cancelled) setSdkReady(true);
        };
        script.onerror = () => {
          clearTimeout(timeout);
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
  }, [paypalMethod, sdkAttempt]);

  function retryPaypalSdk() {
    setSdkError(false);
    setSdkReady(false);
    buttonsRenderedRef.current = false;
    setSdkAttempt((a) => a + 1);
  }

  /* ---------------------- Botones PayPal ----------------------- */

  useEffect(() => {
    if (methodId !== "paypal") return;
    if (!sdkReady || !paypalContainerRef.current) return;
    if (buttonsRenderedRef.current) return;
    if (!window.paypal?.Buttons) return;

    buttonsRenderedRef.current = true;
    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          height: 48,
        },
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
            const tokens = body.tokensAmount as number;
            setSuccess({ tokens, usd: quote ?? "" });
            setBalance((b) => b + tokens);
            setPhase("success");
            router.refresh();
          } catch {
            setPhase("error");
            setMessage("Error de conexión al confirmar el pago.");
          }
        },
        onCancel: () => {
          setPhase("cancelled");
          setMessage(
            "Has cancelado el pago. Puedes intentarlo de nuevo cuando quieras."
          );
        },
        onError: () => {
          setPhase("error");
          setMessage("Ocurrió un error con PayPal. Intenta de nuevo.");
        },
      })
      .render(paypalContainerRef.current)
      .catch(() => {
        buttonsRenderedRef.current = false;
        setSdkError(true);
      });
  }, [methodId, sdkReady, quote, router]);

  /* Re-render de botones al volver de estados cancelado/error */
  useEffect(() => {
    if (phase === "idle") buttonsRenderedRef.current = false;
  }, [phase]);

  function resetFlow() {
    setPhase("idle");
    setMessage(null);
    setSuccess(null);
  }

  const usdLocal = amount !== null ? amount / rateServiPerUsd : null;

  /* --------------------- Pantalla de éxito --------------------- */

  if (phase === "success" && success) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="glow-card rounded-2xl border-brand-green/30">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-10">
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-green/15 text-brand-green ring-1 ring-brand-green/30 shadow-[0_0_30px_-6px_rgba(45,212,167,0.6)]">
                <BadgeCheck className="size-9" aria-hidden />
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                ✅ Pago completado
              </h1>
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
                  <Link href="/inicio">Ir a mi Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFlow}
                  className="border-white/15"
                >
                  <RefreshCw className="size-4" /> Comprar más
                </Button>
              </div>
            </CardContent>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ------------------------- Página ---------------------------- */

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ==================== HERO: título + tarjeta SERVI ==================== */}
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge
            variant="outline"
            className="border-gold/30 bg-gold/10 text-[10px] font-semibold uppercase tracking-wider text-gold-bright"
          >
            <Coins className="size-3" /> Billetera interna SERVI
          </Badge>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Comprar SERVI
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Hola{" "}
            <span className="font-medium text-foreground">@{username}</span>,
            elige la cantidad de SERVI que quieres agregar a tu tarjeta. El
            precio se calcula en el servidor con la tasa oficial (
            {formatServi(rateServiPerUsd)} SERVI = $1 USD).
          </p>

          {/* Precio real del token */}
          <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.07] px-3.5 py-2">
            <TrendingUp className="size-4 text-brand-green" aria-hidden />
            <span className="text-sm font-bold tabular-nums text-gold-bright">
              1 SERVI = ${formatTokenPriceUsd(1 / rateServiPerUsd)} USD
            </span>
            <span className="rounded-full border border-brand-green/25 bg-brand-green/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-green">
              Precio oficial
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_8px_24px_-10px_rgba(46,107,255,0.8)] hover:opacity-95"
            >
              <Link href="/inicio">
                <ArrowRight className="size-4" /> Ir a mi panel
              </Link>
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-brand-green" aria-hidden />
              Compra protegida y verificada por el servidor
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
        >
          <ServiCard
            username={username}
            balance={balance}
            rateServiPerUsd={rateServiPerUsd}
            memberSince={memberSince ?? undefined}
          />
        </motion.div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Columna izquierda: cantidad + método + checkout */}
        <div className="flex flex-col gap-6">
          {/* Paso 1 · Cantidad */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
          >
            <div className="glow-card rounded-2xl">
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
                            ? "border-gold/60 bg-gold/10 shadow-[0_8px_24px_-10px_rgba(212,176,106,0.55),0_0_24px_-6px_rgba(212,176,106,0.35)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <Coins
                          className={`mx-auto size-5 ${
                            active ? "text-gold" : "text-muted-foreground"
                          }`}
                          aria-hidden
                        />
                        <p
                          className={`mt-1.5 text-lg font-bold ${
                            active ? "text-gold-bright" : "text-foreground"
                          }`}
                        >
                          {formatServi(value)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          SERVI · ≈ ${formatUsd(value / rateServiPerUsd)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="custom-amount"
                    className="text-sm font-medium text-foreground"
                  >
                    Cantidad personalizada
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
              </CardContent>
            </div>
          </motion.div>

          {/* Paso 2 · Método de pago (logos oficiales + estado real) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            ref={highlightMethod ? methodSectionRef : undefined}
          >
            <div
              className={`glow-card rounded-2xl ${
                highlightMethod ? "agent-highlight" : ""
              }`}
            >
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  2 · Método de pago
                </h2>

                <div className="mt-4 flex flex-col gap-2.5" role="radiogroup" aria-label="Métodos de pago disponibles">
                  {methods.map((m) => {
                    const active = methodId === m.id;
                    const disabled = !m.enabled;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          setMethodId(m.id);
                          resetFlow();
                        }}
                        className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                          disabled
                            ? "cursor-not-allowed border-white/[0.06] bg-white/[0.02] opacity-55"
                            : active
                              ? "border-electric/60 bg-electric/10 shadow-[0_0_28px_-8px_rgba(46,107,255,0.5)]"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                            m.brandKey === "paypal"
                              ? "bg-white text-[#003087] ring-white/20"
                              : m.brandKey === "googlepay" || m.brandKey === "applepay"
                                ? "bg-white ring-white/20"
                                : "bg-amber-400/10 text-amber-300 ring-amber-400/20"
                          }`}
                        >
                          <MethodBrandLogo brandKey={m.brandKey} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {m.name}
                            </span>
                            {m.enabled ? (
                              <Badge
                                variant="outline"
                                className="border-brand-green/30 bg-brand-green/10 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-brand-green"
                              >
                                <ShieldCheck className="size-2.5" /> Configurado
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-gold/30 bg-gold/10 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-gold-bright"
                              >
                                <Lock className="size-2.5" /> Pendiente
                              </Badge>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {m.description}
                          </span>
                        </span>
                        <span
                          className={`size-4 shrink-0 rounded-full border-2 ${
                            active
                              ? "border-electric bg-electric"
                              : "border-white/25"
                          }`}
                          aria-hidden
                        />
                      </button>
                    );
                  })}
                </div>

                {enabledMethods.length === 0 && (
                  <p className="mt-3 flex items-center gap-1.5 rounded-xl border border-gold/25 bg-gold/10 px-3.5 py-2.5 text-xs text-gold-bright">
                    <Info className="size-3.5 shrink-0" aria-hidden />
                    Ningún método está configurado todavía en el servidor. El
                    administrador debe activar sus credenciales.
                  </p>
                )}
                {methods.some((m) => !m.enabled) && (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Los métodos marcados como{" "}
                    <span className="font-semibold text-gold-bright">
                      Pendiente
                    </span>{" "}
                    se activarán automáticamente cuando el administrador añada
                    sus credenciales en el servidor.
                  </p>
                )}
              </CardContent>
            </div>
          </motion.div>

          {/* Paso 3 · Checkout */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glow-card rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  3 · Completa el pago
                </h2>

                {amount === null && selectedIsEnabled && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-3.5 py-3 text-xs text-gold-bright">
                    <Info className="size-3.5 shrink-0" aria-hidden />
                    Selecciona una cantidad válida para continuar.
                  </div>
                )}

                {/* --- Método pendiente: nunca seleccionable --- */}
                {amount !== null && !selectedIsEnabled && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3.5 text-sm text-gold-bright">
                    <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {selectedMethod?.name} está pendiente de configuración.
                      Solo los métodos con el sello{" "}
                      <span className="font-semibold">CONFIGURADO</span> pueden
                      procesar pagos.
                    </span>
                  </div>
                )}

                {/* ==================== PAYPAL ==================== */}
                {amount !== null && selectedIsEnabled && methodId === "paypal" && (
                  <>
                    {/* Cabecera oficial PayPal */}
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-white ring-1 ring-white/20">
                          <PayPalMark className="size-5" />
                        </span>
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            Pagar con PayPal
                            <Badge
                              variant="outline"
                              className="border-brand-green/30 bg-brand-green/10 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-brand-green"
                            >
                              <ShieldCheck className="size-2.5" /> Configurado
                            </Badge>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Total a pagar:{" "}
                            <span className="font-semibold text-foreground">
                              ${quote ?? (usdLocal !== null ? formatUsd(usdLocal) : "—")} USD
                            </span>
                          </p>
                        </div>
                      </div>
                      <PayPalFullLogo className="hidden h-7 w-auto sm:block" />
                    </div>

                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/5 px-3.5 py-2.5 text-xs text-brand-green">
                      <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
                      Pago real y seguro con PayPal · Protección al comprador
                    </div>

                    {phase === "processing" && (
                      <div className="mt-4 flex items-center justify-center gap-2.5 rounded-xl border border-electric/25 bg-electric/5 px-4 py-3.5 text-sm text-electric-bright">
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        {message ?? "Procesando…"}
                      </div>
                    )}

                    {phase === "cancelled" && (
                      <div className="mt-4">
                        <div className="flex items-start gap-2.5 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3.5 text-sm text-gold-bright">
                          <AlertTriangle
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden
                          />
                          {message}
                        </div>
                        <Button
                          onClick={resetFlow}
                          variant="outline"
                          className="mt-3 w-full border-white/15"
                        >
                          <RefreshCw className="size-4" /> Intentar de nuevo
                        </Button>
                      </div>
                    )}

                    {phase === "error" && (
                      <div className="mt-4">
                        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-sm text-destructive">
                          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                          {message}
                        </div>
                        <Button
                          onClick={resetFlow}
                          variant="outline"
                          className="mt-3 w-full border-white/15"
                        >
                          <RefreshCw className="size-4" /> Intentar de nuevo
                        </Button>
                      </div>
                    )}

                    <div className={phase === "idle" ? "mt-4" : "hidden"}>
                      {embedded && !sdkError && (
                        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3 text-xs text-gold-bright">
                          <Info
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden
                          />
                          <span>
                            Estás viendo ServiToken dentro del panel de vista
                            previa; PayPal suele bloquearse en marcos anidados.{" "}
                            <a
                              href="/compra"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold underline underline-offset-2 hover:text-gold"
                            >
                              Abre la app en una pestaña nueva
                            </a>{" "}
                            para pagar sin problemas.
                          </span>
                        </div>
                      )}
                      {sdkError ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-6 text-center">
                          <AlertTriangle
                            className="size-5 text-destructive"
                            aria-hidden
                          />
                          <p className="text-sm text-foreground">
                            No se pudo cargar PayPal.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Revisa tu conexión o desactiva bloqueadores de
                            anuncios para paypal.com y reintenta.
                          </p>
                          <Button
                            onClick={retryPaypalSdk}
                            variant="outline"
                            className="mt-1 border-white/15"
                          >
                            <RefreshCw className="size-4" /> Reintentar
                          </Button>
                        </div>
                      ) : sdkConfig && !sdkConfig.configured ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-4 py-6 text-center">
                          <AlertTriangle
                            className="size-5 text-gold"
                            aria-hidden
                          />
                          <p className="text-sm font-medium text-gold-bright">
                            Pasarela no configurada
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Las credenciales de PayPal aún no están activas en
                            el servidor.
                          </p>
                        </div>
                      ) : !sdkReady ? (
                        <div className="flex h-12 items-center justify-center rounded-md border border-white/10 bg-white/5 text-sm text-muted-foreground">
                          <Loader2
                            className="mr-2 size-4 animate-spin"
                            aria-hidden
                          />
                          Cargando PayPal…
                        </div>
                      ) : (
                        <div
                          ref={paypalContainerRef}
                          aria-label="Botones de pago de PayPal"
                        />
                      )}
                    </div>

                    {phase === "idle" && (
                      <p className="mt-4 text-center text-[11px] text-muted-foreground">
                        Al pagar, los SERVI se acreditan automáticamente en tu
                        billetera interna.
                      </p>
                    )}
                  </>
                )}

                {/* ==================== ON-CHAIN ==================== */}
                {amount !== null && selectedIsEnabled && methodId === "onchain" && (
                  <div className="mt-4">
                    <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3.5">
                      <PancakeSwapLogo className="mt-0.5 size-6 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Compra on-chain con BNB o USDT
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          Intercambia BNB/USDT por SERVI directamente en BNB
                          Smart Chain. Conecta tu wallet abajo y usa el panel de
                          intercambio, o abre PancakeSwap.
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="mt-3 w-full bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
                    >
                      <a
                        href={PANCAKESWAP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ir a PancakeSwap <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          </motion.div>
        </div>

        {/* Columna derecha: resumen + compras recientes */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
          >
            <TokenLiveTicker />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="glow-card rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Resumen del pedido
                </h2>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cantidad</span>
                  <span className="font-semibold text-foreground">
                    {amount !== null ? `${formatServi(amount)} SERVI` : "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Método</span>
                  <span className="font-semibold text-foreground">
                    {selectedMethod?.name ?? "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Precio unitario</span>
                  <span className="font-semibold text-foreground">
                    1 SERVI = ${formatTokenPriceUsd(1 / rateServiPerUsd)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    Precio total
                    {quoteLoading && (
                      <Loader2 className="size-3 animate-spin" aria-hidden />
                    )}
                  </span>
                  <span className="text-lg font-bold text-gold-bright drop-shadow-[0_2px_12px_rgba(212,176,106,0.35)]">
                    ${quote ?? (usdLocal !== null ? formatUsd(usdLocal) : "—")}{" "}
                    <span className="text-xs font-medium text-muted-foreground">
                      USD
                    </span>
                  </span>
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
                  Moneda de cobro: USD. El monto final lo confirma el servidor
                  al crear la orden (protección anti manipulación de precios).
                </p>
              </CardContent>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <div className="glow-card rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Compras recientes
                  </h2>
                  <Link
                    href="/historial"
                    className="text-xs font-medium text-electric-bright hover:text-electric"
                  >
                    Ver historial
                  </Link>
                </div>

                {recent === null ? (
                  <div className="mt-4 flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Cargando…
                  </div>
                ) : recent.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
                    <Coins className="mx-auto size-6 text-muted-foreground" aria-hidden />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aún no tienes compras registradas.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ¡Tu primera compra aparecerá aquí!
                    </p>
                  </div>
                ) : (
                  <ul className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
                    {recent.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-brand-green">
                            +{formatServi(r.amount)} SERVI
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDateTime(r.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 border-brand-green/30 bg-brand-green/10 text-[10px] text-brand-green"
                        >
                          Completada
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="glow-card rounded-2xl p-4 text-xs leading-relaxed text-muted-foreground"
          >
            <p className="font-semibold text-foreground">¿Cómo funciona?</p>
            <ol className="mt-1.5 list-inside list-decimal space-y-1">
              <li>Elige la cantidad de SERVI (mínimo {MIN_TOKENS}).</li>
              <li>Selecciona un método con sello CONFIGURADO y completa el checkout.</li>
              <li>
                El servidor verifica el pago con la pasarela y acredita tu saldo
                al instante — exactamente una vez.
              </li>
            </ol>
          </motion.div>
        </div>
      </div>

      {/* Sección on-chain (funcionalidad existente conservada) */}
      {onchainMethod && (
        <section className="mt-10" aria-label="Compra on-chain en BNB Smart Chain">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Compra on-chain en BNB Smart Chain
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Intercambia BNB o USDT por SERVI directamente desde tu wallet.
              </p>
            </div>
            <ConnectWallet variant="default" />
          </div>
          <div className="mt-5">
            <SwapPanel />
          </div>
        </section>
      )}
    </div>
  );
}
