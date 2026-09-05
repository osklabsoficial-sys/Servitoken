/**
 * ============================================================
 *  SERVITOKEN · Registro de auditoría
 * ============================================================
 *  Nunca se guardan secretos, contraseñas ni tokens aquí.
 * ============================================================
 */

import { db } from "@/lib/db";

export interface AuditInput {
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (error) {
    // La auditoría nunca debe romper el flujo principal.
    console.error("AUDIT_LOG_ERROR", error instanceof Error ? error.message : error);
  }
}
