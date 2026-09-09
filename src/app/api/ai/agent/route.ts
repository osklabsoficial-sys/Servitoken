import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { buildServiSystemPrompt } from "@/lib/ai-context";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * ============================================================
 *  OSK LLM - ULTRA · Agente de página (/chat)
 * ============================================================
 *  Igual que /api/ai/chat pero en modo AGENTE: el modelo puede
 *  emitir acciones de navegación [[IR:/ruta]] que el frontend
 *  convierte en tarjetas con cuenta regresiva que llevan al
 *  usuario a la página correcta resaltando qué hacer.
 * ============================================================
 */

const MAX_HISTORY = 16; // últimos 8 intercambios
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
  if (!rateLimit(clientKey(req, "ai-agent"), 30, 5 * 60 * 1000)) {
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
    mode: "agent",
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
        { error: "AI_EMPTY", message: "OSK LLM no pudo responder. Intenta de nuevo." },
        { status: 502 }
      );
    }

    // Separar la acción [[IR:/ruta]] (si vino) del texto visible.
    const match = /^\s*\[\[IR:(\/[a-zA-Z]+)\]\]\s*/.exec(reply);
    const action = match && match[1] ? match[1] : null;
    const message = (action ? reply.slice(match![0].length) : reply).trim().slice(0, 4000);

    return NextResponse.json({ reply: message, action });
  } catch (error) {
    console.error(
      "AI_AGENT_ERROR",
      error instanceof Error ? error.message : String(error).slice(0, 300)
    );
    return NextResponse.json(
      {
        error: "AI_UNAVAILABLE",
        message: "OSK LLM está dormido ahora mismo. Intenta de nuevo en unos segundos. 😴",
      },
      { status: 503 }
    );
  }
}
