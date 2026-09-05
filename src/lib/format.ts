/**
 * SERVITOKEN · Utilidades de formato compartidas
 */

export function formatServi(n: number): string {
  return n.toLocaleString("es-DO", { maximumFractionDigits: 2 });
}

export function formatUsd(n: number): string {
  return n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const LEDGER_TYPE_LABELS: Record<string, string> = {
  PURCHASE: "Compra",
  TRANSFER_SENT: "Enviado",
  TRANSFER_RECEIVED: "Recibido",
  SERVICE_PAYMENT: "Servicio",
  ADMIN_CREDIT: "Ajuste (+)",
  ADMIN_DEBIT: "Ajuste (−)",
  REFUND: "Reembolso",
  REVERSAL: "Reversión",
};

/** Tipos con impacto positivo en el saldo. */
export const POSITIVE_TYPES = new Set([
  "PURCHASE",
  "TRANSFER_RECEIVED",
  "ADMIN_CREDIT",
  "REFUND",
  "REVERSAL",
]);
