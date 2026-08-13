import { describe, expect, it } from "vitest";

import {
  canDebit,
  computeBalance,
  computeProgress,
  detectMilestones,
  LedgerValidationError,
  milestoneTitle,
  monthsToGoal,
  prepareEntry,
  requiredMonthlyMg,
  unrealizedGainRial,
  type LedgerEntryDraft,
} from "./gold-ledger";
import type { LedgerEntry } from "./types";

const NOW = 1_700_000_000_000;

function entry(overrides: Partial<LedgerEntry>): LedgerEntry {
  return {
    id: "entry-1",
    treasureId: "treasure-1",
    direction: "in",
    amountMg: 1_000,
    karat: 18,
    pureMg: 750,
    source: "contribution",
    referenceType: "contribution",
    referenceId: "contribution-1",
    goldPricePerGramRial: 35_000_000,
    valueRial: 35_000_000,
    note: null,
    occurredAt: NOW,
    ...overrides,
  };
}

function draft(overrides?: Partial<LedgerEntryDraft>): LedgerEntryDraft {
  return {
    treasureId: "treasure-1",
    direction: "in",
    amountMg: 1_000,
    karat: 18,
    source: "contribution",
    referenceType: "contribution",
    referenceId: "contribution-1",
    goldPricePerGramRial: 35_000_000,
    valueRial: 35_000_000,
    ...overrides,
  };
}

describe("prepareEntry", () => {
  it("معادل طلای خالص را خودکار محاسبه می‌کند", () => {
    const prepared = prepareEntry(draft(), NOW);
    expect(prepared.pureMg).toBe(750);
  });

  it("زمان رخداد را در صورت نبود پر می‌کند", () => {
    expect(prepareEntry(draft(), NOW).occurredAt).toBe(NOW);
  });

  it("مقدار صفر یا منفی را رد می‌کند", () => {
    expect(() => prepareEntry(draft({ amountMg: 0 }), NOW)).toThrow(LedgerValidationError);
    expect(() => prepareEntry(draft({ amountMg: -100 }), NOW)).toThrow(LedgerValidationError);
  });

  it("قلم بی‌منشأ را رد می‌کند", () => {
    expect(() => prepareEntry(draft({ referenceId: "" }), NOW)).toThrow(/منشأ مشخص/);
    expect(() => prepareEntry(draft({ referenceType: "  " }), NOW)).toThrow(/منشأ مشخص/);
  });

  it("مقدار اعشاری را رد می‌کند", () => {
    expect(() => prepareEntry(draft({ amountMg: 100.5 }), NOW)).toThrow();
  });
});

describe("computeBalance", () => {
  it("دفتر خالی موجودی صفر می‌دهد", () => {
    const balance = computeBalance([]);
    expect(balance.balanceMg).toBe(0);
    expect(balance.entryCount).toBe(0);
  });

  it("ورودی‌ها را جمع می‌زند", () => {
    const balance = computeBalance([
      entry({ amountMg: 80, pureMg: 60, valueRial: 2_800_000 }),
      entry({ amountMg: 150, pureMg: 113, valueRial: 5_250_000 }),
      entry({ amountMg: 100, pureMg: 75, valueRial: 3_500_000 }),
    ]);

    expect(balance.totalInMg).toBe(330);
    expect(balance.investedRial).toBe(11_550_000);
  });

  it("خروجی‌ها را کم می‌کند", () => {
    const balance = computeBalance([
      entry({ amountMg: 1_000, pureMg: 750 }),
      entry({ direction: "out", amountMg: 400, pureMg: 300, source: "redemption" }),
    ]);

    expect(balance.totalInMg).toBe(1_000);
    expect(balance.totalOutMg).toBe(400);
    expect(balance.pureBalanceMg).toBe(450);
  });

  it("عیارهای مختلف را درست جمع می‌زند", () => {
    // ۱ گرم ۱۸ عیار (۷۵۰ خالص) + ۱ گرم ۲۴ عیار (۱۰۰۰ خالص) = ۱۷۵۰ خالص
    const balance = computeBalance([
      entry({ amountMg: 1_000, karat: 18, pureMg: 750 }),
      entry({ amountMg: 1_000, karat: 24, pureMg: 1_000 }),
    ]);

    expect(balance.pureBalanceMg).toBe(1_750);
    // معادل ۱۸ عیار: ۱۷۵۰ × ۲۴ ÷ ۱۸ ≈ ۲۳۳۳
    expect(balance.balanceMg).toBe(2_333);
  });

  it("خروجی بیشتر از ورودی موجودی نمایشی را صفر نگه می‌دارد", () => {
    const balance = computeBalance([
      entry({ amountMg: 100, pureMg: 75 }),
      entry({ direction: "out", amountMg: 200, pureMg: 150, source: "correction" }),
    ]);

    expect(balance.pureBalanceMg).toBe(-75);
    expect(balance.balanceMg).toBe(0);
  });

  it("مبلغ سرمایه‌گذاری‌شده فقط از ورودی‌ها می‌آید", () => {
    const balance = computeBalance([
      entry({ valueRial: 10_000_000 }),
      entry({ direction: "out", valueRial: 5_000_000, source: "redemption" }),
    ]);

    expect(balance.investedRial).toBe(10_000_000);
  });
});

