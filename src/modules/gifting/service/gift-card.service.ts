import "server-only";

import { getTreasureSummaryUnchecked } from "@/modules/treasury";
import { generateHumanCode } from "@/server/auth/crypto";
import { recordAudit } from "@/server/audit";
import type { GiftCardRow } from "@/server/db/types";
import type { GiftCardStatus } from "@/shared/types/enums";

import type { GiftCard } from "../domain/types";
import {
  findGiftCardByCode,
  findGiftCardById,
  findGiftCards as findGiftCardRows,
  findGiftLinksForTreasure,
  insertGiftCard,
  updateGiftCard,
} from "../repo/gifting.repo";

export class GiftCardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GiftCardError";
  }
}

function toGiftCard(row: GiftCardRow): GiftCard {
  return {
    id: row.id,
    code: row.code,
    design: row.design,
    treasureId: row.treasureId,
    contributionId: row.contributionId,
    status: row.status,
    note: row.note,
    assignedAt: row.assignedAt,
    printedAt: row.printedAt,
    redeemedAt: row.redeemedAt,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
  };
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

async function uniqueHumanCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateHumanCode(8);
    const existing = await findGiftCardByCode(code);
    if (!existing) return code;
  }

  throw new GiftCardError("ساخت کد کارت هدیه ممکن نشد. دوباره تلاش کنید.");
}

export async function createGiftCards(input: {
  userId: string;
  count: number;
  design?: string;
  treasureId?: string;
}): Promise<GiftCard[]> {
  if (input.count < 1 || input.count > 100) {
    throw new GiftCardError("تعداد کارت باید بین ۱ تا ۱۰۰ باشد.");
  }

  let assignedAt: number | null = null;
  let status: GiftCardStatus = "unassigned";

  if (input.treasureId) {
    const treasure = await getTreasureSummaryUnchecked(input.treasureId);
    if (!treasure) throw new GiftCardError("گنجینه پیدا نشد.");
    assignedAt = Date.now();
    status = "assigned";
  }

  const created: GiftCard[] = [];

  for (let index = 0; index < input.count; index += 1) {
    const code = await uniqueHumanCode();
    const row = await insertGiftCard({
      code,
      design: input.design ?? "classic",
      treasureId: input.treasureId ?? null,
      status,
      assignedAt,
      createdByUserId: input.userId,
    });
    created.push(toGiftCard(row));
  }

  await recordAudit({
    actorUserId: input.userId,
    action: "gift_card.created",
    entityType: "gift_card",
    entityId: created[0]?.id ?? null,
    summary: `ساخت ${input.count} کارت هدیه`,
    meta: { count: input.count, design: input.design ?? "classic" },
  });

  return created;
}

export async function assignGiftCard(input: {
  userId: string;
  giftCardId: string;
  treasureId: string;
}): Promise<GiftCard> {
  const card = await findGiftCardById(input.giftCardId);
  if (!card) throw new GiftCardError("کارت هدیه پیدا نشد.");

  if (card.status !== "unassigned") {
    throw new GiftCardError("این کارت قبلاً به گنجینه‌ای وصل شده است.");
  }

  const treasure = await getTreasureSummaryUnchecked(input.treasureId);
  if (!treasure) throw new GiftCardError("گنجینه پیدا نشد.");

  const assignedAt = Date.now();

  await updateGiftCard(card.id, {
    status: "assigned",
    treasureId: input.treasureId,
    assignedAt,
  });

  await recordAudit({
    actorUserId: input.userId,
    action: "gift_card.assigned",
    entityType: "gift_card",
    entityId: card.id,
    summary: "انتساب کارت هدیه به گنجینه",
    meta: { treasureId: input.treasureId },
  });

  return toGiftCard({
    ...card,
    status: "assigned",
    treasureId: input.treasureId,
    assignedAt,
  });
}

export async function markPrinted(giftCardId: string, userId: string): Promise<GiftCard> {
  const card = await findGiftCardById(giftCardId);
  if (!card) throw new GiftCardError("کارت هدیه پیدا نشد.");

  if (card.status !== "assigned" && card.status !== "unassigned") {
    throw new GiftCardError("این کارت را نمی‌توان به‌عنوان چاپ‌شده علامت زد.");
  }

  const printedAt = Date.now();

  await updateGiftCard(card.id, {
    status: "printed",
    printedAt,
  });

  await recordAudit({
    actorUserId: userId,
    action: "gift_card.printed",
    entityType: "gift_card",
    entityId: card.id,
    summary: "علامت چاپ کارت هدیه",
  });

  return toGiftCard({ ...card, status: "printed", printedAt });
}

/**
 * اسکن کارت فیزیکی. اگر به گنجینه‌ای با لینک هدیه وصل باشد، توکن لینک برمی‌گردد.
 */
export async function redeemGiftCard(code: string): Promise<{ token: string }> {
  const card = await findGiftCardByCode(normalizeCode(code));
  if (!card) throw new GiftCardError("کارت هدیه معتبر نیست.");

  if (card.status === "void") {
    throw new GiftCardError("این کارت باطل شده است.");
  }

  if (card.status === "unassigned" || !card.treasureId) {
    throw new GiftCardError("این کارت هنوز به گنجینه‌ای وصل نشده است.");
  }

  const links = await findGiftLinksForTreasure(card.treasureId);
  const preferred =
    links.find((link) => link.status === "active") ?? links[0] ?? null;

  if (!preferred) {
    throw new GiftCardError("برای این کارت لینک هدیه‌ای پیدا نشد.");
  }

  if (card.status !== "redeemed") {
    await updateGiftCard(card.id, {
      status: "redeemed",
      redeemedAt: Date.now(),
    });
  }

  return { token: preferred.token };
}

export async function listGiftCards(options?: {
  status?: GiftCardStatus;
  limit?: number;
}): Promise<GiftCard[]> {
  const rows = await findGiftCardRows(options);
  return rows.map(toGiftCard);
}
