import { NextResponse } from "next/server";
import { paypalConfigured } from "@/lib/paypal";
import { getPaymentMethods } from "@/lib/payment-methods";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    paypalConfigured: paypalConfigured(),
    clientIdPresent: Boolean(process.env.PAYPAL_CLIENT_ID),
    secretPresent: Boolean(process.env.PAYPAL_CLIENT_SECRET),
    enabledFlag: process.env.PAYPAL_ENABLED,
    methods: getPaymentMethods().map((m) => ({ id: m.id, enabled: m.enabled })),
  });
}
