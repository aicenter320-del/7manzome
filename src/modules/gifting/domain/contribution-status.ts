import type { ContributionStatus } from "@/shared/types/enums";

/**
 * ماشین حالت مشارکت.
 *
 * گذارها داده هستند تا هم تست‌پذیر باشند و هم UI فقط دکمه‌های مجاز را بسازد.
 * نمودار: docs/02-domain/state-machines.md
 */

const TRANSITIONS: Record<ContributionStatus, readonly ContributionStatus[]> = {
  draft: ["awaiting_payment"],
  awaiting_payment: ["confirmed", "cancelled", "rejected"],
  confirmed: [],
  rejected: ["awaiting_payment"],
  cancelled: [],
};

export function canTransition(from: ContributionStatus, to: ContributionStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: ContributionStatus): readonly ContributionStatus[] {
  return TRANSITIONS[from];
}

export function isFinalContributionStatus(status: ContributionStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** آیا پیام یادگاری هنوز قابل ویرایش است؟ */
export function canUpdateKeepsake(status: ContributionStatus): boolean {
  return status === "awaiting_payment" || status === "confirmed";
}
