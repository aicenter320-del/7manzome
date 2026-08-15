import { describe, expect, it } from "vitest";

import { submitReceiptSchema } from "./payment.schema";

describe("submitReceiptSchema", () => {
  const base = {
    paymentId: "00000000-0000-4000-8000-000000000001",
    referenceNumber: "12345678",
    paidAmountRial: 1_000_000,
    payerName: "علی رضایی",
    bankName: "ملت",
    paidAt: Date.now(),
    receiptFileId: "00000000-0000-4000-8000-000000000002",
  };

  it("رسید کامل با بانک و عکس را می‌پذیرد", () => {
    expect(submitReceiptSchema.safeParse(base).success).toBe(true);
  });

  it("بدون عکس رسید رد می‌شود", () => {
    const { receiptFileId: _, ...rest } = base;
    expect(submitReceiptSchema.safeParse(rest).success).toBe(false);
  });

  it("بانک خارج از فهرست را رد می‌کند", () => {
    expect(submitReceiptSchema.safeParse({ ...base, bankName: "بانک خیالی" }).success).toBe(false);
  });
});
