import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type { ContentStatus } from "@/shared/types/enums";

import {
  boolean,
  counter,
  createdAt,
  jsonColumn,
  primaryId,
  updatedAt,
} from "../columns";

/**
 * تنظیمات کلید/مقدار قابل ویرایش توسط ادمین.
 *
 * مقادیر هنگام خواندن با Zod اعتبارسنجی می‌شوند؛ هیچ‌جا JSON.parse بدون
 * اعتبارسنجی انجام نمی‌شود. کلیدهای مجاز در ماژول content متمرکز شده‌اند.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: jsonColumn<unknown>("value").notNull(),
  description: text("description"),
  updatedAt: updatedAt(),
});

export const contentPages = sqliteTable(
  "content_pages",
  {
    id: primaryId(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("content_pages_slug_unique").on(table.slug),
    index("content_pages_status_idx").on(table.status),
  ],
);

export const faqs = sqliteTable(
  "faqs",
  {
    id: primaryId(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    category: text("category"),
    sortOrder: counter("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("faqs_is_active_idx").on(table.isActive)],
);
