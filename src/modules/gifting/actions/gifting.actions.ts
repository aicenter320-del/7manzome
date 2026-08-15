"use server";

import { revalidatePath } from "next/cache";

import { ActionError, createAction } from "@/server/actions/action-kit";

import {
  assignGiftCardSchema,
  createGiftCardsSchema,
  createGiftLinkSchema,
  giftCardIdSchema,
  giftLinkIdSchema,
  redeemGiftCardSchema,
  saveKeepsakeSchema,
  startContributionSchema,
} from "../schema/gifting.schema";
import { saveKeepsake, startContribution, ContributionError } from "../service/contribution.service";
import {
  assignGiftCard,
  createGiftCards,
  GiftCardError,
  markPrinted,
  redeemGiftCard,
  voidGiftCard,
} from "../service/gift-card.service";
import {
  closeGiftLink,
  createGiftLink,
  GiftLinkError,
  GiftLinkInactiveError,
  pauseGiftLink,
  resumeGiftLink,
} from "../service/gifting.service";

function rethrowDomainError(error: unknown): never {
  if (
    error instanceof GiftLinkError ||
    error instanceof GiftLinkInactiveError ||
    error instanceof ContributionError ||
    error instanceof GiftCardError
  ) {
    throw new ActionError(error.message);
  }
  throw error;
}

export const createGiftLinkAction = createAction({
  name: "gifting.createGiftLink",
  schema: createGiftLinkSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      const link = await createGiftLink({
        userId: user.id,
        treasureId: input.treasureId,
        title: input.title,
        ...(input.message ? { message: input.message } : {}),
        ...(input.suggestedAmountsRial ? { suggestedAmountsRial: input.suggestedAmountsRial } : {}),
        ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
      });

      revalidatePath(`/dashboard/treasures/${input.treasureId}`);

      return { giftLinkId: link.id, token: link.token, url: link.url };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const pauseGiftLinkAction = createAction({
  name: "gifting.pauseGiftLink",
  schema: giftLinkIdSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await pauseGiftLink(input.giftLinkId, user.id);
      return { ok: true as const };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const resumeGiftLinkAction = createAction({
  name: "gifting.resumeGiftLink",
  schema: giftLinkIdSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await resumeGiftLink(input.giftLinkId, user.id);
      return { ok: true as const };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const closeGiftLinkAction = createAction({
  name: "gifting.closeGiftLink",
  schema: giftLinkIdSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await closeGiftLink(input.giftLinkId, user.id);
      return { ok: true as const };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const startContributionAction = createAction({
  name: "gifting.startContribution",
  schema: startContributionSchema,
  auth: "guest",
  handler: async ({ input, user }) => {
    try {
      return await startContribution({
        token: input.token,
        contributorName: input.contributorName,
        ...(input.contributorPhone ? { contributorPhone: input.contributorPhone } : {}),
        ...(input.relationLabel ? { relationLabel: input.relationLabel } : {}),
        amountRial: input.amountRial,
        ...(input.keepsakeMessage ? { keepsakeMessage: input.keepsakeMessage } : {}),
        isAnonymous: input.isAnonymous,
        contributorUserId: user?.id ?? null,
      });
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const saveKeepsakeAction = createAction({
  name: "gifting.saveKeepsake",
  schema: saveKeepsakeSchema,
  auth: "guest",
  handler: async ({ input }) => {
    try {
      await saveKeepsake(input.contributionId, input.message);
      return { ok: true as const };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const createGiftCardsAction = createAction({
  name: "gifting.createGiftCards",
  schema: createGiftCardsSchema,
  auth: "required",
  permissions: ["treasury:read"],
  handler: async ({ input, user }) => {
    try {
      const cards = await createGiftCards({
        userId: user.id,
        count: input.count,
        ...(input.design ? { design: input.design } : {}),
        ...(input.treasureId ? { treasureId: input.treasureId } : {}),
      });

      revalidatePath("/admin/gift-cards");

      return { codes: cards.map((card) => card.code), count: cards.length };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const redeemGiftCardAction = createAction({
  name: "gifting.redeemGiftCard",
  schema: redeemGiftCardSchema,
  auth: "guest",
  handler: async ({ input }) => {
    try {
      return await redeemGiftCard(input.code);
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const assignGiftCardAction = createAction({
  name: "gifting.assignGiftCard",
  schema: assignGiftCardSchema,
  auth: "required",
  permissions: ["treasury:read"],
  handler: async ({ input, user }) => {
    try {
      await assignGiftCard({
        userId: user.id,
        giftCardId: input.giftCardId,
        treasureId: input.treasureId,
      });
      revalidatePath("/admin/gift-cards");
      return { ok: true as const };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const markGiftCardPrintedAction = createAction({
  name: "gifting.markGiftCardPrinted",
  schema: giftCardIdSchema,
  auth: "required",
  permissions: ["treasury:read"],
  handler: async ({ input, user }) => {
    try {
      await markPrinted(input.giftCardId, user.id);
      revalidatePath("/admin/gift-cards");
      return { ok: true as const };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const voidGiftCardAction = createAction({
  name: "gifting.voidGiftCard",
  schema: giftCardIdSchema,
  auth: "required",
  permissions: ["treasury:read"],
  handler: async ({ input, user }) => {
    try {
      await voidGiftCard(input.giftCardId, user.id);
      revalidatePath("/admin/gift-cards");
      return { ok: true as const };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});
