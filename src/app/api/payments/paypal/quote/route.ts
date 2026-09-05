import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { LedgerError, getServiPerUsd, roundUsd, validateServiAmount, MIN_PURCHASE_TOKENS, MAX_PURCHASE_TOKENS } from "@/lib/ledger";

export const runtime = "nodejs";

/**
 * Cotización server-side: el precio REAL se calcula aquí.
 * El frontend solo envía la cantidad de SERVI deseada.
 */
export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const raw = new URL(req.url).searchParams.get("tokens");
  const tokens = parseFloat(raw ?? "");
  try {
    const valid = validateServiAmount(tokens, {
      min: MIN_PURCHASE_TOKENS,
      max: MAX_PURCHASE_TOKENS,
    });
    const rate = await getServiPerUsd();
    return NextResponse.json({
      tokens: valid,
      usd: roundUsd(valid / rate),
      usdFormatted: roundUsd(valid / rate).toFixed(2),
      rateServiPerUsd: rate,
    });
  } catch (error) {
    if (error instanceof LedgerError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: 400 });
    }
    throw error;
  }
}
