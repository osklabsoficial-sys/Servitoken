/**
 * ============================================================
 *  SERVITOKEN · PayPal Orders API v2
 * ============================================================
 *  - Credenciales SOLO desde variables de entorno del servidor.
 *  - PAYPAL_ENV=live → api-m.paypal.com | sandbox → api-m.sandbox.paypal.com
 *  - El monto/moneda SIEMPRE se calcula en el backend.
 *  - Nunca se filtra el client secret ni errores internos.
 * ============================================================
 */

const PAYPAL_ENV = (process.env.PAYPAL_ENV || "live").toLowerCase();
export const PAYPAL_API_BASE =
  PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

/** OAuth2 client credentials con caché en memoria. */
export async function getAccessToken(): Promise<string> {
  if (!paypalConfigured()) throw new Error("PAYPAL_NOT_CONFIGURED");
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const basic = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PAYPAL_AUTH_FAILED");
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

/* ------------------------------------------------------------------ */
/*  Crear orden                                                        */
/* ------------------------------------------------------------------ */

export async function createOrder(params: {
  usdAmount: string; // "5.00" con exactamente 2 decimales
  referenceId: string; // id interno de la compra
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ orderId: string; status: string }> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": params.referenceId,
    },
    cache: "no-store",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          amount: { currency_code: "USD", value: params.usdAmount },
          description: "Compra de Servitoken (SERVI)",
        },
      ],
      application_context: {
        brand_name: "ServiToken",
        locale: "es-DO",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(
      "PAYPAL_CREATE_ORDER_ERROR",
      res.status,
      JSON.stringify(data).slice(0, 600)
    );
    throw new Error("PAYPAL_CREATE_ORDER_FAILED");
  }
  return { orderId: data.id, status: data.status };
}

/* ------------------------------------------------------------------ */
/*  Capturar / consultar orden                                         */
/* ------------------------------------------------------------------ */

export async function captureOrder(
  orderId: string
): Promise<{ ok: boolean; httpStatus: number; order: Record<string, unknown> | null; issue: string | null }> {
  const token = await getAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
      body: "{}",
    }
  );
  const data = await res.json();
  const issue =
    !res.ok && Array.isArray(data?.details) && data.details[0]?.issue
      ? String(data.details[0].issue)
      : null;
  return { ok: res.ok, httpStatus: res.status, order: res.ok ? data : data ?? null, issue };
}

export async function getOrder(
  orderId: string
): Promise<{ ok: boolean; order: Record<string, unknown> | null }> {
  const token = await getAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const data = await res.json();
  return { ok: res.ok, order: res.ok ? data : data ?? null };
}

/* ------------------------------------------------------------------ */
/*  Extracción segura de datos de la orden                             */
/* ------------------------------------------------------------------ */

export interface CaptureInfo {
  orderId: string | null;
  captureId: string | null;
  orderStatus: string | null;
  captureStatus: string | null;
  amount: string | null;
  currency: string | null;
  payerEmail: string | null;
  payerName: string | null;
}

export function extractCapture(order: Record<string, unknown> | null): CaptureInfo {
  const o = (order ?? {}) as {
    id?: string;
    status?: string;
    payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
    purchase_units?: Array<{
      amount?: { value?: string; currency_code?: string };
      payments?: {
        captures?: Array<{
          id?: string;
          status?: string;
          amount?: { value?: string; currency_code?: string };
        }>;
      };
    }>;
  };
  const pu = o.purchase_units?.[0];
  const capture = pu?.payments?.captures?.[0];
  const payerName = o.payer?.name?.given_name
    ? `${o.payer.name.given_name} ${o.payer.name.surname ?? ""}`.trim()
    : null;
  return {
    orderId: o.id ?? null,
    captureId: capture?.id ?? null,
    orderStatus: o.status ?? null,
    captureStatus: capture?.status ?? null,
    amount: capture?.amount?.value ?? pu?.amount?.value ?? null,
    currency: capture?.amount?.currency_code ?? "USD",
    payerEmail: o.payer?.email_address ?? null,
    payerName,
  };
}

/* ------------------------------------------------------------------ */
/*  Verificación de webhook                                            */
/* ------------------------------------------------------------------ */

/**
 * Verifica la firma del webhook con la API oficial.
 * Devuelve:
 *  - true  → firma válida
 *  - false → firma inválida (rechazar)
 *  - null  → PAYPAL_WEBHOOK_ID no configurado → el caller debe
 *            verificar el evento consultando la API directamente.
 */
export async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string
): Promise<boolean | null> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return null;
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
