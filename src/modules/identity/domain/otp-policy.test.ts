import { describe, expect, it } from "vitest";

import {
  canResend,
  evaluateRateLimit,
  OTP_MAX_ATTEMPTS,
  OTP_RATE_MAX_REQUESTS,
  OTP_RATE_WINDOW_MS,
  OTP_RESEND_COOLDOWN_MS,
  secondsUntilResend,
  verifyOtpRules,
  type StoredOtp,
} from "./otp-policy";

const NOW = 1_700_000_000_000;

function storedOtp(overrides?: Partial<StoredOtp>): StoredOtp {
  return {
    codeHash: "hash",
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    expiresAt: NOW + 60_000,
    consumedAt: null,
    createdAt: NOW - 10_000,
    ...overrides,
  };
}

describe("evaluateRateLimit", () => {
  it("اولین درخواست را اجازه می‌دهد", () => {
    const decision = evaluateRateLimit(null, NOW);
    expect(decision.allowed).toBe(true);
    expect(decision.nextWindow).toEqual({ hits: 1, windowStartedAt: NOW });
  });

  it("درخواست‌های داخل سقف را اجازه می‌دهد و می‌شمارد", () => {
    const decision = evaluateRateLimit({ hits: 1, windowStartedAt: NOW - 60_000 }, NOW);
    expect(decision.allowed).toBe(true);
    expect(decision.nextWindow.hits).toBe(2);
  });

  it("عبور از سقف را مسدود می‌کند", () => {
    const decision = evaluateRateLimit(
      { hits: OTP_RATE_MAX_REQUESTS, windowStartedAt: NOW - 60_000 },
      NOW,
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("rate_limited");
    expect(decision.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("پس از پایان پنجره شمارنده را بازنشانی می‌کند", () => {
    const decision = evaluateRateLimit(
      { hits: OTP_RATE_MAX_REQUESTS, windowStartedAt: NOW - OTP_RATE_WINDOW_MS - 1 },
      NOW,
    );

    expect(decision.allowed).toBe(true);
    expect(decision.nextWindow).toEqual({ hits: 1, windowStartedAt: NOW });
  });
});

describe("verifyOtpRules", () => {
  it("کد درست و تازه را می‌پذیرد", () => {
    expect(verifyOtpRules(storedOtp(), true, NOW)).toEqual({ ok: true });
  });

  it("نبود کد را رد می‌کند", () => {
    const result = verifyOtpRules(null, true, NOW);
    expect(result).toMatchObject({ ok: false, reason: "not_found" });
  });

  it("کد استفاده‌شده را رد می‌کند", () => {
    const result = verifyOtpRules(storedOtp({ consumedAt: NOW - 1_000 }), true, NOW);
    expect(result).toMatchObject({ ok: false, reason: "consumed" });
  });

  it("کد منقضی را رد می‌کند", () => {
    const result = verifyOtpRules(storedOtp({ expiresAt: NOW - 1 }), true, NOW);
    expect(result).toMatchObject({ ok: false, reason: "expired" });
  });

  it("پس از رسیدن به سقف تلاش، کد را می‌سوزاند", () => {
    const result = verifyOtpRules(storedOtp({ attempts: OTP_MAX_ATTEMPTS }), true, NOW);
    expect(result).toMatchObject({ ok: false, reason: "too_many_attempts" });
  });

  it("کد نادرست را رد می‌کند", () => {
    const result = verifyOtpRules(storedOtp(), false, NOW);
    expect(result).toMatchObject({ ok: false, reason: "mismatch" });
  });

  it("ترتیب بررسی‌ها درست است: انقضا مهم‌تر از تطابق", () => {
    // اگر کد هم منقضی باشد و هم غلط، پیام انقضا مفیدتر است.
    const result = verifyOtpRules(storedOtp({ expiresAt: NOW - 1 }), false, NOW);
    expect(result).toMatchObject({ reason: "expired" });
  });

  it("هر رد شدن پیام فارسی دارد", () => {
    const result = verifyOtpRules(null, false, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message.length).toBeGreaterThan(5);
  });
});

describe("محدودیت ارسال مجدد", () => {
  it("اولین ارسال محدودیت ندارد", () => {
    expect(canResend(null, NOW)).toBe(true);
    expect(secondsUntilResend(null, NOW)).toBe(0);
  });

  it("ارسال دوباره خیلی سریع مجاز نیست", () => {
    expect(canResend(NOW - 5_000, NOW)).toBe(false);
    expect(secondsUntilResend(NOW - 5_000, NOW)).toBeGreaterThan(0);
  });

  it("پس از پایان فاصله مجاز است", () => {
    expect(canResend(NOW - OTP_RESEND_COOLDOWN_MS, NOW)).toBe(true);
    expect(secondsUntilResend(NOW - OTP_RESEND_COOLDOWN_MS, NOW)).toBe(0);
  });
});
