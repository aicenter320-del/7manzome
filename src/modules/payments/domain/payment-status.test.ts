import { describe, expect, it } from "vitest";

import {
  buildPaymentNumber,
  canReview,
  canSubmitReceipt,
  canTransition,
  hoursRemaining,
  isExpired,
  isFinalStatus,
  nextStatuses,
  validateReceiptAmount,
} from "./payment-status";

describe("canTransition", () => {
  it("مسیر موفق کارت‌به‌کارت را اجازه می‌دهد", () => {
    expect(canTransition("awaiting_transfer", "receipt_submitted")).toBe(true);
    expect(canTransition("receipt_submitted", "under_review")).toBe(true);
    expect(canTransition("under_review", "confirmed")).toBe(true);
  });

  it("رد شدن و ارسال مجدد رسید را اجازه می‌دهد", () => {
    expect(canTransition("under_review", "rejected")).toBe(true);
    expect(canTransition("rejected", "receipt_submitted")).toBe(true);
  });

  it("پرش از مراحل را اجازه نمی‌دهد", () => {
    // نمی‌شود بدون بررسی ادمین مستقیم تایید کرد.
    expect(canTransition("awaiting_transfer", "confirmed")).toBe(false);
    expect(canTransition("receipt_submitted", "confirmed")).toBe(false);
  });

  it("از وضعیت نهایی خارج نمی‌شود", () => {
    expect(canTransition("confirmed", "rejected")).toBe(false);
    expect(canTransition("expired", "receipt_submitted")).toBe(false);
  });
});

describe("isFinalStatus", () => {
  it("تایید و انقضا نهایی‌اند", () => {
    expect(isFinalStatus("confirmed")).toBe(true);
    expect(isFinalStatus("expired")).toBe(true);
  });

  it("رد شدن نهایی نیست چون کاربر می‌تواند رسید جدید بفرستد", () => {
    expect(isFinalStatus("rejected")).toBe(false);
  });
});

describe("nextStatuses", () => {
  it("گذارهای مجاز را برای ساخت دکمه‌های UI می‌دهد", () => {
    expect(nextStatuses("under_review")).toEqual(["confirmed", "rejected"]);
  });
});

describe("canReview", () => {
  it("فقط رسیدهای ارسال‌شده و در حال بررسی قابل تاییدند", () => {
    expect(canReview("receipt_submitted")).toBe(true);
    expect(canReview("under_review")).toBe(true);
    expect(canReview("awaiting_transfer")).toBe(false);
    expect(canReview("confirmed")).toBe(false);
  });
});

describe("canSubmitReceipt", () => {
  it("در انتظار واریز و پس از رد شدن مجاز است", () => {
    expect(canSubmitReceipt("awaiting_transfer")).toBe(true);
    expect(canSubmitReceipt("rejected")).toBe(true);
  });

  it("پس از تایید مجاز نیست", () => {
    expect(canSubmitReceipt("confirmed")).toBe(false);
    expect(canSubmitReceipt("under_review")).toBe(false);
  });
});

describe("validateReceiptAmount", () => {
  it("مبلغ برابر را تایید می‌کند", () => {
    const result = validateReceiptAmount(50_000_000, 50_000_000);
    expect(result).toEqual({ matches: true, differenceRial: 0, warning: null });
  });

  it("مبلغ کمتر را با هشدار برمی‌گرداند، نه رد کامل", () => {
    const result = validateReceiptAmount(50_000_000, 40_000_000);
    expect(result.matches).toBe(false);
    expect(result.differenceRial).toBe(-10_000_000);
    expect(result.warning).toContain("کمتر");
  });

  it("مبلغ بیشتر را هم هشدار می‌دهد", () => {
    const result = validateReceiptAmount(50_000_000, 60_000_000);
    expect(result.differenceRial).toBe(10_000_000);
    expect(result.warning).toContain("بیشتر");
  });
});

describe("مهلت پرداخت", () => {
  const now = 1_700_000_000_000;

  it("پرداخت بدون مهلت منقضی نمی‌شود", () => {
    expect(isExpired(null, now)).toBe(false);
    expect(hoursRemaining(null, now)).toBeNull();
  });

  it("مهلت گذشته را تشخیص می‌دهد", () => {
    expect(isExpired(now - 1, now)).toBe(true);
    expect(hoursRemaining(now - 1, now)).toBe(0);
  });

  it("ساعت باقی‌مانده را می‌دهد", () => {
    expect(hoursRemaining(now + 10 * 3_600_000, now)).toBe(10);
  });
});

describe("buildPaymentNumber", () => {
  it("شماره پرداخت قابل‌نمایش می‌سازد", () => {
    expect(buildPaymentNumber(1404, 123)).toBe("PM-1404-000123");
  });
});
