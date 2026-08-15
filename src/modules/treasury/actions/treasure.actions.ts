"use server";

import { revalidatePath } from "next/cache";

import { ChildAccessError } from "@/modules/children";
import { getCurrentGoldPrice } from "@/modules/pricing";
import { ActionError, createAction } from "@/server/actions/action-kit";
import { goldValueRial } from "@/shared/lib/gold";

import { LedgerValidationError } from "../domain/gold-ledger";
import { GoldCoverValidationError } from "../domain/gold-cover";
import {
  adjustLedgerSchema,
  changeTreasureStatusSchema,
  createTreasureSchema,
  editTreasureSchema,
  recordGoldCoverSchema,
  setGoalSchema,
} from "../schema/treasure.schema";
import {
  creditGold,
  debitGold,
  InsufficientBalanceError,
  TreasureClosedError,
} from "../service/gold-ledger.service";
import { recordGoldCoverPurchase } from "../service/gold-cover.service";
import {
  changeTreasureStatus,
  createTreasure,
  editTreasure,
  setGoal,
  TreasureAccessError,
} from "../service/treasure.service";

function rethrowDomainError(error: unknown): never {
  if (
    error instanceof TreasureAccessError ||
    error instanceof ChildAccessError ||
    error instanceof TreasureClosedError ||
    error instanceof InsufficientBalanceError ||
    error instanceof LedgerValidationError ||
    error instanceof GoldCoverValidationError
  ) {
    throw new ActionError(error.message);
  }
  throw error;
}

export const createTreasureAction = createAction({
  name: "treasury.createTreasure",
  schema: createTreasureSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      const treasure = await createTreasure({
        childId: input.childId,
        userId: user.id,
        title: input.title,
        kind: input.kind,
        ...(input.occasionSlug ? { occasionSlug: input.occasionSlug } : {}),
        ...(input.eventDateAt ? { eventDateAt: input.eventDateAt } : {}),
        ...(input.inviteMessage ? { inviteMessage: input.inviteMessage } : {}),
        visibility: input.visibility,
        ...(input.targetMg ? { targetMg: input.targetMg } : {}),
        ...(input.targetDateAt ? { targetDateAt: input.targetDateAt } : {}),
      });

      revalidatePath("/dashboard/treasures");
      revalidatePath("/dashboard");

      return { treasureId: treasure.id };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const setTreasureGoal = createAction({
  name: "treasury.setGoal",
  schema: setGoalSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      const goal = await setGoal({
        treasureId: input.treasureId,
        userId: user.id,
        targetMg: input.targetMg,
        ...(input.targetDateAt ? { targetDateAt: input.targetDateAt } : {}),
        ...(input.note ? { note: input.note } : {}),
      });

      revalidatePath(`/dashboard/treasures/${input.treasureId}`);

      return { goalId: goal.id };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const updateTreasureAction = createAction({
  name: "treasury.editTreasure",
  schema: editTreasureSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await editTreasure({ ...input, userId: user.id });
      revalidatePath(`/dashboard/treasures/${input.treasureId}`);
      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const changeTreasureStatusAction = createAction({
  name: "treasury.changeStatus",
  schema: changeTreasureStatusSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await changeTreasureStatus({ ...input, userId: user.id });
      revalidatePath("/dashboard/treasures");
      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

/**
 * تعدیل دستی موجودی توسط ادمین مالی.
 *
 * برای اصلاح خطا استفاده می‌شود و همیشه یک قلم **جدید** می‌سازد؛
 * هرگز قلم قبلی را تغییر نمی‌دهد (ADR-0005).
 */
export const adjustTreasureLedger = createAction({
  name: "treasury.adjustLedger",
  schema: adjustLedgerSchema,
  auth: "required",
  permissions: ["treasury:adjust"],
  handler: async ({ input, user }) => {
    const price = await getCurrentGoldPrice(input.karat);
    const valueRial = goldValueRial(input.amountMg, price.pricePerGramRial);

    try {
      const result =
        input.direction === "in"
          ? await creditGold({
              treasureId: input.treasureId,
              amountMg: input.amountMg,
              karat: input.karat,
              source: "adjustment",
              referenceType: "manual_adjustment",
              referenceId: `${user.id}-${Date.now()}`,
              goldPricePerGramRial: price.pricePerGramRial,
              valueRial,
              note: input.note,
              actorUserId: user.id,
            })
          : await debitGold({
              treasureId: input.treasureId,
              amountMg: input.amountMg,
              karat: input.karat,
              source: "correction",
              referenceType: "manual_adjustment",
              referenceId: `${user.id}-${Date.now()}`,
              goldPricePerGramRial: price.pricePerGramRial,
              valueRial,
              note: input.note,
              actorUserId: user.id,
            });

      revalidatePath(`/admin/treasures/${input.treasureId}`);

      return { ledgerEntryId: result.ledgerEntryId };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

/**
 * ثبت خرید طلای پوشش گنجینه. به دفتر کل کودک دست نمی‌زند.
 */
export const recordGoldCoverAction = createAction({
  name: "treasury.recordGoldCover",
  schema: recordGoldCoverSchema,
  auth: "required",
  permissions: ["treasury:adjust"],
  handler: async ({ input, user }) => {
    try {
      const entry = await recordGoldCoverPurchase({
        actorUserId: user.id,
        amountMg: input.amountMg,
        karat: input.karat,
        purchasedAt: input.purchasedAt,
        ...(input.paidRial !== undefined ? { paidRial: input.paidRial } : {}),
        ...(input.note ? { note: input.note } : {}),
      });

      revalidatePath("/admin/treasures");
      revalidatePath("/admin");

      return { coverEntryId: entry.id };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});
