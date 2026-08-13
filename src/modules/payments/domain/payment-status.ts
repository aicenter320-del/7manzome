import type { PaymentStatus } from "@/shared/types/enums";

/**
 * ماشین حالت پرداخت کارت‌به‌کارت.
 *
 * گذارها به‌صورت داده تعریف شده‌اند تا هم قابل تست باشند و هم در UI برای
 * ساخت دکمه‌های مجاز استفاده شوند. نمودار در docs/02-domain/state-machines.md
 */

const TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  awaiting_transfer: ["receipt_submitted", "expired"],
  receipt_submitted: ["under_review", "expired"],
  under_review: ["confirmed", "rejected"],
  rejected: ["receipt_submitted"],
  confirmed: [],
  expired: [],
};

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: PaymentStatus): readonly PaymentStatus[] {
  return TRANSITIONS[from];
}

export function isFinalStatus(status: PaymentStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** وضعیت‌هایی که در صف تایید ادمین دیده می‌شوند. */
export const REVIEW_QUEUE_STATUSES: readonly PaymentStatus[] = [
  "receipt_submitted",
  "under_review",
];

/** آیا این پرداخت قابل بررسی توسط ادمین است؟ */
export function canReview(status: PaymentStatus): boolean {
  return REVIEW_QUEUE_STATUSES.includes(status);
}

/** آیا کاربر می‌تواند رسید (جدید) ارسال کند؟ */
export function canSubmitReceipt(status: PaymentStatus): boolean {
  return status === "awaiting_transfer" || status === "rejected";
}

export interface AmountMatch {
  matches: boolean;
  differenceRial: number;
  /** پیام هشدار برای ادمین؛ null یعنی مبلغ درست است. */
  warning: string | null;
}

/**
 * تطبیق مبلغ اعلامی کاربر با مبلغ پرداخت.
 *
 * اختلاف باعث رد خودکار نمی‌شود؛ فقط هشدار می‌دهد. تصمیم نهایی با ادمین است
 * چون ممکن است دلیل موجهی داشته باشد (docs/03-modules/payments.md).
 */
export function validateReceiptAmount(
  expectedRial: number,
  declaredRial: number,
): AmountMatch {
  const differenceRial = declaredRial - expectedRial;

  if (differenceRial === 0) {
    return { matches: true, differenceRial: 0, warning: null };
  }

  return {
    matches: false,
    differenceRial,
    warning:
      differenceRial > 0
        ? "مبلغ اعلامی بیشتر از مبلغ پرداخت است."
        : "مبلغ اعلامی کمتر از مبلغ پرداخت است.",
  };
}

/** آیا مهلت پرداخت گذشته است؟ */
export function isExpired(
  expiresAt: number | null,
  nowMs: number = Date.now(),
): boolean {
  return expiresAt !== null && expiresAt <= nowMs;
}

/** ساعت باقی‌مانده تا انقضای مهلت پرداخت. */
export function hoursRemaining(
  expiresAt: number | null,
  nowMs: number = Date.now(),
): number | null {
  if (expiresAt === null) return null;

  const remaining = expiresAt - nowMs;
  return remaining > 0 ? Math.ceil(remaining / 3_600_000) : 0;
}

/** ساخت شماره پرداخت قابل‌نمایش: PM-1404-000123 */
export function buildPaymentNumber(jalaliYear: number, sequence: number): string {
  return `PM-${jalaliYear}-${String(sequence).padStart(6, "0")}`;
}
