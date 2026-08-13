import "server-only";

import { assertChildAccess, getChildUnchecked } from "@/modules/children";
import { tryGetCurrentGoldPrice } from "@/modules/pricing";
import { recordAudit } from "@/server/audit";
import type { GoldLedgerEntryRow, TreasureRow } from "@/server/db/types";
import { DISPLAY_KARAT, fromPureMg, goldValueRial } from "@/shared/lib/gold";
import { formatAge } from "@/shared/lib/jalali";
import { sanitizeText } from "@/shared/lib/persian";
import type { TreasureKind, TreasureStatus, TreasureVisibility } from "@/shared/types/enums";

import { computeBalance, computeProgress } from "../domain/gold-ledger";
import type {
  GoldBalance,
  LedgerEntry,
  Milestone,
  Treasure,
  TreasureGoal,
  TreasureSummary,
} from "../domain/types";
import {
  countActiveTreasures,
  countContributors,
  findActiveGoal,
  findChildBrief,
  findLedgerEntries,
  findMilestones,
  findPublicTreasures,
  findTreasureById,
  findTreasuresForChild,
  findTreasuresForUser,
  insertGoal,
  insertTreasure,
  sumAllGoldSavedMg,
  sumPureMg,
  updateTreasure,
} from "../repo/treasure.repo";

export class TreasureAccessError extends Error {
  constructor() {
    super("به این گنجینه دسترسی ندارید.");
    this.name = "TreasureAccessError";
  }
}

function toTreasure(row: TreasureRow): Treasure {
  return {
    id: row.id,
    childId: row.childId,
    title: row.title,
    kind: row.kind,
    occasionSlug: row.occasionSlug,
    eventDateAt: row.eventDateAt,
    inviteMessage: row.inviteMessage,
    status: row.status,
    visibility: row.visibility,
    createdByUserId: row.createdByUserId,
    assetOwnerUserId: row.assetOwnerUserId,
    createdAt: row.createdAt,
  };
}

function toLedgerEntry(row: GoldLedgerEntryRow): LedgerEntry {
  return {
    id: row.id,
    treasureId: row.treasureId,
    direction: row.direction,
    amountMg: row.amountMg,
    karat: row.karat,
    pureMg: row.pureMg,
    source: row.source,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    goldPricePerGramRial: row.goldPricePerGramRial,
    valueRial: row.valueRial,
    note: row.note,
    occurredAt: row.occurredAt,
  };
}

/**
 * بررسی دسترسی به گنجینه.
 * دسترسی از طریق کودک تعیین می‌شود: هر سرپرست کودک، گنجینه او را می‌بیند.
 */
export async function assertTreasureAccess(
  treasureId: string,
  userId: string,
  minimum: "viewer" | "editor" | "owner" = "viewer",
): Promise<TreasureRow> {
  const row = await findTreasureById(treasureId);
  if (!row) throw new TreasureAccessError();

  await assertChildAccess(row.childId, userId, minimum);

  return row;
}

/** موجودی گنجینه بر مبنای تجمیع دفتر کل. */
export async function getBalance(treasureId: string): Promise<GoldBalance> {
  const totals = await sumPureMg(treasureId);
  const pureBalanceMg = totals.inPureMg - totals.outPureMg;

  return {
    pureBalanceMg,
    balanceMg: pureBalanceMg > 0 ? fromPureMg(pureBalanceMg, DISPLAY_KARAT) : 0,
    totalInMg: 0,
    totalOutMg: 0,
    entryCount: 0,
    investedRial: totals.investedRial,
  };
}

/** موجودی دقیق از تک‌تک قلم‌ها؛ برای صفحه جزئیات گنجینه. */
export async function getBalanceFromEntries(treasureId: string): Promise<{
  balance: GoldBalance;
  entries: LedgerEntry[];
}> {
  const rows = await findLedgerEntries(treasureId);
  const entries = rows.map(toLedgerEntry);

  return { balance: computeBalance(entries), entries };
}

async function buildSummary(row: TreasureRow): Promise<TreasureSummary | null> {
  const child = await findChildBrief(row.childId);
  if (!child) return null;

  const [balance, goalRow, milestoneRows, contributorCount, price] = await Promise.all([
    getBalance(row.id),
    findActiveGoal(row.id),
    findMilestones(row.id),
    countContributors(row.id),
    tryGetCurrentGoldPrice(DISPLAY_KARAT),
  ]);

  const goal: TreasureGoal | null = goalRow
    ? {
        id: goalRow.id,
        treasureId: goalRow.treasureId,
        targetMg: goalRow.targetMg,
        targetDateAt: goalRow.targetDateAt,
        note: goalRow.note,
        status: goalRow.status,
        achievedAt: goalRow.achievedAt,
      }
    : null;

  const milestones: Milestone[] = milestoneRows.map((item) => ({
    id: item.id,
    treasureId: item.treasureId,
    thresholdMg: item.thresholdMg,
    title: item.title,
    achievedAt: item.achievedAt,
  }));

  return {
    treasure: toTreasure(row),
    child: {
      id: child.id,
      firstName: child.firstName,
      displayName: [child.firstName, child.lastName].filter(Boolean).join(" ").trim(),
      ageLabel: formatAge(child.birthDateAt),
      avatarFileId: child.avatarFileId,
    },
    balance,
    currentValueRial: price
      ? goldValueRial(balance.balanceMg, price.pricePerGramRial)
      : null,
    goal,
    progressPercent: computeProgress(balance.balanceMg, goal?.targetMg ?? null),
    milestones,
    contributorCount,
  };
}

export async function getTreasureSummary(
  treasureId: string,
  userId: string,
): Promise<TreasureSummary | null> {
  const row = await assertTreasureAccess(treasureId, userId);
  return buildSummary(row);
}

