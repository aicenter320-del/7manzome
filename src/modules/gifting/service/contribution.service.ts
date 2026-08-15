import "server-only";

import { getChildUnchecked } from "@/modules/children";
import { getSetting } from "@/modules/content";
import { notify, sendTemplatedSms } from "@/modules/notifications";
import { createPayment, PaymentError } from "@/modules/payments";
import { getCurrentGoldPrice, GoldPriceUnavailableError } from "@/modules/pricing";
import {
  assertTreasureAccess,
  creditGold,
  getTreasureSummaryUnchecked,
  TreasureClosedError,
} from "@/modules/treasury";
import { recordAudit } from "@/server/audit";
import type { ContributionRow } from "@/server/db/types";
import { logger } from "@/server/logger";
import { DISPLAY_KARAT, formatMg, rialToGoldMg } from "@/shared/lib/gold";
import { sanitizeText } from "@/shared/lib/persian";

import { canTransition, canUpdateKeepsake } from "../domain/contribution-status";
import { isLinkAccepting, validateContributionAmount } from "../domain/gift-link";
import type { Contribution, StartContributionInput } from "../domain/types";
import {
  countConfirmedSince,
  findContributionById,
  findContributionsForTreasure,
  findGiftLinkByToken,
  findUserPhone,
  insertContribution,
  updateContribution,
  updateGiftLink,
} from "../repo/gifting.repo";
import { GiftLinkError, GiftLinkInactiveError } from "./gifting.service";

export class ContributionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContributionError";
  }
}

function toContribution(row: ContributionRow): Contribution {
  return {
    id: row.id,
    treasureId: row.treasureId,
    giftLinkId: row.giftLinkId,
    contributorUserId: row.contributorUserId,
    contributorName: row.contributorName,
    contributorPhone: row.contributorPhone,
    relationLabel: row.relationLabel,
    amountRial: row.amountRial,
    goldMg: row.goldMg,
    karat: row.karat,
    goldPricePerGramRial: row.goldPricePerGramRial,
    status: row.status,
    keepsakeMessage: row.keepsakeMessage,
    isAnonymous: row.isAnonymous,
    confirmedAt: row.confirmedAt,
    createdAt: row.createdAt,
  };
}

export async function startContribution(
  input: StartContributionInput,
): Promise<{ contributionId: string; paymentId: string; nextUrl: string }> {
  const link = await findGiftLinkByToken(input.token);
  if (!link) throw new GiftLinkError();

  const now = Date.now();

  if (link.expiresAt !== null && link.expiresAt <= now && link.status === "active") {
    await updateGiftLink(link.id, { status: "expired" });
    throw new GiftLinkInactiveError();
  }

  if (!isLinkAccepting(link.status, link.expiresAt, now)) {
    throw new GiftLinkInactiveError();
  }

  const minRial = await getSetting("gifting.min_contribution_rial");
  const amountCheck = validateContributionAmount(input.amountRial, minRial);

  if (!amountCheck.ok) {
    throw new ContributionError(amountCheck.error);
  }

  const maxKeepsake = await getSetting("gifting.max_keepsake_length");
  const keepsake = input.keepsakeMessage
    ? sanitizeText(input.keepsakeMessage, maxKeepsake)
    : null;

  const row = await insertContribution({
    treasureId: link.treasureId,
    giftLinkId: link.id,
    contributorUserId: input.contributorUserId ?? null,
    contributorName: sanitizeText(input.contributorName, 80),
    contributorPhone: input.contributorPhone ?? null,
    relationLabel: input.relationLabel ? sanitizeText(input.relationLabel, 40) : null,
    amountRial: input.amountRial,
    status: "awaiting_payment",
    keepsakeMessage: keepsake && keepsake.length > 0 ? keepsake : null,
    isAnonymous: input.isAnonymous,
  });

  try {
    const payment = await createPayment({
      purpose: "contribution",
      contributionId: row.id,
      amountRial: input.amountRial,
      payerUserId: input.contributorUserId ?? undefined,
    });

    logger.info("contribution started", {
      contributionId: row.id,
      paymentId: payment.paymentId,
    });

    return {
      contributionId: row.id,
      paymentId: payment.paymentId,
      nextUrl: payment.nextUrl,
    };
  } catch (error) {
    await updateContribution(row.id, { status: "cancelled" });
    if (error instanceof PaymentError) {
      throw new ContributionError(error.message);
    }
    throw error;
  }
}

/**
 * تسویه مشارکت پس از تایید قطعی پرداخت.
 *
 * تبدیل ریال به طلا با قیمت لحظه تایید است، نه لحظه ثبت.
 * اگر از قبل تایید شده باشد، بدون ثبت دوباره برمی‌گردد (idempotent).
 *
 * ⚠️ این تابع را payments صدا نمی‌زند تا دور وابستگی ساخته نشود.
 * ادمین پس از تایید پرداخت آن را صدا می‌زند.
 */