describe("canDebit", () => {
  const balance = computeBalance([entry({ amountMg: 1_000, karat: 18, pureMg: 750 })]);

  it("برداشت در حد موجودی مجاز است", () => {
    expect(canDebit(balance, 500, 18)).toBe(true);
    expect(canDebit(balance, 1_000, 18)).toBe(true);
  });

  it("برداشت بیش از موجودی مجاز نیست", () => {
    expect(canDebit(balance, 1_001, 18)).toBe(false);
  });

  it("عیار برداشت در محاسبه لحاظ می‌شود", () => {
    // ۷۵۰ میلی‌گرم طلای ۲۴ عیار معادل ۷۵۰ خالص است، پس دقیقاً کفایت می‌کند.
    expect(canDebit(balance, 750, 24)).toBe(true);
    expect(canDebit(balance, 751, 24)).toBe(false);
  });
});

describe("detectMilestones", () => {
  const thresholds = [100, 500, 1_000, 3_000, 5_000, 10_000];

  it("عبور از یک آستانه را تشخیص می‌دهد", () => {
    const result = detectMilestones({
      previousBalanceMg: 400,
      newBalanceMg: 600,
      thresholdsMg: thresholds,
      alreadyAchievedMg: [100],
    });

    expect(result).toEqual([500]);
  });

  it("عبور از چند آستانه با یک هدیه بزرگ را می‌گیرد", () => {
    const result = detectMilestones({
      previousBalanceMg: 0,
      newBalanceMg: 3_200,
      thresholdsMg: thresholds,
      alreadyAchievedMg: [],
    });

    expect(result).toEqual([100, 500, 1_000, 3_000]);
  });

  it("آستانه کسب‌شده را دوباره نمی‌دهد", () => {
    const result = detectMilestones({
      previousBalanceMg: 0,
      newBalanceMg: 600,
      thresholdsMg: thresholds,
      alreadyAchievedMg: [100, 500],
    });

    expect(result).toEqual([]);
  });

  it("رسیدن دقیق به آستانه محسوب می‌شود", () => {
    const result = detectMilestones({
      previousBalanceMg: 999,
      newBalanceMg: 1_000,
      thresholdsMg: thresholds,
      alreadyAchievedMg: [100, 500],
    });

    expect(result).toEqual([1_000]);
  });
});

describe("milestoneTitle", () => {
  it("عنوان‌های شناخته‌شده را می‌دهد", () => {
    expect(milestoneTitle(1_000)).toBe("اولین گرم");
    expect(milestoneTitle(10_000)).toBe("گنجینه بزرگ");
  });

  it("برای آستانه ناشناس عنوان عمومی می‌سازد", () => {
    expect(milestoneTitle(20_000)).toBe("رسیدن به 20 گرم");
  });
});

describe("computeProgress", () => {
  it("درصد پیشرفت را می‌دهد", () => {
    expect(computeProgress(3_720, 10_000)).toBe(37);
  });

  it("بدون هدف صفر است", () => {
    expect(computeProgress(3_720, null)).toBe(0);
  });
});

describe("monthsToGoal", () => {
  it("تعداد ماه لازم را می‌دهد", () => {
    // از ۱ گرم تا ۱۰ گرم با ماهی ۰.۲۵ گرم
    expect(monthsToGoal(1_000, 10_000, 250)).toBe(36);
  });

  it("هدف محقق‌شده صفر می‌دهد", () => {
    expect(monthsToGoal(10_000, 10_000, 250)).toBe(0);
  });

  it("آهنگ صفر هرگز به هدف نمی‌رسد", () => {
    expect(monthsToGoal(1_000, 10_000, 0)).toBeNull();
  });
});

describe("requiredMonthlyMg", () => {
  it("مقدار ماهانه لازم را می‌دهد", () => {
    expect(requiredMonthlyMg(1_000, 10_000, 36)).toBe(250);
  });

  it("هدف محقق‌شده نیازی به افزودن ندارد", () => {
    expect(requiredMonthlyMg(10_000, 10_000, 12)).toBe(0);
  });

  it("مهلت گذشته کل کمبود را می‌خواهد", () => {
    expect(requiredMonthlyMg(1_000, 10_000, 0)).toBe(9_000);
  });
});

describe("unrealizedGainRial", () => {
  it("سود سرمایه را محاسبه می‌کند", () => {
    const balance = computeBalance([entry({ valueRial: 30_000_000 })]);
    expect(unrealizedGainRial(balance, 42_000_000)).toBe(12_000_000);
  });

  it("زیان را منفی نشان می‌دهد", () => {
    const balance = computeBalance([entry({ valueRial: 30_000_000 })]);
    expect(unrealizedGainRial(balance, 25_000_000)).toBe(-5_000_000);
  });
});
