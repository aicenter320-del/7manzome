import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { personalizations } from "@/server/db/schema";
import type { PersonalizationRow } from "@/server/db/types";

export async function findById(id: string): Promise<PersonalizationRow | null> {
  const rows = await db
    .select()
    .from(personalizations)
    .where(eq(personalizations.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertPersonalization(input: {
  childId?: string | null;
  childNameFa?: string | null;
  childNameEn?: string | null;
  birthDateAt?: number | null;
  message?: string | null;
  symbol?: string | null;
  photoFileId?: string | null;
}): Promise<PersonalizationRow> {
  const [row] = await db
    .insert(personalizations)
    .values({
      childId: input.childId ?? null,
      childNameFa: input.childNameFa ?? null,
      childNameEn: input.childNameEn ?? null,
      birthDateAt: input.birthDateAt ?? null,
      message: input.message ?? null,
      symbol: input.symbol ?? null,
      photoFileId: input.photoFileId ?? null,
    })
    .returning();

  if (!row) throw new Error("ثبت شخصی‌سازی شکست خورد.");

  return row;
}

export async function updatePersonalizationRow(
  id: string,
  input: {
    childNameFa?: string | null;
    childNameEn?: string | null;
    birthDateAt?: number | null;
    message?: string | null;
    symbol?: string | null;
    photoFileId?: string | null;
    previewFileId?: string | null;
  },
): Promise<void> {
  await db.update(personalizations).set(input).where(eq(personalizations.id, id));
}

/** قفل کردن شخصی‌سازی؛ پس از ورود سفارش به مرحله حکاکی تغییر ممنوع است. */
export async function lockPersonalization(id: string): Promise<void> {
  await db
    .update(personalizations)
    .set({ lockedAt: Date.now() })
    .where(eq(personalizations.id, id));
}
