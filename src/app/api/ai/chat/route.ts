import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { buildServiSystemPrompt } from "@/lib/ai-context";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * ============================================================
 *  SERVIBOT · Asistente IA del widget flotante
 * ============================================================
 *  - z-ai-web-dev-sdk SOLO en el servidor (nunca en el cliente).
 *  - Requiere sesión activa (usuarios BLOCKED no pueden usarlo).
 *  - El system prompt se construye en @/lib/ai-context con datos
 *    EN VIVO (precio on-chain, saldo real, métodos de pago,
 *    servicios). Modo asistente: conversación sin acciones.
 * ============================================================
 */

const MAX_HISTORY = 8; // últimos 4 intercambios
const MAX_INPUT_LEN = 1000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (session.status !== "ACTIVE") {
    return NextResponse.json({ error: "ACCOUNT_BLOCKED" }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "ai-chat"), 20, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "RATE_LIMIT", message: "Has enviado muchos mensajes. Espera un momento. 💛" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json({ error: "VALIDATION", message: "Mensaje inválido." }, { status: 400 });
  }

  const history: ChatMessage[] = raw
    .filter(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string" &&
        (m as ChatMessage).content.trim().length > 0
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_INPUT_LEN) }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "VALIDATION", message: "Mensaje inválido." }, { status: 400 });
  }

  const systemPrompt = await buildServiSystemPrompt({
    userId: session.id,
    username: session.username,
    origin: new URL(req.url).origin,
    mode: "assistant",
  });

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        ...history,
      ],
      thinking: { type: "disabled" },
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "AI_EMPTY", message: "ServiBot no pudo responder. Intenta de nuevo." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: reply.slice(0, 2000) });
  } catch (error) {
    console.error(
      "AI_CHAT_ERROR",
      error instanceof Error ? error.message : String(error).slice(0, 300)
    );
    return NextResponse.json(
      {
        error: "AI_UNAVAILABLE",
        message: "ServiBot está dormido ahora mismo. Intenta de nuevo en unos segundos. 😴",
      },
      { status: 503 }
    );
  }
}
