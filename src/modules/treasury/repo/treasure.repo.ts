import "server-only";

import { and, asc, count, countDistinct, desc, eq, inArray, max, sum } from "drizzle-orm";

import { db, type Database } from "@/server/db";
import {
  children,
  contributions,
  goldLedgerEntries,
  treasureGoals,
  treasureMilestones,
  treasures,
  users,
} from "@/server/db/schema";
import type {
  GoldLedgerEntryRow,
  TreasureGoalRow,
  TreasureMilestoneRow,
  TreasureRow,
} from "@/server/db/types";
import type { TreasureKind, TreasureStatus, TreasureVisibility } from "@/shared/types/enums";

import type { LedgerEntryDraft } from "../domain/gold-ledger";

/** تراکنش Drizzle؛ برای عملیاتی که باید اتمیک باشند. */
export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

export async function findTreasureById(treasureId: string): Promise<TreasureRow | null> {
  const rows = await db.select().from(treasures).where(eq(treasures.id, treasureId)).limit(1);
  return rows[0] ?? null;
}

export async function findTreasuresForChild(childId: string): Promise<TreasureRow[]> {
  return db
    .select()
    .from(treasures)
    .where(eq(treasures.childId, childId))
    .orderBy(desc(treasures.createdAt));
}

/** گنجینه‌های کاربر؛ هم آن‌هایی که ساخته و هم آن‌هایی که مالک دارایی است. */
export async function findTreasuresForUser(
  userId: string,
  options?: { statuses?: readonly TreasureStatus[] },
): Promise<TreasureRow[]> {
  const conditions = [eq(treasures.assetOwnerUserId, userId)];

  if (options?.statuses?.length) {
    conditions.push(inArray(treasures.status, [...options.statuses]));
  }

  return db
    .select()
    .from(treasures)
    .where(and(...conditions))
    .orderBy(desc(treasures.createdAt));
}

export async function findPublicTreasures(limit = 12): Promise<TreasureRow[]> {
  return db
    .select()
    .from(treasures)
    .where(and(eq(treasures.visibility, "link"), eq(treasures.status, "active")))
    .orderBy(desc(treasures.createdAt))
    .limit(limit);
}

export async function insertTreasure(input: {
  childId: string;
  title: string;
  kind: TreasureKind;
  occasionSlug?: string | null;
  eventDateAt?: number | null;
  inviteMessage?: string | null;
  visibility: TreasureVisibility;
  createdByUserId: string;
  assetOwnerUserId: string;
}): Promise<TreasureRow> {
  const [row] = await db
    .insert(treasures)
    .values({
      childId: input.childId,
      title: input.title,
      kind: input.kind,
      occasionSlug: input.occasionSlug ?? null,
      eventDateAt: input.eventDateAt ?? null,
      inviteMessage: input.inviteMessage ?? null,
      visibility: input.visibility,
      createdByUserId: input.createdByUserId,
      assetOwnerUserId: input.assetOwnerUserId,
    })
    .returning();

  if (!row) throw new Error("ساخت گنجینه شکست خورد.");

  return row;
}

export async function updateTreasure(
  treasureId: string,
  input: {
    title?: string;
    inviteMessage?: string | null;
    visibility?: TreasureVisibility;
    status?: TreasureStatus;
    closedAt?: number | null;
  },
): Promise<void> {
  await db
    .update(treasures)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.inviteMessage !== undefined ? { inviteMessage: input.inviteMessage } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.closedAt !== undefined ? { closedAt: input.closedAt } : {}),
    })
    .where(eq(treasures.id, treasureId));
}

export async function countActiveTreasures(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(treasures)
    .where(eq(treasures.status, "active"));

  return rows[0]?.value ?? 0;
}

export async function countTreasuresByChildIds(
  childIds: readonly string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (childIds.length === 0) return counts;

  const rows = await db
    .select({ childId: treasures.childId, value: count() })
    .from(treasures)
    .where(inArray(treasures.childId, [...childIds]))
    .groupBy(treasures.childId);

  for (const row of rows) {
    counts.set(row.childId, row.value);
  }

  return counts;
}

export async function findActiveTreasuresForAdmin(limit = 100): Promise<
  Array<{
    treasure: TreasureRow;
    childFirstName: string;
    ownerUserId: string;
    ownerFirstName: string | null;
    ownerLastName: string | null;
    ownerPhone: string;
  }>
