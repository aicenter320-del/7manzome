import "server-only";

import { recordAudit } from "@/server/audit";
import type { GoldCoverEntryRow } from "@/server/db/types";
import { DISPLAY_KARAT, fromPureMg } from "@/shared/lib/gold";
import { sanitizeText } from "@/shared/lib/persian";
import type { GoldCoverSource, GoldKarat } from "@/shared/types/enums";

import {
  computeCoverPosition,
  prepareCoverEntry,
} from "../domain/gold-cover";
import type { GoldCoverEntry, GoldCoverSummary } from "../domain/types";
import {
  findGoldCoverEntries,
  insertGoldCoverEntry,
  sumCoveredPureMg,
} from "../repo/gold-cover.repo";
import { sumAllGoldSavedMg } from "../repo/treasure.repo";

export { GoldCoverValidationError } from "../domain/gold-cover";

function toCoverEntry(row: GoldCoverEntryRow): GoldCoverEntry {
  return {
    id: row.id,
    amountMg: row.amountMg,
    karat: row.karat,
    pureMg: row.pureMg,
    paidRial: row.paidRial,
    source: row.source,
    note: row.note,
    purchasedAt: row.purchasedAt,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
  };
}

function toDisplayMg(pureMg: number): number {
  return pureMg > 0 ? fromPureMg(pureMg, DISPLAY_KARAT) : 0;
}

export async function getGoldCoverSummary(): Promise<GoldCoverSummary> {
  const [obligationPureMg, coveredPureMg] = await Promise.all([
    sumAllGoldSavedMg(),
    sumCoveredPureMg(),
  ]);

  const position = computeCoverPosition(obligationPureMg, coveredPureMg);

  return {
    ...position,
    obligationMg: toDisplayMg(position.obligationPureMg),
    coveredMg: toDisplayMg(position.coveredPureMg),
    remainingMg: toDisplayMg(position.remainingPureMg),
  };
}

export async function listGoldCoverEntries(limit = 50): Promise<GoldCoverEntry[]> {
  const rows = await findGoldCoverEntries(limit);
  return rows.map(toCoverEntry);
}

export async function recordGoldCoverPurchase(input: {
  actorUserId: string;
  amountMg: number;
  karat: GoldKarat;
  paidRial?: number | null;
  purchasedAt: number;
  note?: string | null;
  source?: GoldCoverSource;
}): Promise<GoldCoverEntry> {
  const prepared = prepareCoverEntry({
    amountMg: input.amountMg,
    karat: input.karat,
    paidRial: input.paidRial ?? null,
    source: input.source ?? "purchase",
    note: input.note ? sanitizeText(input.note, 300) : null,
    purchasedAt: input.purchasedAt,
  });

  const row = await insertGoldCoverEntry({
    amountMg: prepared.amountMg,
    karat: prepared.karat,
    pureMg: prepared.pureMg,
    paidRial: prepared.paidRial ?? null,
    source: prepared.source,
    note: prepared.note ?? null,
    purchasedAt: prepared.purchasedAt,
    createdByUserId: input.actorUserId,
  });

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "gold_cover.recorded",
    entityType: "gold_cover",
    entityId: row.id,
    summary: "ثبت خرید پوشش طلای گنجینه",
    meta: {
      amountMg: prepared.amountMg,
      karat: prepared.karat,
      pureMg: prepared.pureMg,
      source: prepared.source,
    },
  });

  return toCoverEntry(row);
}
