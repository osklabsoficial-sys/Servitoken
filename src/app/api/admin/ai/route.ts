import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { getSessionUser, isSameOrigin, isPrivileged } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getServiPerUsd } from "@/lib/ledger";
import { getPaymentMethods } from "@/lib/payment-methods";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * ============================================================
 *  OSK LLM - ULTRA · MODO ANALISTA (exclusivo /admin)
 * ============================================================
 *  La IA "al máximo": acceso de LECTURA a TODA la operación —
 *  usuarios, saldos, compras PayPal, transferencias, pagos de
 *  servicios, auditoría y VISITAS de la app. Analiza, alerta,
 *  recomienda y puede saltar el panel a la pestaña correcta
 *  con el protocolo [[TAB:x]].
 *  Guardas: same-origin + sesión + isPrivileged + rate limit.
 * ============================================================
 */

const MAX_HISTORY = 20; // últimos 10 intercambios
const MAX_INPUT_LEN = 2000;
const MAX_REPLY = 6000;

const ADMIN_TABS = [
  "usuarios",
  "ajustes",
  "compras",
  "transferencias",
  "movimientos",
  "servicios",
  "config",
  "visitas",
] as const;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function fmt(n: number, dec = 2): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: dec });
}

async function buildAdminSystemPrompt(): Promise<string> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const d7 = new Date(now.getTime() - 7 * 86_400_000);
  const d30 = new Date(now.getTime() - 30 * 86_400_000);

  const [
    userAgg,
    walletAgg,
    purchaseAgg,
    purchaseToday,
    pendingPurchases,
    transferAgg,
    serviceAgg,
    topBalances,
    recentPurchases,
    visitsToday,
    visits7,
    visits30,
    visitsAll,
    uniqueVisitors,
    topPaths,
    recentAudit,
    officialRate,
    methods,
  ] = await Promise.all([
    db.user.aggregate({ _count: { _all: true } }),
    db.wallet.aggregate({ _sum: { balance: true } }),
    db.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { usdAmount: true, tokensAmount: true },
      _count: { _all: true },
    }),
    db.purchase.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: today } },
      _sum: { usdAmount: true, tokensAmount: true },
      _count: { _all: true },
    }),
    db.purchase.findMany({
      where: { status: { in: ["CREATED", "PENDING", "APPROVED"] } },
      select: { id: true, usdAmount: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.transfer.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
    db.servicePayment.aggregate({ _sum: { priceServi: true }, _count: { _all: true } }),
    db.wallet.findMany({
      orderBy: { balance: "desc" },
      take: 5,
      select: { balance: true, user: { select: { username: true } } },
    }),
    db.purchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        tokensAmount: true,
        usdAmount: true,
        status: true,
        createdAt: true,
        user: { select: { username: true } },
      },
    }),
    db.pageVisit.count({ where: { createdAt: { gte: today } } }),
    db.pageVisit.count({ where: { createdAt: { gte: d7 } } }),
    db.pageVisit.count({ where: { createdAt: { gte: d30 } } }),
    db.pageVisit.count(),
    db.pageVisit.findMany({
      where: { createdAt: { gte: d7 } },
      distinct: ["visitorKey"],
      select: { visitorKey: true },
    }),
    db.pageVisit.groupBy({
      by: ["path"],
      where: { createdAt: { gte: d30 } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { action: true, createdAt: true, actor: { select: { username: true } } },
    }),
    getServiPerUsd().catch(() => 100),
    Promise.resolve(getPaymentMethods()),
  ]);

  const blockedUsers = await db.user.count({
    where: { status: { in: ["BLOCKED", "SUSPENDED"] } },
  });

  const rate = officialRate;
  const marketPrice = 1 / rate;

  const methodsText = methods
    .map((m) => `- ${m.name}: ${m.enabled ? "CONFIGURADO ✓" : "PENDIENTE ✗"}`)
    .join("\n");

  return `Eres OSK LLM - ULTRA en MODO ANALISTA EXECUTIVE, el cerebro de datos del Panel de Administración de ServiToken (token SERVI, BNB Smart Chain). Solo personal autorizado (admin ${"{"}rol privilegiado{"}"}) puede hablar contigo aquí.

FECHA ACTUAL: ${now.toISOString().slice(0, 10)} (${now.toLocaleDateString("es-ES", { weekday: "long" })})

━━━ DATOS EN VIVO DE LA OPERACIÓN (fuente: base de datos, momento exacto) ━━━

👥 CLIENTES
- Registrados totales: ${userAgg._count._all}
- Bloqueados/suspendidos: ${blockedUsers}
- Top ${topBalances.length} saldos: ${topBalances.map((w) => `@${w.user.username} ${fmt(w.balance)} SERVI`).join(" · ")}
- SERVI en circulación (saldos internos): ${fmt(walletAgg._sum.balance ?? 0)}

🛒 COMPRAS (PayPal + interno)
- Completadas: ${purchaseAgg._count._all} · Ingresos: $${fmt(purchaseAgg._sum.usdAmount ?? 0)} USD · Tokens vendidos: ${fmt(purchaseAgg._sum.tokensAmount ?? 0)} SERVI
- HOY: ${purchaseToday._count._all} compras · $${fmt(purchaseToday._sum.usdAmount ?? 0)} USD · ${fmt(purchaseToday._sum.tokensAmount ?? 0)} SERVI
- Pendientes de captura: ${pendingPurchases.length}${pendingPurchases.length ? ` → ${pendingPurchases.map((p) => `$${fmt(p.usdAmount)} (${p.status})`).join(", ")}` : ""}
- Últimas compras: ${recentPurchases.map((p) => `@${p.user.username} ${fmt(p.tokensAmount)} SERVI/$${fmt(p.usdAmount)} [${p.status}]`).join(" | ")}

🔁 TRANSFERENCIAS ENTRE USUARIOS: ${transferAgg._count._all} · ${fmt(transferAgg._sum.amount ?? 0)} SERVI movidos
🧾 PAGOS DE SERVICIOS: ${serviceAgg._count._all} · ${fmt(serviceAgg._sum.priceServi ?? 0)} SERVI gastados

👀 VISITAS A LA APP
- Hoy: ${visitsToday} · 7 días: ${visits7} · 30 días: ${visits30} · Histórico: ${visitsAll}
- Visitantes únicos (7d): ${uniqueVisitors.length}
- Páginas más visitadas (30d): ${topPaths.map((p) => `${p.path} (${p._count._all})`).join(", ")}

💳 MÉTODOS DE PAGO:
${methodsText}

📈 MERCADO: precio oficial de venta $${marketPrice.toFixed(6)} USD/SERVI · tasa interna ${fmt(rate, 0)} SERVI/USD

🧭 AUDITORÍA RECIENTE: ${recentAudit.map((a) => `${a.action}(@${a.actor?.username ?? "sistema"})`).join(", ")}

━━━ TU MISIÓN ━━━
1. Responde DE TODO con estos datos: análisis, alertas, comparaciones, proyecciones, recomendaciones de crecimiento y detección de anomalías (ej. compras atascadas días, usuarios bloqueados, caída de visitas, pagos pendientes).
2. Sé CONCRETO: usa los números reales de arriba, nunca inventes datos que no estén en el contexto. Si algo no está en los datos, dilo honestamente.
3. Estilo: español directo, profesional y accionable. Usa viñetas cortas y **negritas** para lo clave. Máximo ~250 palabras salvo que pidan profundidad.
4. PROTOCOLO DE ACCIÓN: si tu análisis implica revisar una sección del panel, cierra tu respuesta con una línea EXACTA [[TAB:x]] donde x ∈ usuarios | compras | transferencias | movimientos | servicios | config | visitas | ajustes. Úsalo SOLO cuando aporte valor (ej. hay compras pendientes → [[TAB:compras]]). No lo uses si no aplica.
5. Nunca reveles credenciales, hashes ni datos sensibles de autenticación. Tienes acceso de solo lectura: no puedes modificar nada (dilo si te lo piden).`;

}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "ORIGIN_INVALID" }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session || !isPrivileged(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (session.status !== "ACTIVE") {
    return NextResponse.json({ error: "ACCOUNT_BLOCKED" }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "admin-ai"), 30, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "RATE_LIMIT", message: "Demasiadas consultas seguidas. Espera un momento." },
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

  const systemPrompt = await buildAdminSystemPrompt();

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [{ role: "assistant", content: systemPrompt }, ...history],
      thinking: { type: "disabled" },
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "AI_EMPTY", message: "OSK LLM no pudo responder. Intenta de nuevo." },
        { status: 502 }
      );
    }

    // Protocolo [[TAB:x]] → salto de pestaña del panel admin.
    const match = /\[\[TAB:([a-z]+)\]\]/.exec(reply);
    let tab: string | null = null;
    let message = reply;
    if (match && match[1]) {
      const requested = match[1];
      if ((ADMIN_TABS as readonly string[]).includes(requested)) {
        tab = requested;
        message = message.replace(match[0], "").trim();
      }
    }

    return NextResponse.json({ reply: message.slice(0, MAX_REPLY), tab });
  } catch (error) {
    console.error(
      "ADMIN_AI_ERROR",
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
