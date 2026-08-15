import "server-only";

import { and, count, desc, eq, gte, inArray, isNotNull, or, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { contributions, children, giftCards, giftLinks, treasures, users } from "@/server/db/schema";
import type { ContributionRow, GiftCardRow, GiftLinkRow } from "@/server/db/types";
import type {
  ContributionStatus,
  GiftCardStatus,
  GiftLinkStatus,
  GoldKarat,
} from "@/shared/types/enums";

export async function findGiftLinkById(giftLinkId: string): Promise<GiftLinkRow | null> {
  const rows = await db.select().from(giftLinks).where(eq(giftLinks.id, giftLinkId)).limit(1);
  return rows[0] ?? null;
}

export async function findGiftLinkByToken(token: string): Promise<GiftLinkRow | null> {
  const rows = await db.select().from(giftLinks).where(eq(giftLinks.token, token)).limit(1);
  return rows[0] ?? null;
}

export async function findGiftLinksForTreasure(treasureId: string): Promise<GiftLinkRow[]> {
  return db
    .select()
    .from(giftLinks)
    .where(eq(giftLinks.treasureId, treasureId))
    .orderBy(desc(giftLinks.createdAt));
}

export async function findGiftLinksForUser(userId: string): Promise<GiftLinkRow[]> {
  return db
    .select()
    .from(giftLinks)
    .where(eq(giftLinks.createdByUserId, userId))
    .orderBy(desc(giftLinks.createdAt));
}

export async function insertGiftLink(input: {
  treasureId: string;
  token: string;
  title: string;
  message?: string | null;
  suggestedAmountsRial?: number[] | null;
  targetMg?: number | null;
  expiresAt?: number | null;
  createdByUserId: string;
}): Promise<GiftLinkRow> {
  const [row] = await db
    .insert(giftLinks)
    .values({
      treasureId: input.treasureId,
      token: input.token,
      title: input.title,
      message: input.message ?? null,
      suggestedAmountsRial: input.suggestedAmountsRial ?? null,
      targetMg: input.targetMg ?? null,
      expiresAt: input.expiresAt ?? null,
      createdByUserId: input.createdByUserId,
    })
    .returning();

  if (!row) throw new Error("ساخت لینک هدیه شکست خورد.");

  return row;
}

export async function updateGiftLink(
  giftLinkId: string,
  input: {
    status?: GiftLinkStatus;
    title?: string;
    message?: string | null;
    suggestedAmountsRial?: number[] | null;
    expiresAt?: number | null;
  },
): Promise<void> {
  await db
    .update(giftLinks)
    .set({
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.message !== undefined ? { message: input.message } : {}),
      ...(input.suggestedAmountsRial !== undefined
        ? { suggestedAmountsRial: input.suggestedAmountsRial }
        : {}),
      ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
    })
    .where(eq(giftLinks.id, giftLinkId));
}

export async function incrementGiftLinkViews(giftLinkId: string): Promise<void> {
  await db
    .update(giftLinks)
    .set({ viewCount: sql`${giftLinks.viewCount} + 1` })
    .where(eq(giftLinks.id, giftLinkId));
}

export async function insertContribution(input: {
  treasureId: string;
  giftLinkId?: string | null;
  contributorUserId?: string | null;
  contributorName: string;
  contributorPhone?: string | null;
  relationLabel?: string | null;
  amountRial: number;
  status: ContributionStatus;
  keepsakeMessage?: string | null;
  isAnonymous: boolean;
}): Promise<ContributionRow> {
  const [row] = await db
    .insert(contributions)
    .values({
      treasureId: input.treasureId,
      giftLinkId: input.giftLinkId ?? null,
      contributorUserId: input.contributorUserId ?? null,
      contributorName: input.contributorName,
      contributorPhone: input.contributorPhone ?? null,
      relationLabel: input.relationLabel ?? null,
      amountRial: input.amountRial,
      status: input.status,
      keepsakeMessage: input.keepsakeMessage ?? null,
      isAnonymous: input.isAnonymous,
    })
    .returning();

  if (!row) throw new Error("ثبت مشارکت شکست خورد.");

  return row;
}

export async function updateContribution(
  contributionId: string,
  input: {
    status?: ContributionStatus;
    goldMg?: number | null;
    karat?: GoldKarat | null;
    goldPricePerGramRial?: number | null;
    confirmedAt?: number | null;
    keepsakeMessage?: string | null;
  },
): Promise<void> {
  await db
    .update(contributions)
    .set({
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.goldMg !== undefined ? { goldMg: input.goldMg } : {}),
      ...(input.karat !== undefined ? { karat: input.karat } : {}),
      ...(input.goldPricePerGramRial !== undefined
        ? { goldPricePerGramRial: input.goldPricePerGramRial }
        : {}),
      ...(input.confirmedAt !== undefined ? { confirmedAt: input.confirmedAt } : {}),
      ...(input.keepsakeMessage !== undefined ? { keepsakeMessage: input.keepsakeMessage } : {}),
    })
    .where(eq(contributions.id, contributionId));
}

