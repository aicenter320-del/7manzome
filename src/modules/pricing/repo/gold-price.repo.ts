import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { goldPrices } from "@/server/db/schema";
import type { GoldPriceRow } from "@/server/db/types";
import type { GoldKarat, GoldPriceSource } from "@/shared/types/enums";

/** آخرین قیمت ثبت‌شده برای یک عیار. جدول append-only است، پس آخرین ردیف = قیمت جاری. */
export async function findLatestPrice(karat: GoldKarat): Promise<GoldPriceRow | null> {
  const rows = await db
    .select()
    .from(goldPrices)
    .where(eq(goldPrices.karat, karat))
    .orderBy(desc(goldPrices.effectiveAt), desc(goldPrices.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertPrice(input: {
  karat: GoldKarat;
  pricePerGramRial: number;
  source: GoldPriceSource;
  sourceRef?: string | null;
  effectiveAt?: number;
  createdByUserId?: string | null;
}): Promise<GoldPriceRow> {
  const [row] = await db
    .insert(goldPrices)
    .values({
      karat: input.karat,
      pricePerGramRial: input.pricePerGramRial,
      source: input.source,
      sourceRef: input.sourceRef ?? null,
      effectiveAt: input.effectiveAt ?? Date.now(),
      createdByUserId: input.createdByUserId ?? null,
    })
    .returning();

  if (!row) throw new Error("ثبت قیمت طلا شکست خورد.");

  return row;
}

export async function findPriceHistory(
  karat: GoldKarat,
  limit = 50,
): Promise<GoldPriceRow[]> {
  return db
    .select()
    .from(goldPrices)
    .where(eq(goldPrices.karat, karat))
    .orderBy(desc(goldPrices.effectiveAt))
    .limit(limit);
}