export async function confirmContribution(
  contributionId: string,
  actorUserId?: string,
): Promise<Contribution> {
  const row = await findContributionById(contributionId);
  if (!row) throw new ContributionError("مشارکت پیدا نشد.");

  if (row.status === "confirmed") {
    return toContribution(row);
  }

  if (!canTransition(row.status, "confirmed")) {
    throw new ContributionError("این مشارکت را نمی‌توان تایید کرد.");
  }

  let price;
  try {
    price = await getCurrentGoldPrice(DISPLAY_KARAT);
  } catch (error) {
    if (error instanceof GoldPriceUnavailableError) {
      throw new ContributionError(error.message);
    }
    throw error;
  }

  const goldMg = rialToGoldMg(row.amountRial, price.pricePerGramRial);

  if (goldMg <= 0) {
    throw new ContributionError("مبلغ برای تبدیل به طلا کافی نیست.");
  }

  try {
    await creditGold({
      treasureId: row.treasureId,
      amountMg: goldMg,
      karat: DISPLAY_KARAT,
      source: "contribution",
      referenceType: "contribution",
      referenceId: row.id,
      goldPricePerGramRial: price.pricePerGramRial,
      valueRial: row.amountRial,
      actorUserId: actorUserId ?? null,
    });
  } catch (error) {
    if (error instanceof TreasureClosedError) {
      throw new ContributionError(error.message);
    }
    throw error;
  }

  const confirmedAt = Date.now();

  await updateContribution(row.id, {
    status: "confirmed",
    goldMg,
    karat: DISPLAY_KARAT,
    goldPricePerGramRial: price.pricePerGramRial,
    confirmedAt,
  });

  const updated = await findContributionById(row.id);
  if (!updated) throw new ContributionError("مشارکت پس از تایید پیدا نشد.");

  await recordAudit({
    actorUserId: actorUserId ?? null,
    action: "contribution.confirmed",
    entityType: "contribution",
    entityId: row.id,
    summary: `تایید مشارکت و افزودن ${formatMg(goldMg)} به گنجینه`,
    meta: { treasureId: row.treasureId, goldMg, amountRial: row.amountRial },
  });

  await notifyOwner(updated, goldMg);

  logger.info("contribution confirmed", {
    contributionId: row.id,
    goldMg,
  });

  return toContribution(updated);
}

async function notifyOwner(row: ContributionRow, goldMg: number): Promise<void> {
  const summary = await getTreasureSummaryUnchecked(row.treasureId);
  if (!summary) return;

  const child = await getChildUnchecked(summary.treasure.childId);
  const childName = child?.firstName ?? summary.child.firstName;
  const goldText = formatMg(goldMg);
  const contributorName = row.contributorName;
  const ownerId = summary.treasure.assetOwnerUserId;
  const body = `${contributorName} ${goldText} طلا به گنجینه ${childName} اضافه کرد.`;

  await notify({
    userId: ownerId,
    kind: "gift_received",
    body,
    link: `/dashboard/treasures/${row.treasureId}`,
    meta: { contributionId: row.id, goldMg },
  }).catch((error: unknown) => {
    logger.warn("gift_received notification failed", { error: String(error) });
  });

  const ownerPhone = await findUserPhone(ownerId);

  if (ownerPhone) {
    await sendTemplatedSms(ownerPhone, "giftReceived", {
      childName,
      contributorName,
      goldText,
    }).catch((error: unknown) => {
      logger.warn("giftReceived sms failed", { error: String(error) });
    });
  }
}

export async function markContributionRejected(contributionId: string): Promise<void> {
  const row = await findContributionById(contributionId);
  if (!row) throw new ContributionError("مشارکت پیدا نشد.");

  if (row.status === "rejected") return;

  if (!canTransition(row.status, "rejected")) {
    throw new ContributionError("این مشارکت را نمی‌توان رد کرد.");
  }

  await updateContribution(row.id, { status: "rejected" });
}

export async function cancelContribution(contributionId: string): Promise<void> {
  const row = await findContributionById(contributionId);
  if (!row) throw new ContributionError("مشارکت پیدا نشد.");

  if (row.status === "cancelled") return;

  if (!canTransition(row.status, "cancelled")) {
    throw new ContributionError("این مشارکت را نمی‌توان لغو کرد.");
  }

  await updateContribution(row.id, { status: "cancelled" });
}

export async function saveKeepsake(
  contributionId: string,
  message: string,
): Promise<void> {
  const row = await findContributionById(contributionId);
  if (!row) throw new ContributionError("مشارکت پیدا نشد.");

  if (!canUpdateKeepsake(row.status)) {
    throw new ContributionError("در این وضعیت نمی‌توان پیام یادگاری را تغییر داد.");
  }

  const maxKeepsake = await getSetting("gifting.max_keepsake_length");
  const keepsake = sanitizeText(message, maxKeepsake);

  await updateContribution(row.id, {
    keepsakeMessage: keepsake.length > 0 ? keepsake : null,
  });
}

export async function listContributionsForTreasure(
  treasureId: string,
  userId: string,
): Promise<Contribution[]> {
  await assertTreasureAccess(treasureId, userId);

  const rows = await findContributionsForTreasure(treasureId);
  return rows.map(toContribution);
}

export const getContributionsForTreasure = listContributionsForTreasure;

/** فهرست مشارکت برای پنل ادمین؛ بدون محدودیت مالک. */
export async function listContributionsForAdmin(treasureId: string): Promise<Contribution[]> {
  const rows = await findContributionsForTreasure(treasureId);
  return rows.map(toContribution);
}

export async function countConfirmedContributionsSince(fromAt: number): Promise<number> {
  return countConfirmedSince(fromAt);
}
