/**
 * ماژول گنجینه — API عمومی.
 *
 * قلب محصول. مسئول: گنجینه کودک، دفتر کل طلای append-only، اهداف و نقاط عطف.
 *
 * ⚠️ برای تغییر موجودی فقط از creditGold و debitGold استفاده کنید.
 * نوشتن مستقیم در جدول دفتر کل ممنوع است (ADR-0005).
 *
 * مستندات: docs/03-modules/treasury.md
 */

export type {
  Treasure,
  TreasureSummary,
  TreasureGoal,
  LedgerEntry,
  GoldBalance,
  Milestone,
} from "./domain/types";

export {
  computeBalance,
  computeProgress,
  detectMilestones,
  milestoneTitle,
  monthsToGoal,
  requiredMonthlyMg,
  unrealizedGainRial,
  canDebit,
  prepareEntry,
  LedgerValidationError,
} from "./domain/gold-ledger";

export {
  assertTreasureAccess,
  getBalance,
  getBalanceFromEntries,
  getTreasureSummary,
  getTreasureSummaryUnchecked,
  getTreasuresForUser,
  getTreasuresForChild,
  getPublicTreasures,
  getLedger,
  createTreasure,
  setGoal,
  editTreasure,
  changeTreasureStatus,
  getTotalGoldSavedMg,
  getActiveTreasureCount,
  TreasureAccessError,
} from "./service/treasure.service";

export {
  creditGold,
  debitGold,
  TreasureClosedError,
  InsufficientBalanceError,
  type CreditGoldInput,
  type CreditGoldResult,
} from "./service/gold-ledger.service";

export { createTreasureSchema, setGoalSchema } from "./schema/treasure.schema";

export {
  createTreasureAction,
  setTreasureGoal,
  updateTreasureAction,
  changeTreasureStatusAction,
  adjustTreasureLedger,
} from "./actions/treasure.actions";

export { TreasureCard } from "./ui/treasure-card";
export { TreasureProgress } from "./ui/treasure-progress";
export { LedgerList } from "./ui/ledger-list";
export { MilestoneList } from "./ui/milestone-list";
