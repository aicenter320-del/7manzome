import { toPureMg } from "@/shared/lib/gold";
import { assertNonNegativeInteger } from "@/shared/lib/math";
import type { GoldCoverSource, GoldKarat } from "@/shared/types/enums";

/**
 * پوشش طلای گنجینه.
 *
 * جدا از دفتر کل کودک و جدا از موجودی ویترین. تعهد از جمع `pureMg`
 * دفتر کل است؛ پوشش از جمع خریدهای ثبت‌شدهٔ فروشگاه. (ADR-0015)
 */

export class GoldCoverValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoldCoverValidationError";
  }
}

export interface GoldCoverDraft {
  amountMg: number;
  karat: GoldKarat;
  paidRial?: number | null;
  source: GoldCoverSource;
  note?: string | null;
  purchasedAt: number;
}

export interface GoldCoverPosition {
  obligationPureMg: number;
  coveredPureMg: number;
  remainingPureMg: number;
  surplusPureMg: number;
}

/**
 * اعتبارسنجی خرید پوشش پیش از درج.
 * `pureMg` اینجا محاسبه می‌شود تا هرگز فراموش نشود.
 */
export function prepareCoverEntry(
  draft: GoldCoverDraft,
): GoldCoverDraft & { pureMg: number } {
  if (draft.amountMg <= 0) {
    throw new GoldCoverValidationError("وزن طلا باید بزرگ‌تر از صفر باشد.");
  }

  assertNonNegativeInteger(draft.amountMg, "وزن طلا");

  if (draft.paidRial != null) {
    if (draft.paidRial < 0) {
      throw new GoldCoverValidationError("مبلغ پرداختی نمی‌تواند منفی باشد.");
    }
    assertNonNegativeInteger(draft.paidRial, "مبلغ پرداختی");
  }

  if (!Number.isInteger(draft.purchasedAt) || draft.purchasedAt <= 0) {
    throw new GoldCoverValidationError("تاریخ خرید نامعتبر است.");
  }

  return {
    ...draft,
    paidRial: draft.paidRial ?? null,
    note: draft.note ?? null,
    pureMg: toPureMg(draft.amountMg, draft.karat),
  };
}

/**
 * موقعیت پوشش: باقیمانده هرگز منفی نیست؛ خرید بیشتر از تعهد ذخیره است.
 */
export function computeCoverPosition(
  obligationPureMg: number,
  coveredPureMg: number,
): GoldCoverPosition {
  assertNonNegativeInteger(obligationPureMg, "تعهد پوشش");
  assertNonNegativeInteger(coveredPureMg, "پوشش ثبت‌شده");

  return {
    obligationPureMg,
    coveredPureMg,
    remainingPureMg: Math.max(0, obligationPureMg - coveredPureMg),
    surplusPureMg: Math.max(0, coveredPureMg - obligationPureMg),
  };
}
