import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type {
  GoalStatus,
  GoldKarat,
  LedgerDirection,
  LedgerSource,
  TreasureKind,
  TreasureStatus,
  TreasureVisibility,
} from "@/shared/types/enums";

import {
  counter,
  createdAt,
  idRef,
  mg,
  primaryId,
  rial,
  timestamp,
  updatedAt,
} from "../columns";
import { children } from "./children";
import { users } from "./identity";

/**
 * گنجینه کودک.
 *
 * سه مفهوم مالکیت عمداً در سه ستون جدا هستند (ADR-0006):
 *   childId            → گنجینه به این کودک منتسب است
 *   createdByUserId    → کدام کاربر آن را ساخته
 *   assetOwnerUserId   → از نظر حقوقی مالک طلا کیست
 */
export const treasures = sqliteTable(
  "treasures",
  {
    id: primaryId(),
    childId: idRef("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    kind: text("kind").$type<TreasureKind>().notNull().default("personal"),

    /** برای گنجینه رویدادی: مناسبت و تاریخ آن. */
    occasionSlug: text("occasion_slug"),
    eventDateAt: timestamp("event_date_at"),

    /** پیام والد که در صفحه عمومی هدیه نمایش داده می‌شود. */
    inviteMessage: text("invite_message"),

    status: text("status").$type<TreasureStatus>().notNull().default("active"),
    visibility: text("visibility").$type<TreasureVisibility>().notNull().default("private"),

    createdByUserId: idRef("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    /** مالک حقوقی دارایی؛ در MVP همیشه یک کاربر بزرگسال. */
    assetOwnerUserId: idRef("asset_owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    closedAt: timestamp("closed_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("treasures_child_id_idx").on(table.childId),
    index("treasures_status_idx").on(table.status),
    index("treasures_asset_owner_idx").on(table.assetOwnerUserId),
    index("treasures_created_by_idx").on(table.createdByUserId),
  ],
);

/**
 * دفتر کل طلا. ⚠️ append-only — قلب سیستم
 *
 * هیچ UPDATE یا DELETE روی این جدول مجاز نیست.
 * موجودی هرگز ذخیره نمی‌شود؛ همیشه از جمع قلم‌ها محاسبه می‌گردد.
 * اصلاح خطا = قلم جدید با source = 'correction'. (ADR-0005)
 */
export const goldLedgerEntries = sqliteTable(
  "gold_ledger_entries",
  {
    id: primaryId(),
    treasureId: idRef("treasure_id")
      .notNull()
      .references(() => treasures.id, { onDelete: "restrict" }),

    direction: text("direction").$type<LedgerDirection>().notNull(),

    /** همیشه مثبت؛ جهت را ستون direction تعیین می‌کند. */
    amountMg: mg("amount_mg").notNull(),

    karat: counter("karat").$type<GoldKarat>().notNull().default(18),

    /** معادل طلای ۲۴ عیار؛ برای جمع‌زدن درست عیارهای مختلف. */
    pureMg: mg("pure_mg").notNull(),

    source: text("source").$type<LedgerSource>().notNull(),

    /** منشأ قلم؛ قلم بی‌منشأ ممنوع است. */
    referenceType: text("reference_type").notNull(),
    referenceId: text("reference_id").notNull(),

    /** قیمت لحظه ثبت؛ برای گزارش تاریخی. */
    goldPricePerGramRial: rial("gold_price_per_gram_rial").notNull(),
    valueRial: rial("value_rial").notNull(),

    note: text("note"),
    createdByUserId: idRef("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    occurredAt: timestamp("occurred_at").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("gold_ledger_treasure_idx").on(table.treasureId),
    index("gold_ledger_reference_idx").on(table.referenceType, table.referenceId),
    index("gold_ledger_occurred_at_idx").on(table.occurredAt),
    // یک مرجع نمی‌تواند دو بار قلم بسازد؛ محافظ در برابر ثبت دوباره.
    uniqueIndex("gold_ledger_reference_unique").on(
      table.referenceType,
      table.referenceId,
      table.direction,
    ),
  ],
);

/** هدف وزنی گنجینه با مهلت. */
export const treasureGoals = sqliteTable(
  "treasure_goals",
  {
    id: primaryId(),
    treasureId: idRef("treasure_id")
      .notNull()
      .references(() => treasures.id, { onDelete: "cascade" }),
    targetMg: mg("target_mg").notNull(),
    targetDateAt: timestamp("target_date_at"),
    note: text("note"),
    status: text("status").$type<GoalStatus>().notNull().default("active"),
    achievedAt: timestamp("achieved_at"),
    createdByUserId: idRef("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("treasure_goals_treasure_idx").on(table.treasureId),
    index("treasure_goals_status_idx").on(table.status),
  ],
);

/** نقاط عطف کسب‌شده، متصل به قلمی که باعث رسیدن به آن شده. */
export const treasureMilestones = sqliteTable(
  "treasure_milestones",
  {
    id: primaryId(),
    treasureId: idRef("treasure_id")
      .notNull()
      .references(() => treasures.id, { onDelete: "cascade" }),

    /** آستانه وزنی این نقطه عطف؛ همان کلید شناسایی آن است. */
    thresholdMg: mg("threshold_mg").notNull(),
    title: text("title").notNull(),
    ledgerEntryId: idRef("ledger_entry_id").references(() => goldLedgerEntries.id, {
      onDelete: "set null",
    }),
    achievedAt: timestamp("achieved_at").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("treasure_milestones_unique").on(table.treasureId, table.thresholdMg),
    index("treasure_milestones_treasure_idx").on(table.treasureId),
  ],
);
