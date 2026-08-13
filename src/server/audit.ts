import "server-only";

import { desc, eq } from "drizzle-orm";

import type { UserRole } from "@/shared/types/enums";

import { db } from "./db";
import { auditLogs } from "./db/schema";
import type { AuditLogRow } from "./db/types";
import { logger } from "./logger";

/**
 * ثبت گزارش رخداد. ⚠️ append-only
 *
 * هر عملیات حساس اینجا ثبت می‌شود: تایید یا رد پرداخت، تغییر قیمت طلا،
 * تغییر نقش، درج قلم دفتر کل، تغییر وضعیت سفارش.
 *
 * ⚠️ هرگز داده حساس در meta نمی‌گذاریم؛ فقط شناسه و مقدار غیرمحرمانه.
 */

export interface AuditInput {
  actorUserId?: string | null;
  actorRole?: UserRole | "customer" | "system";
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  meta?: Record<string, unknown>;
  ip?: string | null;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorUserId: input.actorUserId ?? null,
      actorRole: input.actorRole ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      meta: input.meta ?? null,
      ip: input.ip ?? null,
    });
  } catch (error) {
    // شکست ثبت گزارش نباید عملیات اصلی را برگرداند، اما باید دیده شود.
    logger.error("audit log insert failed", {
      action: input.action,
      error: String(error),
    });
  }
}

export async function listAuditLogs(options?: {
  entityType?: string;
  entityId?: string;
  limit?: number;
}): Promise<AuditLogRow[]> {
  const limit = options?.limit ?? 100;

  if (options?.entityId) {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, options.entityId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  if (options?.entityType) {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityType, options.entityType))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