/** نمای گنجینه بدون بررسی دسترسی؛ فقط برای صفحه عمومی هدیه و پنل ادمین. */
export async function getTreasureSummaryUnchecked(
  treasureId: string,
): Promise<TreasureSummary | null> {
  const row = await findTreasureById(treasureId);
  return row ? buildSummary(row) : null;
}

export async function getTreasuresForUser(userId: string): Promise<TreasureSummary[]> {
  const rows = await findTreasuresForUser(userId, { statuses: ["active", "closed"] });

  const summaries = await Promise.all(rows.map(buildSummary));
  return summaries.filter((item): item is TreasureSummary => item !== null);
}

export async function getTreasuresForChild(
  childId: string,
  userId: string,
): Promise<TreasureSummary[]> {
  await assertChildAccess(childId, userId);

  const rows = await findTreasuresForChild(childId);
  const summaries = await Promise.all(rows.map(buildSummary));

  return summaries.filter((item): item is TreasureSummary => item !== null);
}

/** گنجینه‌های عمومی برای صفحه «گنجینه‌ها»؛ فقط آن‌هایی که والد لینک عمومی داده. */
export async function getPublicTreasures(limit = 12): Promise<TreasureSummary[]> {
  const rows = await findPublicTreasures(limit);
  const summaries = await Promise.all(rows.map(buildSummary));

  return summaries.filter((item): item is TreasureSummary => item !== null);
}

export async function getLedger(
  treasureId: string,
  userId: string,
): Promise<LedgerEntry[]> {
  await assertTreasureAccess(treasureId, userId);

  const rows = await findLedgerEntries(treasureId);
  return rows.map(toLedgerEntry);
}

export async function createTreasure(input: {
  childId: string;
  userId: string;
  title: string;
  kind: TreasureKind;
  occasionSlug?: string;
  eventDateAt?: number;
  inviteMessage?: string;
  visibility?: TreasureVisibility;
  targetMg?: number;
  targetDateAt?: number;
}): Promise<Treasure> {
  await assertChildAccess(input.childId, input.userId, "editor");

  const child = await getChildUnchecked(input.childId);
  if (!child) throw new TreasureAccessError();

  const row = await insertTreasure({
    childId: input.childId,
    title: sanitizeText(input.title, 120),
    kind: input.kind,
    occasionSlug: input.occasionSlug ?? null,
    eventDateAt: input.eventDateAt ?? null,
    inviteMessage: input.inviteMessage ? sanitizeText(input.inviteMessage, 500) : null,
    visibility: input.visibility ?? "private",
    createdByUserId: input.userId,
    // در MVP مالک دارایی همیشه دارنده حساب بزرگسال است (ADR-0006).
    assetOwnerUserId: child.ownerUserId,
  });

  if (input.targetMg && input.targetMg > 0) {
    await insertGoal({
      treasureId: row.id,
      targetMg: input.targetMg,
      targetDateAt: input.targetDateAt ?? null,
      createdByUserId: input.userId,
    });
  }

  await recordAudit({
    actorUserId: input.userId,
    actorRole: "customer",
    action: "treasure.created",
    entityType: "treasure",
    entityId: row.id,
    summary: `ساخت گنجینه «${row.title}»`,
  });

  return toTreasure(row);
}

export async function setGoal(input: {
  treasureId: string;
  userId: string;
  targetMg: number;
  targetDateAt?: number;
  note?: string;
}): Promise<TreasureGoal> {
  await assertTreasureAccess(input.treasureId, input.userId, "editor");

  const row = await insertGoal({
    treasureId: input.treasureId,
    targetMg: input.targetMg,
    targetDateAt: input.targetDateAt ?? null,
    note: input.note ? sanitizeText(input.note, 200) : null,
    createdByUserId: input.userId,
  });

  return {
    id: row.id,
    treasureId: row.treasureId,
    targetMg: row.targetMg,
    targetDateAt: row.targetDateAt,
    note: row.note,
    status: row.status,
    achievedAt: row.achievedAt,
  };
}

export async function editTreasure(input: {
  treasureId: string;
  userId: string;
  title?: string;
  inviteMessage?: string | null;
  visibility?: TreasureVisibility;
}): Promise<void> {
  await assertTreasureAccess(input.treasureId, input.userId, "editor");

  await updateTreasure(input.treasureId, {
    ...(input.title !== undefined ? { title: sanitizeText(input.title, 120) } : {}),
    ...(input.inviteMessage !== undefined
      ? { inviteMessage: input.inviteMessage ? sanitizeText(input.inviteMessage, 500) : null }
      : {}),
    ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
  });
}

export async function changeTreasureStatus(input: {
  treasureId: string;
  userId: string;
  status: TreasureStatus;
}): Promise<void> {
  await assertTreasureAccess(input.treasureId, input.userId, "owner");

  await updateTreasure(input.treasureId, {
    status: input.status,
    closedAt: input.status === "closed" ? Date.now() : null,
  });

  await recordAudit({
    actorUserId: input.userId,
    actorRole: "customer",
    action: `treasure.${input.status}`,
    entityType: "treasure",
    entityId: input.treasureId,
    summary: `تغییر وضعیت گنجینه به ${input.status}`,
  });
}

/** معیار شمال محصول: کل طلای ذخیره‌شده برای کودکان. */
export async function getTotalGoldSavedMg(): Promise<number> {
  const pure = await sumAllGoldSavedMg();
  return pure > 0 ? fromPureMg(pure, DISPLAY_KARAT) : 0;
}

export async function getActiveTreasureCount(): Promise<number> {
  return countActiveTreasures();
}
