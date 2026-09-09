"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * ============================================================
 *  SERVIBOT · Widget de chat con IA (flotante)
 * ============================================================
 *  Asistente virtual que aparece en todo el panel privado.
 *  El backend (/api/ai/chat) inyecta datos EN VIVO (precio
 *  on-chain, saldo del usuario, métodos de pago y servicios);
 *  aquí solo se conversa con ese endpoint. Nada de SDK en cliente.
 * ============================================================
 */

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "¡Hola! 👋 Soy ServiBot, el asistente de ServiToken. Pregúntame por el precio del token, cómo comprar, tus servicios o cómo enviar SERVI.",
};

const SUGGESTIONS = [
  "¿Cuál es el precio de SERVI ahora?",
  "¿Cómo compro SERVI con PayPal?",
  "¿Qué servicios hay disponibles?",
  "¿Cómo envío SERVI a otra persona?",
];

export function ServiBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Auto-scroll al último mensaje */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  /* Escape cierra el chat */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Abortar petición pendiente al desmontar */
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim().slice(0, 1000);
      if (!clean || loading) return;

      const next: Msg[] = [...messages, { role: "user", content: clean }];
      setMessages(next);
      setInput("");
      setLoading(true);
      setError(null);

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const timeout = setTimeout(() => ctrl.abort(), 45_000);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next.slice(-8) }),
          signal: ctrl.signal,
        });
        const data = (await res.json().catch(() => ({}))) as {
          reply?: string;
          message?: string;
        };
        if (!res.ok || !data.reply) {
          setError(data.message ?? "ServiBot no pudo responder. Intenta de nuevo.");
        } else {
          setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
        }
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") {
          setError("Sin conexión con ServiBot. Revisa tu internet e intenta de nuevo.");
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    },
    [messages, loading]
  );

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar ServiBot" : "Abrir ServiBot, asistente con inteligencia artificial"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full border border-gold-bright/40 bg-gradient-to-br from-[#2a2418] via-[#1c1913] to-[#0f0d09] text-gold-bright shadow-[0_8px_30px_rgba(232,201,138,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {open ? (
          <X className="size-6" aria-hidden />
        ) : (
          <span className="relative">
            <Bot className="size-7" aria-hidden />
            <span
              className="absolute -right-1 -top-1 size-2.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(45,212,167,0.9)]"
              aria-hidden
            />
          </span>
        )}
      </button>

      {/* Panel de chat */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat con ServiBot, asistente de ServiToken"
          className="fixed bottom-[5.5rem] right-4 z-50 flex max-h-[min(32rem,calc(100dvh-8rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12100c]/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:right-5"
        >
          {/* Cabecera */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#2a2418]/80 via-transparent to-transparent px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold-bright/40 bg-[#1c1913] text-gold-bright">
              <Bot className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold text-white">
                ServiBot
                <Sparkles className="size-3.5 text-gold-bright" aria-hidden />
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span
                  className="size-1.5 rounded-full bg-brand-green shadow-[0_0_6px_rgba(45,212,167,0.9)]"
                  aria-hidden
                />
                En línea · datos en vivo
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={listRef}
            className="servibot-scroll flex-1 space-y-3 overflow-y-auto p-4"
            aria-live="polite"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#e8c98a] to-[#c9a35f] px-3.5 py-2.5 text-sm font-medium text-[#221b0e] shadow-md"
                      : "max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm leading-relaxed text-white/90"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start" aria-label="ServiBot está escribiendo">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
                  <span className="servibot-dot size-2 rounded-full bg-gold-bright/90" />
                  <span className="servibot-dot size-2 rounded-full bg-gold-bright/60 [animation-delay:0.2s]" />
                  <span className="servibot-dot size-2 rounded-full bg-gold-bright/30 [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            {/* Sugerencias iniciales */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-gold-bright/30 bg-gold-bright/5 px-3 py-1.5 text-left text-[11px] font-medium text-gold-bright transition-colors hover:bg-gold-bright/15"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Entrada */}
          <form
            className="flex items-center gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              maxLength={1000}
              aria-label="Mensaje para ServiBot"
              disabled={loading}
              className="border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40 focus-visible:ring-gold-bright/40"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              className="shrink-0 bg-gradient-to-br from-[#e8c98a] to-[#c9a35f] text-[#221b0e] shadow-md hover:from-[#f0d49a] hover:to-[#d4af6d] disabled:opacity-40"
            >
              <Send className="size-4" aria-hidden />
            </Button>
          </form>

          <p className="border-t border-white/5 px-4 pb-2.5 pt-1.5 text-center text-[10px] text-white/35">
            ServiBot puede equivocarse · No es consejo financiero
          </p>
        </div>
      )}
    </>
  );
}
