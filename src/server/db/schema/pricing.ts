import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { GoldKarat, GoldPriceSource } from "@/shared/types/enums";

import { counter, createdAt, idRef, primaryId, rial, timestamp } from "../columns";
import { users } from "./identity";

/**
 * قیمت مرجع طلا. ⚠️ append-only
 *
 * هر تغییر قیمت یک ردیف جدید است؛ قیمت جاری = آخرین ردیف برای آن عیار.
 * هرگز UPDATE نمی‌شود تا گزارش تاریخی و حسابرسی ممکن بماند.
 */
export const goldPrices = sqliteTable(
  "gold_prices",
  {
    id: primaryId(),
    karat: counter("karat").$type<GoldKarat>().notNull(),

    /** قیمت هر گرم طلای خام به ریال. */
    pricePerGramRial: rial("price_per_gram_rial").notNull(),

    source: text("source").$type<GoldPriceSource>().notNull().default("manual"),

    /** مرجع منبع: نام سرویس یا توضیح ادمین. */
    sourceRef: text("source_ref"),

    /** لحظه‌ای که این قیمت معتبر شده است. */
    effectiveAt: timestamp("effective_at").notNull(),

    createdByUserId: idRef("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (table) => [
    index("gold_prices_karat_effective_idx").on(table.karat, table.effectiveAt),
    index("gold_prices_created_at_idx").on(table.createdAt),
  ],
);
