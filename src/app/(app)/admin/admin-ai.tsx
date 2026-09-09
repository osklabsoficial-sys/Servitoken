"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Copy, CornerDownLeft, Eraser, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

/**
 * ============================================================
 *  ADMIN · OSK LLM - ULTRA "MODO ANALISTA"
 * ============================================================
 *  Chat ejecutivo con acceso de lectura a TODA la operación
 *  (clientes, compras, transferencias, servicios, visitas,
 *  auditoría). Puede saltar el panel a la pestaña correcta
 *  con el protocolo [[TAB:x]] que llega como { tab }.
 * ============================================================
 */

interface Msg {
  role: "user" | "assistant";
  content: string;
  tab?: string | null;
}

const QUICK_PROMPTS = [
  { label: "Resumen ejecutivo de hoy", text: "Dame un resumen ejecutivo de hoy: clientes, compras, ingresos y visitas." },
  { label: "Alertas y anomalías", text: "Revisa toda la operación y dime si hay alertas o anomalías que deba atender ya." },
  { label: "Análisis de visitas", text: "Analiza las visitas de la app: tendencias, páginas top y cómo convertirlas en clientes." },
  { label: "Top clientes", text: "Quiénes son los top clientes por saldo y qué estrategia sugieres con ellos." },
  { label: "Cómo aumentamos ventas", text: "Con los datos reales, dame 3 acciones concretas para aumentar las ventas de SERVI." },
];

const TAB_LABELS: Record<string, string> = {
  usuarios: "Usuarios",
  ajustes: "Ajustes de saldo",
  compras: "Compras",
  transferencias: "Transferencias",
  movimientos: "Movimientos",
  servicios: "Servicios",
  config: "Configuración",
  visitas: "Visitas",
};

/** Render de **negritas** y saltos de línea sin dangerouslySetInnerHTML. */
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className={line.trim() === "" ? "h-2" : "leading-relaxed"}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j} className="font-semibold text-gold-bright">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export function AdminAI({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => !m.tab)
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });
      const data = (await res.json()) as { reply?: string; tab?: string | null; message?: string };

      if (!res.ok || !data.reply) {
        setMessages([...next, { role: "assistant", content: data.message ?? "OSK LLM no pudo responder. Intenta de nuevo." }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.reply, tab: data.tab ?? null }]);
        if (data.tab && TAB_LABELS[data.tab]) {
          toast(`📋 OSK abrió la pestaña «${TAB_LABELS[data.tab]}»`, { duration: 4000 });
          onSwitchTab(data.tab);
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setMessages([...next, { role: "assistant", content: "⏱️ La consulta tardó demasiado. Prueba de nuevo." }]);
      } else {
        setMessages([...next, { role: "assistant", content: "Sin conexión con OSK LLM. Revisa tu internet." }]);
      }
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-white/10 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-bright text-background shadow-lg shadow-gold/20">
              <Bot className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold tracking-wide text-foreground">
                OSK LLM <span className="text-gold-bright">- ULTRA</span>
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
                MODO ANALISTA · acceso total de lectura · datos en vivo
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar conversación"
            >
              <Eraser className="size-3.5" /> Limpiar
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Mensajes */}
          <div
            ref={scrollRef}
            className="servibot-scroll max-h-[52vh] min-h-[320px] space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <Bot className="size-7" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Tu analista ejecutivo está listo
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                    Veo <strong className="text-gold-bright">todo</strong>: clientes, compras PayPal,
                    transferencias, servicios, auditoría y visitas de la app, en tiempo real.
                    Pregúntame lo que quieras o usa un atajo.
                  </p>
                </div>
                <div className="flex max-w-lg flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((q) => (
                    <Button
                      key={q.label}
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full border-white/10 bg-white/5 text-xs hover:bg-gold/10 hover:text-gold-bright"
                      onClick={() => send(q.text)}
                      disabled={busy}
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-electric px-4 py-2.5 text-sm text-white sm:max-w-[70%]">
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <User className="size-3.5 text-muted-foreground" aria-hidden />
                    </span>
                  </div>
                ) : (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-bright text-background">
                      <Bot className="size-3.5" aria-hidden />
                    </span>
                    <div className="max-w-[88%] space-y-2">
                      <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground sm:max-w-none">
                        <RichText text={m.content} />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(m.content).then(() => toast("Respuesta copiada"));
                          }}
                          className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-gold-bright"
                          aria-label="Copiar respuesta"
                        >
                          <Copy className="size-3" /> Copiar
                        </button>
                      </div>
                      {m.tab && TAB_LABELS[m.tab] && (
                        <p className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold-bright">
                          📋 Abriendo pestaña: {TAB_LABELS[m.tab]}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )
            )}
            {busy && (
              <div className="flex items-center gap-2.5" aria-label="OSK LLM está analizando">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-bright text-background">
                  <Bot className="size-3.5" aria-hidden />
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-gold" aria-hidden />
                  <span className="text-xs text-muted-foreground">Analizando toda la operación…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Pregunta lo que sea sobre la operación… (Enter para enviar)"
                rows={1}
                maxLength={2000}
                disabled={busy}
                className="max-h-32 min-h-[44px] flex-1 resize-none border-white/10 bg-white/5 text-sm"
                aria-label="Mensaje para OSK LLM - ULTRA analista"
              />
              <Button
                onClick={() => send()}
                disabled={busy || input.trim().length === 0}
                size="icon"
                className="size-11 shrink-0 bg-gradient-to-br from-gold to-gold-bright text-background hover:opacity-90"
                aria-label="Enviar mensaje"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <CornerDownLeft className="size-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
