"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  LayoutDashboard,
  MessageSquarePlus,
  Menu,
  Send,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ============================================================
 *  OSK LLM - ULTRA · Cliente del chat estilo GPT
 * ============================================================
 *  - Interfaz completa de chat (sidebar + conversaciones en
 *    localStorage + área de mensajes + entrada auto-expandible).
 *  - Modo AGENTE: el backend puede devolver `action` (/ruta) y
 *    el chat muestra una tarjeta con cuenta regresiva que lleva
 *    al usuario a la página y resalta qué hacer al llegar.
 * ============================================================
 */

interface Msg {
  role: "user" | "assistant";
  content: string;
  action?: string | null;
}

interface Convo {
  id: string;
  title: string;
  msgs: Msg[];
  ts: number;
}

const MODEL_NAME = "OSK LLM - ULTRA";
const NAV_SECONDS = 6;

const ROUTE_META: Record<string, { label: string; desc: string }> = {
  "/inicio": { label: "Mi panel", desc: "Tu saldo, la tarjeta SERVI y el mercado en vivo" },
  "/compra": { label: "Comprar SERVI", desc: "Paga con PayPal o swap on-chain y recíbelo al instante" },
  "/enviar": { label: "Enviar SERVI", desc: "Manda tokens a otro usuario al instante" },
  "/recibir": { label: "Recibir SERVI", desc: "Tu enlace para recibir pagos en SERVI" },
  "/servicios": { label: "Servicios", desc: "Catálogo completo de servicios con precios en SERVI" },
  "/historial": { label: "Historial", desc: "Todos tus movimientos y comprobantes" },
};

const CAPABILITIES = [
  {
    icon: ShoppingCart,
    title: "Comprar tokens",
    desc: "Te llevo a la compra y te guío paso a paso",
    prompt: "Quiero comprar tokens SERVI",
  },
  {
    icon: Sparkles,
    title: "Precio en vivo",
    desc: "Dime el precio real del token ahora mismo",
    prompt: "¿Cuál es el precio de SERVI ahora mismo?",
  },
  {
    icon: Bot,
    title: "Enviar SERVI",
    desc: "Guía para enviar tokens a otra persona",
    prompt: "Quiero enviar SERVI a otra persona",
  },
  {
    icon: LayoutDashboard,
    title: "Explorar servicios",
    desc: "Qué puedo comprar con mi saldo SERVI",
    prompt: "¿Qué servicios hay disponibles?",
  },
];

function loadConvos(username: string): Convo[] {
  try {
    const raw = localStorage.getItem(`osk-chat-v1-${username}`);
    return raw ? (JSON.parse(raw) as Convo[]) : [];
  } catch {
    return [];
  }
}