> {
  return db
    .select({
      treasure: treasures,
      childFirstName: children.firstName,
      ownerUserId: users.id,
      ownerFirstName: users.firstName,
      ownerLastName: users.lastName,
      ownerPhone: users.phone,
    })
    .from(treasures)
    .innerJoin(children, eq(treasures.childId, children.id))
    .innerJoin(users, eq(treasures.assetOwnerUserId, users.id))
    .where(eq(treasures.status, "active"))
    .orderBy(desc(treasures.createdAt))
    .limit(limit);
}

export async function findLastConfirmedContributionAt(
  treasureIds: readonly string[],
): Promise<Map<string, number>> {
  const lastAt = new Map<string, number>();
  if (treasureIds.length === 0) return lastAt;

  const rows = await db
    .select({
      treasureId: contributions.treasureId,
      lastAt: max(contributions.confirmedAt),
    })
    .from(contributions)
    .where(
      and(
        inArray(contributions.treasureId, [...treasureIds]),
        eq(contributions.status, "confirmed"),
      ),
    )
    .groupBy(contributions.treasureId);

  for (const row of rows) {
    if (row.lastAt != null) lastAt.set(row.treasureId, Number(row.lastAt));
  }

  return lastAt;
}

// ------------------------------------------------------------------
// دفتر کل — فقط INSERT و SELECT
// ------------------------------------------------------------------

/**
 * درج قلم دفتر کل.
 *
 * ⚠️ این جدول append-only است؛ هیچ تابع update یا delete برای آن وجود ندارد
 * و نباید ساخته شود. اصلاح = قلم جدید با source = 'correction'.
 */
export async function insertLedgerEntry(
  entry: LedgerEntryDraft & { pureMg: number; occurredAt: number },
  options?: { tx?: Tx; createdByUserId?: string | null },
): Promise<GoldLedgerEntryRow> {
  const executor = options?.tx ?? db;

  const [row] = await executor
    .insert(goldLedgerEntries)
    .values({
      treasureId: entry.treasureId,
      direction: entry.direction,
      amountMg: entry.amountMg,
      karat: entry.karat,
      pureMg: entry.pureMg,
      source: entry.source,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
      goldPricePerGramRial: entry.goldPricePerGramRial,
      valueRial: entry.valueRial,
      note: entry.note ?? null,
      createdByUserId: options?.createdByUserId ?? null,
      occurredAt: entry.occurredAt,
    })
    .returning();

  if (!row) throw new Error("ثبت قلم دفتر کل شکست خورد.");

  return row;
}

export async function findLedgerEntries(
  treasureId: string,
  options?: { limit?: number },
): Promise<GoldLedgerEntryRow[]> {
  return db
    .select()
    .from(goldLedgerEntries)
    .where(eq(goldLedgerEntries.treasureId, treasureId))
    .orderBy(desc(goldLedgerEntries.occurredAt))
    .limit(options?.limit ?? 500);
}

/**
 * موجودی خالص طلای خالص با یک کوئری تجمیعی.
 * برای صفحاتی که فهرست گنجینه‌ها را نشان می‌دهند و نیازی به تک‌تک قلم‌ها ندارند.
 */
export async function sumPureMg(
  treasureId: string,
): Promise<{ inPureMg: number; outPureMg: number; investedRial: number }> {
  const rows = await db
    .select({
      direction: goldLedgerEntries.direction,
      pure: sum(goldLedgerEntries.pureMg),
      value: sum(goldLedgerEntries.valueRial),
    })
    .from(goldLedgerEntries)
    .where(eq(goldLedgerEntries.treasureId, treasureId))
    .groupBy(goldLedgerEntries.direction);

  let inPureMg = 0;
  let outPureMg = 0;
  let investedRial = 0;

  for (const row of rows) {
    const pure = Number(row.pure ?? 0);
    if (row.direction === "in") {
      inPureMg = pure;
      investedRial = Number(row.value ?? 0);
    } else {
      outPureMg = pure;
    }
  }

  return { inPureMg, outPureMg, investedRial };
}

