import { describe, expect, it } from "vitest";

import {
  computeCoverPosition,
  GoldCoverValidationError,
  prepareCoverEntry,
} from "./gold-cover";

const PURCHASED_AT = 1_700_000_000_000;

describe("prepareCoverEntry", () => {
  it("معادل خالص ۱۸ عیار را محاسبه می‌کند", () => {
    const prepared = prepareCoverEntry({
      amountMg: 1_000,
      karat: 18,
      source: "purchase",
      purchasedAt: PURCHASED_AT,
    });

    expect(prepared.pureMg).toBe(750);
  });

  it("وزن صفر را رد می‌کند", () => {
    expect(() =>
      prepareCoverEntry({
        amountMg: 0,
        karat: 18,
        source: "purchase",
        purchasedAt: PURCHASED_AT,
      }),
    ).toThrow(GoldCoverValidationError);
  });

  it("مبلغ منفی را رد می‌کند", () => {
    expect(() =>
      prepareCoverEntry({
        amountMg: 1_000,
        karat: 24,
        paidRial: -1,
        source: "correction",
        purchasedAt: PURCHASED_AT,
      }),
    ).toThrow(GoldCoverValidationError);
  });
});

describe("computeCoverPosition", () => {
  it("باقیمانده را تعهد منهای پوشش می‌گذارد", () => {
    const position = computeCoverPosition(1_000, 400);
    expect(position.remainingPureMg).toBe(600);
    expect(position.surplusPureMg).toBe(0);
  });

  it("باقیمانده را منفی نمی‌کند", () => {
    const position = computeCoverPosition(500, 800);
    expect(position.remainingPureMg).toBe(0);
    expect(position.surplusPureMg).toBe(300);
  });

  it("وقتی پوشش کامل است باقیمانده صفر است", () => {
    const position = computeCoverPosition(750, 750);
    expect(position.remainingPureMg).toBe(0);
    expect(position.surplusPureMg).toBe(0);
  });
});
