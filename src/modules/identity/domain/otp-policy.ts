/**
 * سیاست کد یک‌بارمصرف.
 *
 * منطق خالص و تست‌پذیر؛ بدون دیتابیس. مقادیر اینجا از سند امنیت می‌آیند
 * (docs/05-ops/security.md).
 */

export const OTP_CODE_LENGTH = 6;

/** عمر کد یک‌بارمصرف: دو دقیقه. */
export const OTP_TTL_MS = 2 * 60 * 1000;

/** حداکثر تلاش تایید برای هر کد. */
export const OTP_MAX_ATTEMPTS = 5;

/** پنجره محدودیت نرخ درخواست کد. */
export const OTP_RATE_WINDOW_MS = 10 * 60 * 1000;

/** حداکثر درخواست کد در هر پنجره. */
export const OTP_RATE_MAX_REQUESTS = 3;

/** فاصله حداقلی بین دو درخواست پیاپی. */
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export type OtpRejectionReason =
  | "rate_limited"
  | "cooldown"
  | "not_found"
  | "expired"
  | "consumed"
  | "too_many_attempts"
  | "mismatch";

export const OTP_REJECTION_MESSAGES: Record<OtpRejectionReason, string> = {
  rate_limited: "تعداد درخواست‌های شما زیاد بوده است. چند دقیقه بعد دوباره تلاش کنید.",
  cooldown: "برای دریافت کد جدید کمی صبر کنید.",
  not_found: "کدی برای این شماره ثبت نشده است. دوباره درخواست کد بدهید.",
  expired: "این کد منقضی شده است. کد جدید درخواست کنید.",
  consumed: "این کد قبلاً استفاده شده است. کد جدید درخواست کنید.",
  too_many_attempts: "تعداد تلاش‌های نادرست زیاد بود. کد جدید درخواست کنید.",
  mismatch: "کد وارد‌شده درست نیست.",
};

export interface RateWindow {
  hits: number;
  windowStartedAt: number;
}

export interface RateDecision {
  allowed: boolean
  reason?: Extract<OtpRejectionReason, "rate_limited">;
  /** پنجره جدید برای ذخیره؛ اگر پنجره قبلی منقضی شده بود، بازنشانی می‌شود. */
  nextWindow: RateWindow;
  retryAfterSeconds: number;
}

/**
 * تصمیم محدودیت نرخ.
 * پنجره کشویی ساده: بعد از پایان پنجره، شمارنده صفر می‌شود.
 */
export function evaluateRateLimit(
  window: RateWindow | null,
  nowMs: number = Date.now(),
): RateDecision {
  if (!window || nowMs - window.windowStartedAt >= OTP_RATE_WINDOW_MS) {
    return {
      allowed: true,
      nextWindow: { hits: 1, windowStartedAt: nowMs },
      retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000),
    };
  }

  if (window.hits >= OTP_RATE_MAX_REQUESTS) {
    const remainingMs = OTP_RATE_WINDOW_MS - (nowMs - window.windowStartedAt);
    return {
      allowed: false,
      reason: "rate_limited",
      nextWindow: window,
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  return {
    allowed: true,
    nextWindow: { hits: window.hits + 1, windowStartedAt: window.windowStartedAt },
    retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000),
  };
}

export interface StoredOtp {
  codeHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  consumedAt: number | null;
  createdAt: number;
}

export type OtpVerification =
  | { ok: true }
  | { ok: false; reason: OtpRejectionReason; message: string };

/**
 * بررسی اعتبار کد.
 * مقایسه هش بیرون از این تابع انجام می‌شود (به دلیل نیاز به مقایسه امن)،
 * اینجا فقط قوانین انقضا و تعداد تلاش اعمال می‌گردد.
 */
export function verifyOtpRules(
  stored: StoredOtp | null,
  hashMatches: boolean,
  nowMs: number = Date.now(),
): OtpVerification {
  const reject = (reason: OtpRejectionReason): OtpVerification => ({
    ok: false,
    reason,
    message: OTP_REJECTION_MESSAGES[reason],
  });

  if (!stored) return reject("not_found");
  if (stored.consumedAt !== null) return reject("consumed");
  if (stored.expiresAt <= nowMs) return reject("expired");
  if (stored.attempts >= stored.maxAttempts) return reject("too_many_attempts");
  if (!hashMatches) return reject("mismatch");

  return { ok: true };
}

/** آیا از آخرین ارسال کد به‌اندازه کافی گذشته است؟ */
export function canResend(lastSentAt: number | null, nowMs: number = Date.now()): boolean {
  if (lastSentAt === null) return true;
  return nowMs - lastSentAt >= OTP_RESEND_COOLDOWN_MS;
}

export function secondsUntilResend(
  lastSentAt: number | null,
  nowMs: number = Date.now(),
): number {
  if (lastSentAt === null) return 0;
  const remaining = OTP_RESEND_COOLDOWN_MS - (nowMs - lastSentAt);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
