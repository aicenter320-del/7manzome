import "server-only";

import { getChildUnchecked } from "@/modules/children";
import { getSetting } from "@/modules/content";
import { assertTreasureAccess, getTreasureSummaryUnchecked } from "@/modules/treasury";
import { generateToken } from "@/server/auth/crypto";
import type { GiftLinkRow } from "@/server/db/types";
import { env } from "@/shared/config/env";
import { sanitizeText } from "@/shared/lib/persian";

import { buildGiftUrl, isGiftTokenFormat, isLinkAccepting, maskContributorName } from "../domain/gift-link";
import type { GiftLink, GiftLinkPublicView } from "../domain/types";
import {
  findConfirmedKeepsakes,
  findGiftLinkById,
  findGiftLinkByToken,
  findGiftLinksForTreasure as findGiftLinksForTreasureRows,
  incrementGiftLinkViews,
  insertGiftLink,
  updateGiftLink,
} from "../repo/gifting.repo";

export class GiftLinkError extends Error {
  constructor(message = "لینک هدیه پیدا نشد.") {
    super(message);
    this.name = "GiftLinkError";
  }
}

export class GiftLinkInactiveError extends Error {
  constructor(message = "این لینک هدیه در حال حاضر پذیرش مشارکت ندارد.") {
    super(message);
    this.name = "GiftLinkInactiveError";
  }
}

function toGiftLink(row: GiftLinkRow): GiftLink {
  return {
    id: row.id,
    treasureId: row.treasureId,
    token: row.token,
    title: row.title,
    message: row.message,
    suggestedAmountsRial: row.suggestedAmountsRial,
    targetMg: row.targetMg,
    status: row.status,
    expiresAt: row.expiresAt,
    viewCount: row.viewCount,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
  };
}

async function uniqueGiftToken(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const token = generateToken(16);
    const existing = await findGiftLinkByToken(token);
    if (!existing) return token;
  }

  throw new GiftLinkError("ساخت لینک هدیه ممکن نشد. دوباره تلاش کنید.");
}

async function expireIfNeeded(row: GiftLinkRow, now: number): Promise<GiftLinkRow> {
  if (
    row.expiresAt !== null &&
    row.expiresAt <= now &&
    row.status !== "expired" &&
    row.status !== "closed"
  ) {
    await updateGiftLink(row.id, { status: "expired" });
    return { ...row, status: "expired" };
  }

  return row;
}

export async function createGiftLink(input: {
  userId: string;
  treasureId: string;
  title: string;
  message?: string;
  suggestedAmountsRial?: number[];
  expiresAt?: number;
}): Promise<GiftLink & { url: string }> {
  const treasure = await assertTreasureAccess(input.treasureId, input.userId, "editor");

  const [token, defaultAmounts] = await Promise.all([
    uniqueGiftToken(),
    input.suggestedAmountsRial
      ? Promise.resolve(input.suggestedAmountsRial)
      : getSetting("gifting.suggested_amounts_rial"),
  ]);

  const row = await insertGiftLink({
    treasureId: treasure.id,
    token,
    title: sanitizeText(input.title, 120),
    message: input.message ? sanitizeText(input.message, 500) : null,
    suggestedAmountsRial: defaultAmounts,
    expiresAt: input.expiresAt ?? null,
    createdByUserId: input.userId,
  });

  const mapped = toGiftLink(row);

  return { ...mapped, url: buildGiftUrl(env.APP_URL, mapped.token) };
}

async function loadOwnedLink(giftLinkId: string, userId: string): Promise<GiftLinkRow> {
  const row = await findGiftLinkById(giftLinkId);
  if (!row) throw new GiftLinkError();

  await assertTreasureAccess(row.treasureId, userId, "editor");
  return row;
}

export async function pauseGiftLink(giftLinkId: string, userId: string): Promise<void> {
  const row = await loadOwnedLink(giftLinkId, userId);

  if (row.status !== "active") {
    throw new GiftLinkError("فقط لینک فعال را می‌توان موقتاً متوقف کرد.");
  }

  await updateGiftLink(row.id, { status: "paused" });
}

export async function resumeGiftLink(giftLinkId: string, userId: string): Promise<void> {
  const row = await loadOwnedLink(giftLinkId, userId);

  if (row.status !== "paused") {
    throw new GiftLinkError("فقط لینک متوقف‌شده را می‌توان دوباره فعال کرد.");
  }

  const now = Date.now();
  if (row.expiresAt !== null && row.expiresAt <= now) {
    await updateGiftLink(row.id, { status: "expired" });
    throw new GiftLinkInactiveError("مهلت این لینک گذشته است.");
  }

  await updateGiftLink(row.id, { status: "active" });
}

export async function closeGiftLink(giftLinkId: string, userId: string): Promise<void> {
  const row = await loadOwnedLink(giftLinkId, userId);

  if (row.status === "closed") return;

  if (row.status !== "active" && row.status !== "paused") {
    throw new GiftLinkError("این لینک را نمی‌توان بست.");
  }

  await updateGiftLink(row.id, { status: "closed" });
}

/**
 * صفحه عمومی هدیه. بازدید شمرده می‌شود و در صورت گذشت مهلت، وضعیت منقضی می‌شود.
 * خروجی عمداً هیچ شناسه داخلی یا داده تماس ندارد.
 */
export async function getGiftLinkByToken(token: string): Promise<GiftLinkPublicView | null> {
  if (!isGiftTokenFormat(token)) return null;

  const found = await findGiftLinkByToken(token);
  if (!found) return null;

  await incrementGiftLinkViews(found.id);

  const row = await expireIfNeeded(found, Date.now());
  const [summary, keepsakeRows, defaultAmounts] = await Promise.all([
    getTreasureSummaryUnchecked(row.treasureId),
    findConfirmedKeepsakes(row.treasureId),
    getSetting("gifting.suggested_amounts_rial"),
  ]);

  if (!summary) return null;

  const child = await getChildUnchecked(summary.treasure.childId);
  const childFirstName = child?.firstName ?? summary.child.firstName;
  const childAgeLabel = child?.ageLabel ?? summary.child.ageLabel;

  const suggestedAmountsRial =
    row.suggestedAmountsRial && row.suggestedAmountsRial.length > 0
      ? row.suggestedAmountsRial
      : defaultAmounts;

  const keepsakes = keepsakeRows
    .filter((item) => Boolean(item.keepsakeMessage && item.keepsakeMessage.trim()))
    .map((item) => ({
      contributorDisplayName: maskContributorName(item.contributorName, item.isAnonymous),
      message: item.keepsakeMessage ?? "",
    }));

  return {
    token: row.token,
    title: row.title,
    message: row.message,
    childFirstName,
    childAgeLabel,
    progressPercent: summary.progressPercent,
    balanceMg: summary.balance.balanceMg,
    goalTargetMg: summary.goal?.targetMg ?? row.targetMg,
    suggestedAmountsRial,
    status: row.status,
    expiresAt: row.expiresAt,
    keepsakes,
  };
}

export async function getGiftLinksForTreasure(
  treasureId: string,
  userId: string,
): Promise<Array<GiftLink & { url: string }>> {
  await assertTreasureAccess(treasureId, userId);

  const rows = await findGiftLinksForTreasureRows(treasureId);

  return rows.map((row) => {
    const link = toGiftLink(row);
    return { ...link, url: buildGiftUrl(env.APP_URL, link.token) };
  });
}

export function isGiftLinkAcceptingNow(link: Pick<GiftLink, "status" | "expiresAt">): boolean {
  return isLinkAccepting(link.status, link.expiresAt, Date.now());
}
