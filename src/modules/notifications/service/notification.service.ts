import "server-only";

import type { NotificationRow } from "@/server/db/types";
import type { NotificationKind } from "@/shared/types/enums";

import { NOTIFICATION_TITLES } from "../domain/templates";
import {
  countUnreadNotifications,
  findNotifications,
  findUserIdsByRoles,
  insertNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../repo/notification.repo";

/** ساخت اعلان درون‌سیستمی برای یک کاربر. */
export async function notify(input: {
  userId: string;
  kind: NotificationKind;
  body: string;
  title?: string;
  link?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await insertNotifications([
    {
      userId: input.userId,
      kind: input.kind,
      title: input.title ?? NOTIFICATION_TITLES[input.kind],
      body: input.body,
      link: input.link ?? null,
      meta: input.meta ?? null,
    },
  ]);
}

/**
 * اعلان برای گروهی از کارمندان.
 * برای مواردی مثل «رسید جدید در صف تایید» که باید به تیم مالی برسد.
 */
export async function notifyRoles(input: {
  roles: readonly string[];
  kind: NotificationKind;
  body: string;
  title?: string;
  link?: string;
}): Promise<void> {
  const userIds = await findUserIdsByRoles(input.roles);

  await insertNotifications(
    userIds.map((userId) => ({
      userId,
      kind: input.kind,
      title: input.title ?? NOTIFICATION_TITLES[input.kind],
      body: input.body,
      link: input.link ?? null,
    })),
  );
}

export async function listNotifications(
  userId: string,
  options?: { limit?: number; onlyUnread?: boolean },
): Promise<NotificationRow[]> {
  return findNotifications(userId, options);
}

export async function countUnread(userId: string): Promise<number> {
  return countUnreadNotifications(userId);
}

export async function markRead(userId: string, notificationId: string): Promise<void> {
  await markNotificationRead(userId, notificationId);
}

export async function markAllRead(userId: string): Promise<void> {
  await markAllNotificationsRead(userId);
}
