import { NextResponse } from "next/server";
import { paypalConfigured } from "@/lib/paypal";

export const runtime = "nodejs";

/**
 * Configuración pública del SDK de PayPal.
 * Solo expone el CLIENT ID (es público por diseño). El secret
 * jamás sale del servidor.
 */
export async function GET() {
  return NextResponse.json({
    configured: paypalConfigured(),
    clientId: process.env.PAYPAL_CLIENT_ID ?? null,
    env: (process.env.PAYPAL_ENV || "live").toLowerCase(),
    currency: "USD",
  });
}
