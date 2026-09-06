/**
 * ============================================================
 *  SERVITOKEN · Ledger (núcleo financiero)
 * ============================================================
 *  INVARIANTES CRÍTICAS:
 *  1. Todo cambio de saldo ocurre dentro de una transacción BD
 *     y genera SIEMPRE un LedgerEntry con saldo anterior/posterior.
 *  2. El débito usa un guard atómico (balance >= amount) → nunca
 *     puede existir saldo negativo ni doble gasto por race condition.
 *  3. La acreditación de compras es idempotente: se "reclama" la
 *     compra con updateMany condicional; solo el primer proceso
 *     acredita. Un capture ID solo puede existir una vez (unique).
 *  4. Las transferencias/pagos usan "claim first": se inserta la
 *     fila con reference UNIQUE antes de mover saldo → un doble
 *     click / reintento no puede procesarse dos veces.
 * ============================================================
 */

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const SERVI_MAX_DECIMALS = 2;
export const MIN_PURCHASE_TOKENS = 10;
export const MAX_PURCHASE_TOKENS = 1_000_000;
export const MAX_TRANSFER_TOKENS = 1_000_000;

export class LedgerError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Redondea SERVI a 2 decimales. */
export function roundServi(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Redondea USD a 2 decimales. */
export function roundUsd(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Valida una cantidad SERVI (número finito, > 0, máx 2 decimales). */
export function validateServiAmount(
  value: number,
  { min = 0.01, max = MAX_TRANSFER_TOKENS }: { min?: number; max?: number } = {}
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new LedgerError("INVALID_AMOUNT", "Cantidad inválida.");
  }
  const rounded = roundServi(value);
  if (rounded !== value) {
    throw new LedgerError("INVALID_AMOUNT", "La cantidad admite máximo 2 decimales.");
  }
  if (rounded < min) {
    throw new LedgerError("INVALID_AMOUNT", `La cantidad mínima es ${min} SERVI.`);
  }
  if (rounded > max) {
    throw new LedgerError("INVALID_AMOUNT", `La cantidad máxima es ${max.toLocaleString("es-DO")} SERVI.`);
  }
  return rounded;
}

/* ------------------------------------------------------------------ */
/*  Primitivas de saldo (dentro de una transacción)                    */
/* ------------------------------------------------------------------ */

export async function creditInTx(
  tx: Prisma.TransactionClient,
  opts: {
    userId: string;
    amount: number;
    type: string;
    reference: string;
    description: string;
    adminId?: string | null;
  }
): Promise<number> {
  const wallet = await tx.wallet.findUnique({ where: { userId: opts.userId } });
  if (!wallet) throw new LedgerError("WALLET_NOT_FOUND", "La wallet del usuario no existe.");

  const balanceBefore = roundServi(wallet.balance);
  const balanceAfter = roundServi(balanceBefore + opts.amount);

  await tx.wallet.update({
    where: { userId: opts.userId },
    data: { balance: balanceAfter },
  });
  await tx.ledgerEntry.create({
    data: {
      userId: opts.userId,
      type: opts.type,
      amount: roundServi(opts.amount),
      balanceBefore,
      balanceAfter,
      reference: opts.reference,
      description: opts.description,
      adminId: opts.adminId ?? null,
    },
  });
  return balanceAfter;
}

export async function debitInTx(
  tx: Prisma.TransactionClient,
  opts: {
    userId: string;
    amount: number;
    type: string;
    reference: string;
    description: string;
    adminId?: string | null;
  }
): Promise<number> {
  // Guard atómico: solo descuenta si hay saldo suficiente. Evita
  // saldo negativo incluso con peticiones concurrentes.
  const updated = await tx.wallet.updateMany({
    where: { userId: opts.userId, balance: { gte: opts.amount } },
    data: { balance: { decrement: roundServi(opts.amount) } },
  });
  if (updated.count === 0) {
    throw new LedgerError("INSUFFICIENT_FUNDS", "Saldo insuficiente.");
  }

  const wallet = await tx.wallet.findUnique({ where: { userId: opts.userId } });
  if (!wallet) throw new LedgerError("WALLET_NOT_FOUND", "La wallet del usuario no existe.");

  await tx.ledgerEntry.create({
    data: {
      userId: opts.userId,
      type: opts.type,
      amount: roundServi(opts.amount),
      balanceBefore: roundServi(wallet.balance + opts.amount),
      balanceAfter: roundServi(wallet.balance),
      reference: opts.reference,
      description: opts.description,
      adminId: opts.adminId ?? null,
    },
  });
  return roundServi(wallet.balance);
}

/* ------------------------------------------------------------------ */
/*  Compra PayPal · acreditación idempotente                           */
/* ------------------------------------------------------------------ */

export async function creditPurchaseOnce(
  purchaseId: string
): Promise<{ credited: boolean; purchase: { id: string; userId: string; tokensAmount: number; status: string } }> {
  return db.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) throw new LedgerError("PURCHASE_NOT_FOUND", "Compra no encontrada.");

    if (purchase.status === "COMPLETED") {
      return { credited: false, purchase };
    }
    if (purchase.status === "REFUNDED" || purchase.status === "CANCELLED") {
      throw new LedgerError("PURCHASE_CLOSED", "La compra no puede acreditarse (estado " + purchase.status + ").");
    }

    // Reclamo atómico: solo un proceso puede pasar de no-COMPLETED a PENDING.
    const claim = await tx.purchase.updateMany({
      where: { id: purchaseId, status: { notIn: ["COMPLETED", "REFUNDED", "CANCELLED"] } },
      data: { status: "PENDING" },
    });
    if (claim.count === 0) {
      const fresh = await tx.purchase.findUnique({ where: { id: purchaseId } });
      return { credited: false, purchase: fresh! };
    }

    const user = await tx.user.findUnique({
      where: { id: purchase.userId },
      select: { username: true },
    });

    await creditInTx(tx, {
      userId: purchase.userId,
      amount: purchase.tokensAmount,
      type: "PURCHASE",
      reference: purchase.id,
      description: `Compra de ${purchase.tokensAmount.toLocaleString("es-DO")} SERVI mediante PayPal`,
    });

    const updated = await tx.purchase.update({
      where: { id: purchaseId },
      data: { status: "COMPLETED", creditedAt: new Date() },
    });

    return { credited: true, purchase: updated };
  });
}

