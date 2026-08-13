import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type {
  ContributionStatus,
  GiftCardStatus,
  GiftLinkStatus,
  GoldKarat,
} from "@/shared/types/enums";

import {
  boolean,
  counter,
  createdAt,
  idRef,
  jsonColumn,
  mg,
  primaryId,
  rial,
  timestamp,
  updatedAt,
} from "../columns";
import { users } from "./identity";
import { treasures } from "./treasury";

/**
 * لینک عمومی دعوت به مشارکت در گنجینه.
 *
 * token غیرقابل حدس است و صفحه عمومی فقط با آن قابل دسترسی است.
 */
export const giftLinks = sqliteTable(
  "gift_links",
  {
    id: primaryId(),
    treasureId: idRef("treasure_id")
      .notNull()
      .references(() => treasures.id, { onDelete: "cascade" }),

    token: text("token").notNull(),
    title: text("title").notNull(),
    message: text("message"),

    /** مبالغ پیشنهادی نمایش‌داده‌شده به مهمان، به ریال. */
    suggestedAmountsRial: jsonColumn<number[]>("suggested_amounts_rial"),

    targetMg: mg("target_mg"),

    status: text("status").$type<GiftLinkStatus>().notNull().default("active"),
    expiresAt: timestamp("expires_at"),
    viewCount: counter("view_count").notNull().default(0),

    createdByUserId: idRef("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("gift_links_token_unique").on(table.token),
    index("gift_links_treasure_idx").on(table.treasureId),
    index("gift_links_status_idx").on(table.status),
  ],
);

/**
 * مشارکت یک نفر در گنجینه.
 *
 * هدیه‌دهنده مالک دارایی نیست؛ این رکورد فقط برای انتساب، تشکر و پیام یادگاری است.
 * goldMg فقط پس از تایید پرداخت پر می‌شود، با قیمت لحظه تایید. (ADR-0007)
 */
export const contributions = sqliteTable(
  "contributions",
  {
    id: primaryId(),
    treasureId: idRef("treasure_id")
      .notNull()
      .references(() => treasures.id, { onDelete: "restrict" }),
    giftLinkId: idRef("gift_link_id").references(() => giftLinks.id, {
      onDelete: "set null",
    }),

    /** مهمان می‌تواند حساب نداشته باشد. */
    contributorUserId: idRef("contributor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    contributorName: text("contributor_name").notNull(),
    contributorPhone: text("contributor_phone"),

    /** برچسب نسبت به‌صورت متن آزاد: «خاله»، «دوست مامان». */
    relationLabel: text("relation_label"),

    amountRial: rial("amount_rial").notNull(),

    /** پس از تایید پرداخت پر می‌شود. */
    goldMg: mg("gold_mg"),
    karat: counter("karat").$type<GoldKarat>(),
    goldPricePerGramRial: rial("gold_price_per_gram_rial"),

    status: text("status").$type<ContributionStatus>().notNull().default("draft"),

    /** پیام یادگاری برای کودک؛ پاک‌سازی‌شده و با محدودیت طول. */
    keepsakeMessage: text("keepsake_message"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),

    confirmedAt: timestamp("confirmed_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("contributions_treasure_idx").on(table.treasureId),
    index("contributions_gift_link_idx").on(table.giftLinkId),
    index("contributions_status_idx").on(table.status),
    index("contributions_created_at_idx").on(table.createdAt),
  ],
);

/** کارت هدیه فیزیکی با کد و QR. */
export const giftCards = sqliteTable(
  "gift_cards",
  {
    id: primaryId(),
    code: text("code").notNull(),
    design: text("design").notNull().default("classic"),

    treasureId: idRef("treasure_id").references(() => treasures.id, {
      onDelete: "set null",
    }),
    contributionId: idRef("contribution_id").references(() => contributions.id, {
      onDelete: "set null",
    }),

    status: text("status").$type<GiftCardStatus>().notNull().default("unassigned"),
    note: text("note"),

    assignedAt: timestamp("assigned_at"),
    printedAt: timestamp("printed_at"),
    redeemedAt: timestamp("redeemed_at"),
    createdByUserId: idRef("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("gift_cards_code_unique").on(table.code),
    index("gift_cards_status_idx").on(table.status),
    index("gift_cards_treasure_idx").on(table.treasureId),
  ],
);
