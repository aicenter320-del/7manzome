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
  GoldCoverEntry,
  GoldCoverSummary,
  AdminTreasureListItem,
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
  editTreasureAsAdmin,
  changeTreasureStatusAsAdmin,
  deleteEmptyTreasureAsAdmin,
  getTotalGoldSavedMg,
  getActiveTreasureCount,
  countTreasuresForChildren,
  listTreasuresForAdmin,
  TreasureAccessError,
  TreasureNotEmptyError,
} from "./service/treasure.service";

export {
  creditGold,
  debitGold,
  TreasureClosedError,
  InsufficientBalanceError,
  type CreditGoldInput,
  type CreditGoldResult,
} from "./service/gold-ledger.service";

export {
  getGoldCoverSummary,
  listGoldCoverEntries,
  recordGoldCoverPurchase,
  GoldCoverValidationError,
} from "./service/gold-cover.service";

export { computeCoverPosition, prepareCoverEntry } from "./domain/gold-cover";

export { createTreasureSchema, setGoalSchema, editTreasureSchema, changeTreasureStatusSchema, recordGoldCoverSchema } from "./schema/treasure.schema";

export {
  createTreasureAction,
  setTreasureGoal,
  updateTreasureAction,
  changeTreasureStatusAction,
  adjustTreasureLedger,
  recordGoldCoverAction,
} from "./actions/treasure.actions";

export { TreasureCard } from "./ui/treasure-card";
export { TreasureProgress } from "./ui/treasure-progress";
export { LedgerList } from "./ui/ledger-list";
export { MilestoneList } from "./ui/milestone-list";
