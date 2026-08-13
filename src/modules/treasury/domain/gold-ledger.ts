import { DISPLAY_KARAT, fromPureMg, progressPercent, toPureMg } from "@/shared/lib/gold";
import { assertNonNegativeInteger } from "@/shared/lib/math";
import type { GoldKarat, LedgerDirection, LedgerSource } from "@/shared/types/enums";

import type { GoldBalance, LedgerEntry } from "./types";

/**
 * منطق دفتر کل طلا.
 *
 * ⚠️ قانون بنیادی: دفتر کل append-only است. هیچ‌جا موجودی ذخیره نمی‌شود؛
 * همیشه از جمع قلم‌ها محاسبه می‌گردد. اصلاح خطا = قلم جدید با
 * source = 'correction'. دلیل کامل در ADR-0005.
 *
 * این فایل خالص و بدون دیتابیس است تا با تست واحد کامل پوشش داده شود.
 */

/** ورودی ساخت یک قلم دفتر کل. */
export interface LedgerEntryDraft {
  treasureId: string;
  direction: LedgerDirection;
  amountMg: number;
  karat: GoldKarat;
  source: LedgerSource;
  referenceType: string;
  referenceId: string;
  goldPricePerGramRial: number;
  valueRial: number;
  note?: string | null;
  occurredAt?: number;
}

export class LedgerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerValidationError";
  }
}

/**
 * اعتبارسنجی و تکمیل یک قلم پیش از درج.
 * pureMg اینجا محاسبه می‌شود تا هرگز فراموش نشود.
 */
export function prepareEntry(
  draft: LedgerEntryDraft,
  nowMs: number = Date.now(),
): LedgerEntryDraft & { pureMg: number; occurredAt: number } {
  if (draft.amountMg <= 0) {
    throw new LedgerValidationError("مقدار طلا باید بزرگ‌تر از صفر باشد.");
  }

  assertNonNegativeInteger(draft.amountMg, "مقدار طلا");
  assertNonNegativeInteger(draft.valueRial, "ارزش ریالی");

  // قلم بی‌منشأ ممنوع است؛ بدون این، ردیابی موجودی غیرممکن می‌شود.
  if (!draft.referenceType.trim() || !draft.referenceId.trim()) {
    throw new LedgerValidationError("هر قلم دفتر کل باید منشأ مشخص داشته باشد.");
  }

  return {
    ...draft,
    pureMg: toPureMg(draft.amountMg, draft.karat),
    occurredAt: draft.occurredAt ?? nowMs,
  };
}

/**
 * محاسبه موجودی از قلم‌های دفتر کل.
 *
 * جمع روی pureMg انجام می‌شود چون عیارهای مختلف مستقیماً جمع‌پذیر نیستند،
 * سپس نتیجه به عیار نمایشی برگردانده می‌شود.
 */
export function computeBalance(entries: readonly LedgerEntry[]): GoldBalance {
  let pureIn = 0;
  let pureOut = 0;
  let totalInMg = 0;
  let totalOutMg = 0;
  let investedRial = 0;

  for (const entry of entries) {
    if (entry.direction === "in") {
      pureIn += entry.pureMg;
      totalInMg += entry.amountMg;
      investedRial += entry.valueRial;
    } else {
      pureOut += entry.pureMg;
      totalOutMg += entry.amountMg;
    }
  }

  const pureBalanceMg = pureIn - pureOut;

  return {
    pureBalanceMg,
    balanceMg: pureBalanceMg > 0 ? fromPureMg(pureBalanceMg, DISPLAY_KARAT) : 0,
    totalInMg,
    totalOutMg,
    entryCount: entries.length,
    investedRial,
  };
}

/** آیا برداشت این مقدار ممکن است؟ موجودی منفی ممنوع است. */
export function canDebit(balance: GoldBalance, amountMg: number, karat: GoldKarat): boolean {
  return balance.pureBalanceMg >= toPureMg(amountMg, karat);
}

/**
 * نقاط عطف جدیدی که با رسیدن به این موجودی کسب می‌شوند.
 *
 * آستانه‌ها از تنظیمات می‌آیند تا بدون تغییر کد قابل تنظیم باشند.
 */
export function detectMilestones(input: {
  previousBalanceMg: number;
  newBalanceMg: number;
  thresholdsMg: readonly number[];
  alreadyAchievedMg: readonly number[];
}): number[] {
  const achieved = new Set(input.alreadyAchievedMg);

  return input.thresholdsMg
    .filter(
      (threshold) =>
        !achieved.has(threshold) &&
        input.previousBalanceMg < threshold &&
        input.newBalanceMg >= threshold,
    )
    .sort((a, b) => a - b);
}

/** عنوان فارسی نقطه عطف بر اساس آستانه. */
export function milestoneTitle(thresholdMg: number): string {
  const titles: Record<number, string> = {
    100: "اولین قدم",
    500: "اولین سکه",
    1_000: "اولین گرم",
    3_000: "گنج کوچک",
    5_000: "نیمه راه",
    10_000: "گنجینه بزرگ",
  };

  if (titles[thresholdMg]) return titles[thresholdMg];

  const gram = thresholdMg / 1_000;
  return `رسیدن به ${gram} گرم`;
}

/** درصد پیشرفت به سمت هدف. */
export function computeProgress(balanceMg: number, targetMg: number | null): number {
  if (targetMg === null) return 0;
  return progressPercent(balanceMg, targetMg);
}

/**
 * تخمین زمان رسیدن به هدف با آهنگ ماهانه مشخص.
 *
 * بند ۲۷ سند محصول: «اگر هر ماه ۰.۲۵ گرم اضافه کنید...». null یعنی
 * با این آهنگ هرگز نمی‌رسد یا هدف قبلاً محقق شده.
 */
export function monthsToGoal(
  balanceMg: number,
  targetMg: number,
  monthlyMg: number,
): number | null {
  if (balanceMg >= targetMg) return 0;
  if (monthlyMg <= 0) return null;

  return Math.ceil((targetMg - balanceMg) / monthlyMg);
}

/** مقدار ماهانه لازم برای رسیدن به هدف تا تاریخ مشخص. */
export function requiredMonthlyMg(
  balanceMg: number,
  targetMg: number,
  monthsRemaining: number,
): number {
  if (balanceMg >= targetMg) return 0;
  if (monthsRemaining <= 0) return targetMg - balanceMg;

  return Math.ceil((targetMg - balanceMg) / monthsRemaining);
}

/**
 * سود یا زیان سرمایه به ریال.
 * مبلغ سرمایه‌گذاری‌شده از قلم‌های ورودی می‌آید و ارزش امروز با قیمت جاری.
 */
export function unrealizedGainRial(
  balance: GoldBalance,
  currentValueRial: number,
): number {
  return currentValueRial - balance.investedRial;
}