/** جمع کل طلای ذخیره‌شده برای همه کودکان؛ معیار شمال محصول. */
export async function sumAllGoldSavedMg(): Promise<number> {
  const rows = await db
    .select({ direction: goldLedgerEntries.direction, pure: sum(goldLedgerEntries.pureMg) })
    .from(goldLedgerEntries)
    .groupBy(goldLedgerEntries.direction);

  let total = 0;
  for (const row of rows) {
    const pure = Number(row.pure ?? 0);
    total += row.direction === "in" ? pure : -pure;
  }

  return Math.max(0, total);
}

/** تعداد هدیه‌دهندگان یگانه یک گنجینه. */
export async function countContributors(treasureId: string): Promise<number> {
  const rows = await db
    .select({ value: countDistinct(contributions.contributorName) })
    .from(contributions)
    .where(
      and(eq(contributions.treasureId, treasureId), eq(contributions.status, "confirmed")),
    );

  return rows[0]?.value ?? 0;
}

export async function countAllContributions(treasureId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(contributions)
    .where(eq(contributions.treasureId, treasureId));

  return rows[0]?.value ?? 0;
}

export async function deleteTreasure(treasureId: string): Promise<void> {
  await db.delete(treasures).where(eq(treasures.id, treasureId));
}

// ------------------------------------------------------------------
// هدف و نقطه عطف
// ------------------------------------------------------------------

export async function findActiveGoal(treasureId: string): Promise<TreasureGoalRow | null> {
  const rows = await db
    .select()
    .from(treasureGoals)
    .where(and(eq(treasureGoals.treasureId, treasureId), eq(treasureGoals.status, "active")))
    .orderBy(desc(treasureGoals.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertGoal(input: {
  treasureId: string;
  targetMg: number;
  targetDateAt?: number | null;
  note?: string | null;
  createdByUserId: string;
}): Promise<TreasureGoalRow> {
  // هدف قبلی لغو می‌شود تا همیشه حداکثر یک هدف فعال داشته باشیم.
  await db
    .update(treasureGoals)
    .set({ status: "cancelled" })
    .where(and(eq(treasureGoals.treasureId, input.treasureId), eq(treasureGoals.status, "active")));

  const [row] = await db
    .insert(treasureGoals)
    .values({
      treasureId: input.treasureId,
      targetMg: input.targetMg,
      targetDateAt: input.targetDateAt ?? null,
      note: input.note ?? null,
      createdByUserId: input.createdByUserId,
    })
    .returning();

  if (!row) throw new Error("ثبت هدف گنجینه شکست خورد.");

  return row;
}

export async function markGoalAchieved(goalId: string, tx?: Tx): Promise<void> {
  const executor = tx ?? db;

  await executor
    .update(treasureGoals)
    .set({ status: "achieved", achievedAt: Date.now() })
    .where(eq(treasureGoals.id, goalId));
}

export async function findMilestones(treasureId: string): Promise<TreasureMilestoneRow[]> {
  return db
    .select()
    .from(treasureMilestones)
    .where(eq(treasureMilestones.treasureId, treasureId))
    .orderBy(asc(treasureMilestones.thresholdMg));
}

export async function insertMilestones(
  rows: ReadonlyArray<{
    treasureId: string;
    thresholdMg: number;
    title: string;
    ledgerEntryId?: string | null;
  }>,
  tx?: Tx,
): Promise<void> {
  if (rows.length === 0) return;

  const executor = tx ?? db;

  await executor
    .insert(treasureMilestones)
    .values(
      rows.map((row) => ({
        treasureId: row.treasureId,
        thresholdMg: row.thresholdMg,
        title: row.title,
        ledgerEntryId: row.ledgerEntryId ?? null,
        achievedAt: Date.now(),
      })),
    )
    .onConflictDoNothing();
}

/** اطلاعات کودک برای ساخت نمای گنجینه. */
export async function findChildBrief(childId: string): Promise<{
  id: string;
  firstName: string;
  lastName: string | null;
  birthDateAt: number;
  avatarFileId: string | null;
} | null> {
  const rows = await db
    .select({
      id: children.id,
      firstName: children.firstName,
      lastName: children.lastName,
      birthDateAt: children.birthDateAt,
      avatarFileId: children.avatarFileId,
    })
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);

  return rows[0] ?? null;
}
