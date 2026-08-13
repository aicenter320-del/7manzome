import "server-only";

import { getSetting } from "@/modules/content";
import { notify } from "@/modules/notifications";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import { logger } from "@/server/logger";
import { formatMg, fromPureMg, DISPLAY_KARAT, toPureMg } from "@/shared/lib/gold";
import type { GoldKarat, LedgerSource } from "@/shared/types/enums";

import {
  detectMilestones,
  LedgerValidationError,
  milestoneTitle,
  prepareEntry,
} from "../domain/gold-ledger";
import {
  findActiveGoal,
  findMilestones,
  findTreasureById,
  insertLedgerEntry,
  insertMilestones,
  markGoalAchieved,
  sumPureMg,
} from "../repo/treasure.repo";

/**
 * ثبت ورود و خروج طلا در دفتر کل.
 *
 * ⚠️ نقطه ورود واحد برای تغییر موجودی. هیچ‌جای دیگر نباید مستقیم به
 * gold_ledger_entries بنویسد. دلیل: درج قلم، تشخیص نقطه عطف، بستن هدف و
 * اطلاع‌رسانی باید همیشه با هم انجام شوند.
 */

export class TreasureClosedError extends Error {
  constructor() {
    super("این گنجینه بسته یا بایگانی شده و امکان افزودن به آن نیست.");
    this.name = "TreasureClosedError";
  }
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super("موجودی طلای گنجینه برای این عملیات کافی نیست.");
    this.name = "InsufficientBalanceError";
  }
}

export interface CreditGoldInput {
  treasureId: string;
  amountMg: number;
  karat: GoldKarat;
  source: LedgerSource;
  referenceType: string;
  referenceId: string;
  goldPricePerGramRial: number;
  valueRial: number;
  note?: string;
  actorUserId?: string | null;
  occurredAt?: number;
}

export interface CreditGoldResult {
  ledgerEntryId: string;
  previousBalanceMg: number;
  newBalanceMg: number;
  achievedMilestones: number[];
}

/** افزودن طلا به گنجینه. */
export async function creditGold(input: CreditGoldInput): Promise<CreditGoldResult> {
  const treasure = await findTreasureById(input.treasureId);

  if (!treasure) throw new LedgerValidationError("گنجینه پیدا نشد.");
  if (treasure.status !== "active") throw new TreasureClosedError();

  const prepared = prepareEntry({
    treasureId: input.treasureId,
    direction: "in",
    amountMg: input.amountMg,
    karat: input.karat,
    source: input.source,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    goldPricePerGramRial: input.goldPricePerGramRial,
    valueRial: input.valueRial,
    note: input.note ?? null,
    ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
  });

  const before = await sumPureMg(input.treasureId);
  const previousPure = before.inPureMg - before.outPureMg;
  const previousBalanceMg =
    previousPure > 0 ? fromPureMg(previousPure, DISPLAY_KARAT) : 0;

  const newPure = previousPure + prepared.pureMg;
  const newBalanceMg = newPure > 0 ? fromPureMg(newPure, DISPLAY_KARAT) : 0;

  const [thresholds, existingMilestones, goal] = await Promise.all([
    getSetting("treasury.milestones_mg"),
    findMilestones(input.treasureId),
    findActiveGoal(input.treasureId),
  ]);

  const achieved = detectMilestones({
    previousBalanceMg,
    newBalanceMg,
    thresholdsMg: thresholds,
    alreadyAchievedMg: existingMilestones.map((item) => item.thresholdMg),
  });

  // درج قلم، ثبت نقطه عطف و بستن هدف باید اتمیک باشند؛ وگرنه ممکن است طلا
  // ثبت شود ولی نقطه عطف جا بیفتد.
  const entryId = await db.transaction(async (tx) => {
    const row = await insertLedgerEntry(prepared, {
      tx,
      createdByUserId: input.actorUserId ?? null,
    });

    if (achieved.length > 0) {
      await insertMilestones(
        achieved.map((thresholdMg) => ({
          treasureId: input.treasureId,
          thresholdMg,
          title: milestoneTitle(thresholdMg),
          ledgerEntryId: row.id,
        })),
        tx,
      );
    }

    if (goal && newBalanceMg >= goal.targetMg) {
      await markGoalAchieved(goal.id, tx);
    }

    return row.id;
  });

  await recordAudit({
    actorUserId: input.actorUserId ?? null,
    action: "ledger.credit",
    entityType: "treasure",
    entityId: input.treasureId,
    summary: `افزودن ${formatMg(input.amountMg)} به گنجینه`,
    meta: {
      ledgerEntryId: entryId,
      amountMg: input.amountMg,
      karat: input.karat,
      source: input.source,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
    },
  });

  // اطلاع‌رسانی نقطه عطف؛ شکست آن نباید عملیات اصلی را برگرداند.
  for (const thresholdMg of achieved) {
    await notify({
      userId: treasure.assetOwnerUserId,
      kind: "milestone_reached",
      body: `گنجینه به «${milestoneTitle(thresholdMg)}» رسید.`,
      link: `/dashboard/treasures/${input.treasureId}`,
      meta: { thresholdMg },
    }).catch((error: unknown) => {
      logger.warn("milestone notification failed", { error: String(error) });
    });
  }

  logger.info("gold credited", {
    treasureId: input.treasureId,
    amountMg: input.amountMg,
    source: input.source,
  });

  return { ledgerEntryId: entryId, previousBalanceMg, newBalanceMg, achievedMilestones: achieved };
}

export interface DebitGoldInput {
  treasureId: string;
  amountMg: number;
  karat: GoldKarat;
  source: Extract<LedgerSource, "redemption" | "correction" | "adjustment">;
  referenceType: string;
  referenceId: string;
  goldPricePerGramRial: number;
  valueRial: number;
  note?: string;
  actorUserId?: string | null;
}

/** برداشت طلا از گنجینه. موجودی منفی ممنوع است. */
export async function debitGold(input: DebitGoldInput): Promise<{ ledgerEntryId: string }> {
  const treasure = await findTreasureById(input.treasureId);

  if (!treasure) throw new LedgerValidationError("گنجینه پیدا نشد.");
  if (treasure.status === "archived") throw new TreasureClosedError();

  const prepared = prepareEntry({
    treasureId: input.treasureId,
    direction: "out",
    amountMg: input.amountMg,
    karat: input.karat,
    source: input.source,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    goldPricePerGramRial: input.goldPricePerGramRial,
    valueRial: input.valueRial,
    note: input.note ?? null,
  });

  const before = await sumPureMg(input.treasureId);
  const availablePure = before.inPureMg - before.outPureMg;

  if (availablePure < toPureMg(input.amountMg, input.karat)) {
    throw new InsufficientBalanceError();
  }

  const row = await insertLedgerEntry(prepared, {
    createdByUserId: input.actorUserId ?? null,
  });

  await recordAudit({
    actorUserId: input.actorUserId ?? null,
    action: "ledger.debit",
    entityType: "treasure",
    entityId: input.treasureId,
    summary: `برداشت ${formatMg(input.amountMg)} از گنجینه`,
    meta: {
      ledgerEntryId: row.id,
      amountMg: input.amountMg,
      source: input.source,
    },
  });

  return { ledgerEntryId: row.id };
}
