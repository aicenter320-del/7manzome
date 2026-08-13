import type {
  GoalStatus,
  GoldKarat,
  LedgerDirection,
  LedgerSource,
  TreasureKind,
  TreasureStatus,
  TreasureVisibility,
} from "@/shared/types/enums";

export interface Treasure {
  id: string;
  childId: string;
  title: string;
  kind: TreasureKind;
  occasionSlug: string | null;
  eventDateAt: number | null;
  inviteMessage: string | null;
  status: TreasureStatus;
  visibility: TreasureVisibility;
  createdByUserId: string;
  assetOwnerUserId: string;
  createdAt: number;
}

export interface LedgerEntry {
  id: string;
  treasureId: string;
  direction: LedgerDirection;
  amountMg: number;
  karat: GoldKarat;
  pureMg: number;
  source: LedgerSource;
  referenceType: string;
  referenceId: string;
  goldPricePerGramRial: number;
  valueRial: number;
  note: string | null;
  occurredAt: number;
}

/** موجودی محاسبه‌شده از دفتر کل. هرگز ذخیره نمی‌شود. */
export interface GoldBalance {
  /** موجودی به عیار نمایشی (۱۸). */
  balanceMg: number;
  /** موجودی معادل طلای خالص؛ مبنای جمع دقیق. */
  pureBalanceMg: number;
  totalInMg: number;
  totalOutMg: number;
  entryCount: number;
  /** جمع مبالغ ریالی ورودی؛ برای محاسبه سود سرمایه. */
  investedRial: number;
}

export interface TreasureGoal {
  id: string;
  treasureId: string;
  targetMg: number;
  targetDateAt: number | null;
  note: string | null;
  status: GoalStatus;
  achievedAt: number | null;
}

export interface Milestone {
  id: string;
  treasureId: string;
  thresholdMg: number;
  title: string;
  achievedAt: number;
}

/** نمای کامل گنجینه برای داشبورد. */
export interface TreasureSummary {
  treasure: Treasure;
  child: {
    id: string;
    firstName: string;
    displayName: string;
    ageLabel: string;
    avatarFileId: string | null;
  };
  balance: GoldBalance;
  /** ارزش امروز موجودی به ریال؛ null اگر قیمت طلا موجود نباشد. */
  currentValueRial: number | null;
  goal: TreasureGoal | null;
  progressPercent: number;
  milestones: Milestone[];
  contributorCount: number;
}
