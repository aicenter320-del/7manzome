import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type { FileVisibility } from "@/shared/types/enums";

import { counter, createdAt, idRef, primaryId, timestamp } from "../columns";
import { users } from "./identity";

/**
 * هر فایل آپلودی یک رکورد دارد.
 *
 * فایل‌های private (رسید پرداخت، تصویر کودک) بیرون از public ذخیره می‌شوند و
 * فقط از مسیر کنترل‌شده app/api/files سرو می‌گردند.
 */
export const mediaFiles = sqliteTable(
  "media_files",
  {
    id: primaryId(),

    /** کلید نسبی فایل در فضای ذخیره‌سازی؛ نام آن را همیشه سرور تولید می‌کند. */
    storageKey: text("storage_key").notNull(),
    originalName: text("original_name"),
    mimeType: text("mime_type").notNull(),
    sizeBytes: counter("size_bytes").notNull(),
    width: counter("width"),
    height: counter("height"),
    visibility: text("visibility").$type<FileVisibility>().notNull().default("private"),
    checksum: text("checksum"),
    uploadedByUserId: idRef("uploaded_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("media_files_storage_key_unique").on(table.storageKey),
    index("media_files_visibility_idx").on(table.visibility),
  ],
);
