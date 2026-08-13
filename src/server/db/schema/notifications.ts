import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type {
  NotificationKind,
  SmsProviderKey,
  SmsStatus,
} from "@/shared/types/enums";

import {
  createdAt,
  idRef,
  jsonColumn,
  primaryId,
  timestamp,
} from "../columns";
import { users } from "./identity";

/** اعلان درون‌سیستمی. */
export const notifications = sqliteTable(
  "notifications",
  {
    id: primaryId(),
    userId: idRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").$type<NotificationKind>().notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    meta: jsonColumn<Record<string, unknown>>("meta"),
    readAt: timestamp("read_at"),
    createdAt: createdAt(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_read_at_idx").on(table.readAt),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
);

/**
 * تاریخچه پیامک‌های ارسالی.
 *
 * هر پیامک ثبت می‌شود، حتی در حالت console. بدون این تاریخچه، عیب‌یابی
 * شکایت «پیامک نرسید» غیرممکن است.
 */
export const smsMessages = sqliteTable(
  "sms_messages",
  {
    id: primaryId(),
    phone: text("phone").notNull(),
    template: text("template"),
    body: text("body").notNull(),
    provider: text("provider").$type<SmsProviderKey>().notNull(),
    providerMessageId: text("provider_message_id"),
    status: text("status").$type<SmsStatus>().notNull().default("queued"),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at"),
    createdAt: createdAt(),
  },
  (table) => [
    index("sms_messages_phone_idx").on(table.phone),
    index("sms_messages_status_idx").on(table.status),
    index("sms_messages_created_at_idx").on(table.createdAt),
  ],
);
