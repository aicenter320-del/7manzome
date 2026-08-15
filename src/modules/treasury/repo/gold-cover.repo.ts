import "server-only";

import { desc, eq, sum } from "drizzle-orm";

import { db } from "@/server/db";
import { goldCoverEntries } from "@/server/db/schema";
import type { GoldCoverEntryRow } from "@/server/db/types";
import type { GoldCoverSource, GoldKarat } from "@/shared/types/enums";

/**
 * درج خرید پوشش. ⚠️ جدول append-only است؛ update و delete ساخته نشود.
 */
export async function insertGoldCoverEntry(input: {
  amountMg: number;
  karat: GoldKarat;
  pureMg: number;
  paidRial: number | null;
  source: GoldCoverSource;
  note: string | null;
  purchasedAt: number;
  createdByUserId: string | null;
}): Promise<GoldCoverEntryRow> {
  const [row] = await db
    .insert(goldCoverEntries)
    .values({
      amountMg: input.amountMg,
      karat: input.karat,
      pureMg: input.pureMg,
      paidRial: input.paidRial,
      source: input.source,
      note: input.note,
      purchasedAt: input.purchasedAt,
      createdByUserId: input.createdByUserId,
    })
    .returning();

  if (!row) throw new Error("ثبت خرید پوشش طلا شکست خورد.");

  return row;
}

export async function sumCoveredPureMg(): Promise<number> {
  const rows = await db.select({ pure: sum(goldCoverEntries.pureMg) }).from(goldCoverEntries);
  return Number(rows[0]?.pure ?? 0);
}

export async function findGoldCoverEntries(limit = 50): Promise<GoldCoverEntryRow[]> {
  return db
    .select()
    .from(goldCoverEntries)
    .orderBy(desc(goldCoverEntries.purchasedAt), desc(goldCoverEntries.createdAt))
    .limit(limit);
}

export async function findGoldCoverEntryById(
  entryId: string,
): Promise<GoldCoverEntryRow | null> {
  const rows = await db
    .select()
    .from(goldCoverEntries)
    .where(eq(goldCoverEntries.id, entryId))
    .limit(1);

  return rows[0] ?? null;
}
