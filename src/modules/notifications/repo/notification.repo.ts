import "server-only";

import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/server/db";
import { notifications, userRoles } from "@/server/db/schema";
import type { NotificationRow } from "@/server/db/types";
import type { NotificationKind } from "@/shared/types/enums";

export interface NewNotification {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link?: string | null;
  meta?: Record<string, unknown> | null;
}

export async function insertNotifications(rows: readonly NewNotification[]): Promise<void> {
  if (rows.length === 0) return;

  await db.insert(notifications).values(
    rows.map((row) => ({
      userId: row.userId,
      kind: row.kind,
      title: row.title,
      body: row.body,
      link: row.link ?? null,
      meta: row.meta ?? null,
    })),
  );
}

/** شناسه کاربران دارای یکی از نقش‌های داده‌شده؛ برای اعلان گروهی به تیم. */
export async function findUserIdsByRoles(roles: readonly string[]): Promise<string[]> {
  if (roles.length === 0) return [];

  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(inArray(userRoles.role, [...roles]));

  return [...new Set(rows.map((row) => row.userId))];
}

export async function findNotifications(
  userId: string,
  options?: { limit?: number; onlyUnread?: boolean },
): Promise<NotificationRow[]> {
  const conditions = [eq(notifications.userId, userId)];
  if (options?.onlyUnread) conditions.push(isNull(notifications.readAt));

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(options?.limit ?? 30);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return rows[0]?.value ?? 0;
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: Date.now() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: Date.now() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
