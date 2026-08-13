import { describe, expect, it } from "vitest";

import {
  buildOrderNumber,
  canCustomerCancel,
  canTransition,
  isFinalStatus,
  isStaffOnlyTransition,
  nextStatuses,
} from "./order-status";

describe("canTransition", () => {
  it("مسیر موفق بدون شخصی‌سازی را اجازه می‌دهد", () => {
    expect(canTransition("created", "payment_pending")).toBe(true);
    expect(canTransition("payment_pending", "paid")).toBe(true);
    expect(canTransition("paid", "processing")).toBe(true);
    expect(canTransition("processing", "quality_check")).toBe(true);
    expect(canTransition("quality_check", "packed")).toBe(true);
    expect(canTransition("packed", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
  });

  it("شاخه شخصی‌سازی را اجازه می‌دهد", () => {
    expect(canTransition("processing", "personalization")).toBe(true);
    expect(canTransition("personalization", "quality_check")).toBe(true);
  });

  it("تسویه مستقیم از ثبت‌شده به پرداخت‌شده را اجازه می‌دهد", () => {
    expect(canTransition("created", "paid")).toBe(true);
  });

  it("پرش از مراحل را اجازه نمی‌دهد", () => {
    expect(canTransition("created", "shipped")).toBe(false);
    expect(canTransition("payment_pending", "processing")).toBe(false);
    expect(canTransition("paid", "shipped")).toBe(false);
    expect(canTransition("packed", "delivered")).toBe(false);
  });

  it("از وضعیت نهایی خارج نمی‌شود", () => {
    expect(canTransition("delivered", "processing")).toBe(false);
    expect(canTransition("cancelled", "payment_pending")).toBe(false);
    expect(canTransition("refunded", "paid")).toBe(false);
  });
});

describe("انصراف", () => {
  it("از ثبت‌شده و در انتظار پرداخت مجاز است", () => {
    expect(canTransition("created", "cancelled")).toBe(true);
    expect(canTransition("payment_pending", "cancelled")).toBe(true);
    expect(canCustomerCancel("created")).toBe(true);
    expect(canCustomerCancel("payment_pending")).toBe(true);
  });

  it("پس از پرداخت دیگر توسط مشتری لغو نمی‌شود", () => {
    expect(canTransition("paid", "cancelled")).toBe(false);
    expect(canTransition("shipped", "cancelled")).toBe(false);
    expect(canCustomerCancel("paid")).toBe(false);
    expect(canCustomerCancel("processing")).toBe(false);
  });
});

describe("بازگشت وجه", () => {
  it("از پرداخت‌شده و آماده‌سازی به صف بازگشت می‌رود", () => {
    expect(canTransition("paid", "refund_pending")).toBe(true);
    expect(canTransition("processing", "refund_pending")).toBe(true);
    expect(canTransition("refund_pending", "refunded")).toBe(true);
  });

  it("از کنترل کیفیت مستقیماً بازگشت وجه نمی‌شود", () => {
    expect(canTransition("quality_check", "refund_pending")).toBe(false);
  });
});

describe("اصلاح کیفیت", () => {
  it("از کنترل کیفیت می‌توان به آماده‌سازی برگشت", () => {
    expect(canTransition("quality_check", "processing")).toBe(true);
  });
});

describe("isFinalStatus", () => {
  it("تحویل، لغو و بازگشت وجه نهایی‌اند", () => {
    expect(isFinalStatus("delivered")).toBe(true);
    expect(isFinalStatus("cancelled")).toBe(true);
    expect(isFinalStatus("refunded")).toBe(true);
  });

  it("وضعیت‌های میانی نهایی نیستند", () => {
    expect(isFinalStatus("paid")).toBe(false);
    expect(isFinalStatus("payment_pending")).toBe(false);
    expect(isFinalStatus("refund_pending")).toBe(false);
  });
});

describe("nextStatuses", () => {
  it("گذارهای مجاز را برای ساخت دکمه‌های UI می‌دهد", () => {
    expect(nextStatuses("paid")).toEqual(["processing", "refund_pending"]);
    expect(nextStatuses("delivered")).toEqual([]);
  });
});

describe("isStaffOnlyTransition", () => {
  it("آماده‌سازی و ارسال فقط برای کارمند است", () => {
    expect(isStaffOnlyTransition("paid", "processing")).toBe(true);
    expect(isStaffOnlyTransition("packed", "shipped")).toBe(true);
  });

  it("انصراف مشتری کارمند‌محور نیست", () => {
    expect(isStaffOnlyTransition("payment_pending", "cancelled")).toBe(false);
  });

  it("گذار نامعتبر کارمند‌محور هم نیست", () => {
    expect(isStaffOnlyTransition("created", "shipped")).toBe(false);
  });
});

describe("buildOrderNumber", () => {
  it("شماره سفارش قابل‌نمایش می‌سازد", () => {
    expect(buildOrderNumber(1404, 123)).toBe("HM-1404-000123");
    expect(buildOrderNumber(1405, 1)).toBe("HM-1405-000001");
  });
});