export function ChatClient({ username }: { username: string }) {
  const router = useRouter();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [nav, setNav] = useState<{ route: string; left: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const active = useMemo(
    () => convos.find((c) => c.id === activeId) ?? null,
    [convos, activeId]
  );
  const messages = active?.msgs ?? [];

  /* ----------------------- Storage ----------------------- */

  useEffect(() => {
    const list = loadConvos(username);
    setConvos(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [username]);

  const persist = useCallback(
    (list: Convo[]) => {
      setConvos(list);
      try {
        localStorage.setItem(
          `osk-chat-v1-${username}`,
          JSON.stringify(list.slice(0, 30))
        );
      } catch {
        /* almacenamiento lleno: la conversación vive solo en memoria */
      }
    },
    [username]
  );

  /* -------------------- Auto-scroll ---------------------- */

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  /* ----------------- Navegación del agente ---------------- */

  /* Cuenta regresiva con un único efecto: sin refs ni intervalos.
     nav = { ruta, segundos restantes }; null = sin navegación.   */
  useEffect(() => {
    if (!nav) return;
    if (nav.left <= 1) {
      const dest = nav.route === "/compra" ? "/compra?destacar=paypal" : nav.route;
      setNav(null);
      router.push(dest);
      return;
    }
    const t = setTimeout(
      () => setNav((n) => (n ? { ...n, left: n.left - 1 } : n)),
      1000
    );
    return () => clearTimeout(t);
  }, [nav, router]);

  /* ----------------------- Enviar ------------------------- */

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim().slice(0, 1000);
      if (!clean || loading) return;

      let convoId = activeId;
      let baseMsgs: Msg[] = [];
      let list = convos;

      if (!convoId) {
        convoId = `c${Date.now()}`;
        const convo: Convo = {
          id: convoId,
          title: clean.slice(0, 42),
          msgs: [],
          ts: Date.now(),
        };
        list = [convo, ...convos];
        persist(list);
        setActiveId(convoId);
      } else {
        baseMsgs = active?.msgs ?? [];
      }

      const withUser: Msg[] = [...baseMsgs, { role: "user", content: clean }];
      const nextList = list.map((c) =>
        c.id === convoId ? { ...c, msgs: withUser, ts: Date.now() } : c
      );
      persist(nextList);
      setInput("");
      if (taRef.current) taRef.current.style.height = "auto";
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: withUser.slice(-16).map((m) => ({ role: m.role, content: m.content })) }),
          signal: AbortSignal.timeout(60_000),
        });
        const data = (await res.json().catch(() => ({}))) as {
          reply?: string;
          action?: string | null;
          message?: string;
        };
        if (!res.ok || !data.reply) {
          setError(data.message ?? "OSK LLM no pudo responder. Intenta de nuevo.");
        } else {
          const withReply: Msg[] = [
            ...withUser,
            { role: "assistant", content: data.reply, action: data.action ?? null },
          ];
          persist(
            nextList.map((c) =>
              c.id === convoId ? { ...c, msgs: withReply, ts: Date.now() } : c
            )
          );
          if (data.action) setNav({ route: data.action, left: NAV_SECONDS });
        }
      } catch {
        setError("Sin conexión con OSK LLM. Revisa tu internet e intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [active, activeId, convos, loading, persist]
  );

  /* --------------------- Acciones UI ---------------------- */

  const newChat = () => {
    setNav(null);
    setActiveId(null);
    setError(null);
    setSidebarOpen(false);
  };

  const deleteConvo = (id: string) => {
    const list = convos.filter((c) => c.id !== id);
    persist(list);
    if (activeId === id) setActiveId(list[0]?.id ?? null);
  };

  const copyMsg = async (idx: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* portapapeles no disponible */
    }
  };

  const onTextareaKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  /* ------------------------ Render ------------------------ */

  const sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#0d0b08]/95 backdrop-blur-xl transition-transform duration-200 md:static md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        <span className="flex size-9 items-center justify-center rounded-xl border border-gold-bright/40 bg-gradient-to-br from-[#2a2418] to-[#16130d] text-gold-bright">
          <Sparkles className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-black tracking-wide text-white">
            OSK LLM <span className="text-gold-bright">- ULTRA</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Agente ServiToken
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
          className="ml-auto rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white md:hidden"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={newChat}
          className="flex w-full items-center gap-2.5 rounded-xl border border-gold-bright/30 bg-gold-bright/10 px-3.5 py-2.5 text-sm font-semibold text-gold-bright transition-colors hover:bg-gold-bright/20"
        >
          <MessageSquarePlus className="size-4" aria-hidden />
          Nueva conversación
        </button>
      </div>

      <nav className="servibot-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3" aria-label="Conversaciones">
        {convos.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-white/35">
            Aún no tienes conversaciones.
            <br />
            ¡Empieza una! 💬
          </p>
        )}
        {convos.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center gap-1 rounded-xl px-1 ${
              c.id === activeId ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setActiveId(c.id);
                setSidebarOpen(false);
                setNav(null);
              }}
              className="min-w-0 flex-1 truncate rounded-xl px-2.5 py-2.5 text-left text-[13px] text-white/80"
              title={c.title}
            >
              {c.title}
            </button>
            <button
              type="button"
              onClick={() => deleteConvo(c.id)}
              aria-label={`Eliminar conversación: ${c.title}`}
              className="rounded-lg p-2 text-white/30 opacity-0 transition-opacity hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/inicio"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al panel
        </Link>
        <p className="px-3 pt-2 text-[11px] text-white/40">@{username}</p>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {sidebar}
      {/* Fondo oscuro móvil */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0d0b08]/80 px-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir conversaciones"
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white md:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wide text-white">
              OSK LLM <span className="text-gold-bright">- ULTRA</span>
            </span>
            <span className="flex items-center gap-1 rounded-full border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-green">
              <span
                className="size-1.5 rounded-full bg-brand-green shadow-[0_0_6px_rgba(45,212,167,0.9)]"
                aria-hidden
              />
              En vivo
            </span>
          </div>
          <Link
            href="/inicio"
            className="ml-auto flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:border-gold-bright/40 hover:text-gold-bright"
          >
            <LayoutDashboard className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Mi panel</span>
          </Link>
        </header>

        {/* Mensajes */}
        <div ref={scrollRef} className="servibot-scroll min-h-0 flex-1 overflow-y-auto" aria-live="polite">
          {messages.length === 0 && !loading ? (
            /* Estado vacío estilo GPT */
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-10">
              <div className="flex size-16 items-center justify-center rounded-3xl border border-gold-bright/40 bg-gradient-to-br from-[#2a2418] to-[#16130d] shadow-[0_0_40px_rgba(232,201,138,0.25)]">
                <Sparkles className="size-8 text-gold-bright" aria-hidden />
              </div>
              <h1 className="mt-5 text-center text-2xl font-black text-white sm:text-3xl">
                OSK LLM <span className="text-gold-bright">- ULTRA</span>
              </h1>
              <p className="mt-2 text-center text-sm text-white/55">
                Tu agente de ServiToken: responde todo{" "}
                <span className="text-gold-bright">y te lleva</span> a donde necesites.
              </p>
              <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {CAPABILITIES.map((cap) => (
                  <button
                    key={cap.title}
                    type="button"
                    onClick={() => send(cap.prompt)}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-gold-bright/40 hover:bg-white/[0.06]"
                  >
                    <cap.icon className="size-5 text-gold-bright" aria-hidden />
                    <p className="mt-2.5 text-sm font-bold text-white">{cap.title}</p>
                    <p className="mt-0.5 text-xs text-white/50">{cap.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
              {messages.map((m, i) => {
                const last = i === messages.length - 1;
                return m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-3xl rounded-br-lg border border-gold-bright/25 bg-[#1e1a12] px-4 py-2.5 text-sm leading-relaxed text-white">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="group flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-bright/40 bg-gradient-to-br from-[#2a2418] to-[#16130d] text-gold-bright">
                      <Bot className="size-4.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                        {m.content}
                      </div>

                      {/* Tarjeta de acción del agente */}
                      {m.action && ROUTE_META[m.action] && (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-gold-bright/40 bg-gradient-to-br from-[#2a2418] to-[#16130d] shadow-[0_8px_30px_rgba(232,201,138,0.15)]">
                          <div className="flex items-center gap-3 p-4">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-bright/15 text-gold-bright">
                              <ShoppingCart className="size-5" aria-hidden />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-white">
                                {nav && last && nav.route === m.action
                                  ? `Te llevo a ${ROUTE_META[m.action].label} en ${nav.left}s…`
                                  : `Puedo llevarte a ${ROUTE_META[m.action].label}`}
                              </p>
                              <p className="truncate text-xs text-white/55">
                                {ROUTE_META[m.action].desc}
                              </p>
                            </div>
                          </div>
                          <div
                            className="h-1 bg-gradient-to-r from-[#e8c98a] to-[#c9a35f] transition-all duration-1000 ease-linear"
                            style={{
                              width:
                                nav && last && nav.route === m.action
                                  ? `${(nav.left / NAV_SECONDS) * 100}%`
                                  : "100%",
                            }}
                            aria-hidden
                          />
                          <div className="flex gap-2 p-3 pt-2.5">
                            <Button
                              size="sm"
                              onClick={() => {
                                setNav(null);
                                router.push(
                                  m.action === "/compra"
                                    ? "/compra?destacar=paypal"
                                    : (m.action as string)
                                );
                              }}
                              className="h-8 bg-gradient-to-br from-[#e8c98a] to-[#c9a35f] text-[#221b0e] hover:from-[#f0d49a] hover:to-[#d4af6d]"
                            >
                              Ir ahora
                            </Button>
                            {nav && last && nav.route === m.action && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setNav(null)}
                                className="h-8 text-white/60 hover:bg-white/10 hover:text-white"
                              >
                                Quedarme aquí
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => copyMsg(i, m.content)}
                        aria-label="Copiar respuesta"
                        className="mt-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-white/30 opacity-0 transition-opacity hover:bg-white/10 hover:text-white/70 group-hover:opacity-100"
                      >
                        {copiedIdx === i ? (
                          <>
                            <Check className="size-3 text-brand-green" aria-hidden />
                            <span className="text-brand-green">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" aria-hidden />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-bright/40 bg-gradient-to-br from-[#2a2418] to-[#16130d] text-gold-bright">
                    <Bot className="size-4.5" aria-hidden />
                  </span>
                  <div
                    className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    aria-label="OSK LLM está escribiendo"
                  >
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
            </div>
          )}
        </div>

        {/* Entrada */}
        <div className="shrink-0 border-t border-white/10 bg-[#0d0b08]/80 p-3 backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-white/15 bg-white/5 p-2 transition-colors focus-within:border-gold-bright/50"
          >
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrow(e.target);
              }}
              onKeyDown={onTextareaKey}
              rows={1}
              maxLength={1000}
              placeholder={`Escríbele a ${MODEL_NAME}… pidele lo que sea o dile "quiero comprar tokens"`}
              aria-label={`Mensaje para ${MODEL_NAME}`}
              disabled={loading}
              className="servibot-scroll max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              className="size-10 shrink-0 rounded-full bg-gradient-to-br from-[#e8c98a] to-[#c9a35f] text-[#221b0e] shadow-md hover:from-[#f0d49a] hover:to-[#d4af6d] disabled:opacity-40"
            >
              <Send className="size-4" aria-hidden />
            </Button>
          </form>
          <p className="mt-1.5 text-center text-[10px] text-white/30">
            {MODEL_NAME} puede equivocarse · No es consejo financiero · Nunca compartas frases semilla
          </p>
        </div>
      </div>
    </div>
  );
}