/* ------------------------------------------------------------------ */
/*  Transferencias entre usuarios (atómicas e idempotentes)            */
/* ------------------------------------------------------------------ */

export async function executeTransfer(params: {
  reference: string;
  senderId: string;
  receiverId: string;
  amount: number;
  note?: string | null;
}): Promise<{ duplicated: boolean; transfer: { id: string; reference: string; amount: number; createdAt: Date } }> {
  try {
    return await db.$transaction(async (tx) => {
      const [sender, receiver] = await Promise.all([
        tx.user.findUnique({ where: { id: params.senderId }, select: { username: true } }),
        tx.user.findUnique({ where: { id: params.receiverId }, select: { username: true } }),
      ]);
      if (!sender || !receiver) throw new LedgerError("USER_NOT_FOUND", "Usuario no encontrado.");

      // 1) Reclamo por referencia única → protege contra doble click / reintentos.
      const transfer = await tx.transfer.create({
        data: {
          reference: params.reference,
          senderId: params.senderId,
          receiverId: params.receiverId,
          amount: params.amount,
          note: params.note ?? null,
        },
      });

      // 2) Débito con guard atómico + 3) crédito del receptor (misma transacción).
      await debitInTx(tx, {
        userId: params.senderId,
        amount: params.amount,
        type: "TRANSFER_SENT",
        reference: params.reference,
        description: `Enviado a @${receiver.username}`,
      });
      await creditInTx(tx, {
        userId: params.receiverId,
        amount: params.amount,
        type: "TRANSFER_RECEIVED",
        reference: params.reference,
        description: `Recibido de @${sender.username}`,
      });

      return { duplicated: false, transfer };
    });
  } catch (error) {
    // Referencia duplicada → la transferencia ya fue procesada antes.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      String(error.meta?.target ?? "").includes("reference")
    ) {
      const existing = await db.transfer.findUnique({
        where: { reference: params.reference },
      });
      if (existing) return { duplicated: true, transfer: existing };
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/*  Pago de servicios (atómico e idempotente)                          */
/* ------------------------------------------------------------------ */

export async function payService(params: {
  reference: string;
  userId: string;
  serviceId: string;
}): Promise<{ duplicated: boolean; payment: { id: string; serviceName: string; priceServi: number; createdAt: Date } }> {
  try {
    return await db.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { id: params.serviceId } });
      if (!service || service.status !== "ACTIVE") {
        throw new LedgerError("SERVICE_UNAVAILABLE", "El servicio no está disponible.");
      }

      // Reclamo idempotente
      const payment = await tx.servicePayment.create({
        data: {
          reference: params.reference,
          userId: params.userId,
          serviceId: service.id,
          serviceName: service.name,
          priceServi: service.priceServi,
        },
      });

      await debitInTx(tx, {
        userId: params.userId,
        amount: service.priceServi,
        type: "SERVICE_PAYMENT",
        reference: params.reference,
        description: `Pago de servicio: ${service.name}`,
      });

      return { duplicated: false, payment };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      String(error.meta?.target ?? "").includes("reference")
    ) {
      const existing = await db.servicePayment.findUnique({
        where: { reference: params.reference },
      });
      if (existing) return { duplicated: true, payment: existing };
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/*  Ajustes manuales de administrador                                  */
/* ------------------------------------------------------------------ */

export async function executeAdminAdjustment(params: {
  adminId: string;
  targetUserId: string;
  operation: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
}): Promise<{ id: string; balanceBefore: number; balanceAfter: number }> {
  return db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: params.targetUserId },
      select: { username: true },
    });
    if (!target) throw new LedgerError("USER_NOT_FOUND", "Usuario no encontrado.");

    // Reclamo: creamos primero el registro del ajuste (acta de la operación).
    const adjustment = await tx.adminAdjustment.create({
      data: {
        adminId: params.adminId,
        targetUserId: params.targetUserId,
        operation: params.operation,
        amount: params.amount,
        balanceBefore: 0,
        balanceAfter: 0,
        reason: params.reason,
      },
    });

    const walletBefore = await tx.wallet.findUnique({
      where: { userId: params.targetUserId },
    });
    const balanceBefore = roundServi(walletBefore?.balance ?? 0);

    const description =
      params.operation === "CREDIT"
        ? `Acreditación administrativa (${adjustment.id})`
        : `Deducción administrativa (${adjustment.id})`;

    const type = params.operation === "CREDIT" ? "ADMIN_CREDIT" : "ADMIN_DEBIT";
    const debitOrCredit = params.operation === "CREDIT" ? creditInTx : debitInTx;

    const balanceAfter = await debitOrCredit(tx, {
      userId: params.targetUserId,
      amount: params.amount,
      type,
      reference: adjustment.id,
      description,
      adminId: params.adminId,
    });

    await tx.adminAdjustment.update({
      where: { id: adjustment.id },
      data: { balanceBefore, balanceAfter },
    });

    return { id: adjustment.id, balanceBefore, balanceAfter };
  });
}

/* ------------------------------------------------------------------ */
/*  Configuración (tasa SERVI/USD)                                     */
/* ------------------------------------------------------------------ */

export const SERVI_PER_USD_KEY = "SERVI_PER_USD";
export const DEFAULT_SERVI_PER_USD = 100;

export async function getServiPerUsd(): Promise<number> {
  const config = await db.appConfig.findUnique({ where: { key: SERVI_PER_USD_KEY } });
  const parsed = config ? parseFloat(config.value) : DEFAULT_SERVI_PER_USD;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SERVI_PER_USD;
  return parsed;
}
