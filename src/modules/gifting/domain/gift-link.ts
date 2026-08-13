import type { GiftLinkStatus } from "@/shared/types/enums";

/**
 * قواعد خالص لینک هدیه و مبلغ مشارکت.
 *
 * تولید توکن اینجا نیست؛ domain نباید به crypto وابسته باشد.
 * توکن در سرویس با generateToken ساخته می‌شود.
 */

const GIFT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export const ANONYMOUS_DISPLAY_NAME = "یک دوست";

/** آیا رشته شبیه توکن لینک هدیه است؟ */
export function isGiftTokenFormat(token: string): boolean {
  return GIFT_TOKEN_PATTERN.test(token);
}

/**
 * آیا لینک در این لحظه مشارکت می‌پذیرد؟
 * فقط وضعیت active و تاریخ انقضای نگذشته.
 */
export function isLinkAccepting(
  status: GiftLinkStatus,
  expiresAt: number | null,
  now: number,
): boolean {
  if (status !== "active") return false;
  if (expiresAt !== null && expiresAt <= now) return false;
  return true;
}

export type AmountValidation =
  | { ok: true }
  | { ok: false; error: string };

/** حداقل مبلغ از تنظیمات می‌آید؛ صفر یا منفی همیشه رد است. */
export function validateContributionAmount(
  amountRial: number,
  minRial: number,
): AmountValidation {
  if (!Number.isInteger(amountRial) || amountRial <= 0) {
    return { ok: false, error: "مبلغ مشارکت باید بزرگ‌تر از صفر باشد." };
  }

  if (amountRial < minRial) {
    return { ok: false, error: "مبلغ مشارکت از حداقل مجاز کمتر است." };
  }

  return { ok: true };
}

/** نام هدیه‌دهنده برای مهمان‌های دیگر؛ ناشناس همیشه «یک دوست» است. */
export function maskContributorName(name: string, isAnonymous: boolean): string {
  return isAnonymous ? ANONYMOUS_DISPLAY_NAME : name;
}

/** نشانی عمومی صفحه هدیه. */
export function buildGiftUrl(appUrl: string, token: string): string {
  const base = appUrl.replace(/\/+$/, "");
  return `${base}/g/${token}`;
}