export async function findContributionById(contributionId: string): Promise<ContributionRow | null> {
  const rows = await db
    .select()
    .from(contributions)
    .where(eq(contributions.id, contributionId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findContributionsForTreasure(treasureId: string): Promise<ContributionRow[]> {
  return db
    .select()
    .from(contributions)
    .where(eq(contributions.treasureId, treasureId))
    .orderBy(desc(contributions.createdAt));
}

export async function findConfirmedKeepsakes(treasureId: string): Promise<ContributionRow[]> {
  return db
    .select()
    .from(contributions)
    .where(
      and(
        eq(contributions.treasureId, treasureId),
        eq(contributions.status, "confirmed"),
        isNotNull(contributions.keepsakeMessage),
      ),
    )
    .orderBy(desc(contributions.confirmedAt));
}

export async function countConfirmedSince(fromAt: number): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(contributions)
    .where(and(eq(contributions.status, "confirmed"), gte(contributions.confirmedAt, fromAt)));

  return rows[0]?.value ?? 0;
}

export async function insertGiftCard(input: {
  code: string;
  design?: string;
  treasureId?: string | null;
  status: GiftCardStatus;
  assignedAt?: number | null;
  createdByUserId?: string | null;
}): Promise<GiftCardRow> {
  const [row] = await db
    .insert(giftCards)
    .values({
      code: input.code,
      design: input.design ?? "classic",
      treasureId: input.treasureId ?? null,
      status: input.status,
      assignedAt: input.assignedAt ?? null,
      createdByUserId: input.createdByUserId ?? null,
    })
    .returning();

  if (!row) throw new Error("ساخت کارت هدیه شکست خورد.");

  return row;
}

export async function findGiftCardByCode(code: string): Promise<GiftCardRow | null> {
  const rows = await db
    .select()
    .from(giftCards)
    .where(eq(giftCards.code, code))
    .limit(1);

  return rows[0] ?? null;
}

export async function findGiftCardById(giftCardId: string): Promise<GiftCardRow | null> {
  const rows = await db.select().from(giftCards).where(eq(giftCards.id, giftCardId)).limit(1);
  return rows[0] ?? null;
}

export async function findGiftCards(options?: {
  status?: GiftCardStatus;
  limit?: number;
}): Promise<GiftCardRow[]> {
  const limit = options?.limit ?? 200;

  if (options?.status) {
    return db
      .select()
      .from(giftCards)
      .where(eq(giftCards.status, options.status))
      .orderBy(desc(giftCards.createdAt))
      .limit(limit);
  }

  return db.select().from(giftCards).orderBy(desc(giftCards.createdAt)).limit(limit);
}

export async function findGiftCardsWithTreasure(options?: {
  status?: GiftCardStatus;
  limit?: number;
}): Promise<
  Array<{
    card: GiftCardRow;
    treasureTitle: string | null;
    childFirstName: string | null;
  }>
> {
  const limit = options?.limit ?? 200;
  const query = db
    .select({
      card: giftCards,
      treasureTitle: treasures.title,
      childFirstName: children.firstName,
    })
    .from(giftCards)
    .leftJoin(treasures, eq(giftCards.treasureId, treasures.id))
    .leftJoin(children, eq(treasures.childId, children.id));

  if (options?.status) {
    return query
      .where(eq(giftCards.status, options.status))
      .orderBy(desc(giftCards.createdAt))
      .limit(limit);
  }

  return query.orderBy(desc(giftCards.createdAt)).limit(limit);
}

export async function findPreferredGiftLinkTokens(
  treasureIds: readonly string[],
): Promise<Map<string, string>> {
  const tokens = new Map<string, string>();
  if (treasureIds.length === 0) return tokens;

  const rows = await db
    .select({
      treasureId: giftLinks.treasureId,
      token: giftLinks.token,
      status: giftLinks.status,
    })
    .from(giftLinks)
    .where(inArray(giftLinks.treasureId, [...treasureIds]))
    .orderBy(desc(giftLinks.createdAt));

  const grouped = new Map<string, Array<{ token: string; status: GiftLinkStatus }>>();
  for (const row of rows) {
    const list = grouped.get(row.treasureId) ?? [];
    list.push({ token: row.token, status: row.status });
    grouped.set(row.treasureId, list);
  }

  for (const [treasureId, list] of grouped) {
    const preferred = list.find((item) => item.status === "active") ?? list[0];
    if (preferred) tokens.set(treasureId, preferred.token);
  }

  return tokens;
}

export async function findGiftCardsForUser(
  userId: string,
  treasureIds: readonly string[],
): Promise<GiftCardRow[]> {
  const ownership = eq(giftCards.createdByUserId, userId);
  const assigned =
    treasureIds.length > 0 ? inArray(giftCards.treasureId, [...treasureIds]) : undefined;

  return db
    .select()
    .from(giftCards)
    .where(assigned ? or(ownership, assigned) : ownership)
    .orderBy(desc(giftCards.createdAt))
    .limit(200);
}

export async function updateGiftCard(
  giftCardId: string,
  input: {
    status?: GiftCardStatus;
    treasureId?: string | null;
    contributionId?: string | null;
    assignedAt?: number | null;
    printedAt?: number | null;
    redeemedAt?: number | null;
    note?: string | null;
  },
): Promise<void> {
  await db
    .update(giftCards)
    .set({
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.treasureId !== undefined ? { treasureId: input.treasureId } : {}),
      ...(input.contributionId !== undefined ? { contributionId: input.contributionId } : {}),
      ...(input.assignedAt !== undefined ? { assignedAt: input.assignedAt } : {}),
      ...(input.printedAt !== undefined ? { printedAt: input.printedAt } : {}),
      ...(input.redeemedAt !== undefined ? { redeemedAt: input.redeemedAt } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    })
    .where(eq(giftCards.id, giftCardId));
}

/** فقط شماره موبایل دارنده حساب؛ برای پیامک تایید مشارکت. */
export async function findUserPhone(userId: string): Promise<string | null> {
  const rows = await db
    .select({ phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return rows[0]?.phone ?? null;
}
