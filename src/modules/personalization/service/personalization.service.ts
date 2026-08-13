import "server-only";

import type { PersonalizationRow } from "@/server/db/types";
import { sanitizeText } from "@/shared/lib/persian";

import { validateEngravingText } from "../domain/engraving";
import type { Personalization, PersonalizationInput } from "../domain/types";
import {
  findById,
  insertPersonalization,
  lockPersonalization,
  updatePersonalizationRow,
} from "../repo/personalization.repo";

export class PersonalizationLockedError extends Error {
  constructor() {
    super("این شخصی‌سازی وارد مرحله تولید شده و قابل تغییر نیست.");
    this.name = "PersonalizationLockedError";
  }
}

export class EngravingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngravingError";
  }
}

function toPersonalization(row: PersonalizationRow): Personalization {
  return {
    id: row.id,
    childId: row.childId,
    childNameFa: row.childNameFa,
    childNameEn: row.childNameEn,
    birthDateAt: row.birthDateAt,
    message: row.message,
    symbol: row.symbol,
    photoFileId: row.photoFileId,
    previewFileId: row.previewFileId,
    lockedAt: row.lockedAt,
  };
}

export async function getPersonalizationById(id: string): Promise<Personalization | null> {
  const row = await findById(id);
  return row ? toPersonalization(row) : null;
}

/** ساخت شخصی‌سازی با اعتبارسنجی متن حکاکی بر مبنای ظرفیت گونه محصول. */
export async function createPersonalization(
  input: PersonalizationInput & { engravingMaxChars: number },
): Promise<Personalization> {
  const message = validateMessage(input.message, input.engravingMaxChars);

  const row = await insertPersonalization({
    childId: input.childId ?? null,
    childNameFa: input.childNameFa ? sanitizeText(input.childNameFa, 50) : null,
    childNameEn: input.childNameEn ? sanitizeText(input.childNameEn, 30) : null,
    birthDateAt: input.birthDateAt ?? null,
    message,
    symbol: input.symbol ? sanitizeText(input.symbol, 20) : null,
    photoFileId: input.photoFileId ?? null,
  });

  return toPersonalization(row);
}

export async function updatePersonalization(
  id: string,
  input: PersonalizationInput & { engravingMaxChars: number },
): Promise<void> {
  const existing = await findById(id);
  if (!existing) throw new EngravingError("شخصی‌سازی پیدا نشد.");
  if (existing.lockedAt !== null) throw new PersonalizationLockedError();

  const message = validateMessage(input.message, input.engravingMaxChars);

  await updatePersonalizationRow(id, {
    ...(input.childNameFa !== undefined
      ? { childNameFa: input.childNameFa ? sanitizeText(input.childNameFa, 50) : null }
      : {}),
    ...(input.childNameEn !== undefined
      ? { childNameEn: input.childNameEn ? sanitizeText(input.childNameEn, 30) : null }
      : {}),
    ...(input.birthDateAt !== undefined ? { birthDateAt: input.birthDateAt } : {}),
    ...(input.message !== undefined ? { message } : {}),
    ...(input.symbol !== undefined
      ? { symbol: input.symbol ? sanitizeText(input.symbol, 20) : null }
      : {}),
    ...(input.photoFileId !== undefined ? { photoFileId: input.photoFileId } : {}),
  });
}

/** قفل کردن هنگام ورود سفارش به مرحله حکاکی. */
export async function lock(id: string): Promise<void> {
  await lockPersonalization(id);
}

function validateMessage(message: string | undefined, maxChars: number): string | null {
  if (!message) return null;

  const script = /[\u0600-\u06FF]/.test(message) ? "persian" : "latin";
  const validation = validateEngravingText(message, { maxChars, script });

  if (!validation.ok) throw new EngravingError(validation.message);

  return validation.text;
}
