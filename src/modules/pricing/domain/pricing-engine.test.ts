import { describe, expect, it } from "vitest";

import {
  calculateVariantPrice,
  grossMarginRial,
  isPriceStale,
  lineTotal,
  priceAgeMinutes,
  toBreakdownRows,
} from "./pricing-engine";
import type { PricingParams } from "./types";

/** یک دستبند ۰.۷۲ گرمی ۱۸ عیار با اجرت ۱۵٪ و سود ۷٪. */
const braceletParams: PricingParams = {
  kind: "jewelry",
  weightMg: 720,
  karat: 18,
  makingFeeBp: 1_500,
  profitBp: 700,
  premiumRial: 0,
  packagingRial: 500_000,
  personalizationRial: 3_000_000,
};

/** سکه یک‌گرمی ۲۴ عیار با حباب ۵ میلیون ریال. */
const coinParams: PricingParams = {
  kind: "coin",
  weightMg: 1_000,
  karat: 24,
  makingFeeBp: 0,
  profitBp: 0,
  premiumRial: 5_000_000,
  packagingRial: 1_000_000,
  personalizationRial: 0,
};

/** ۳۵ میلیون ریال بر گرم = ۳.۵ میلیون تومان. */
const PRICE_18K = 35_000_000;
const PRICE_24K = 46_000_000;
const VAT_BP = 1_000;

describe("calculateVariantPrice — زیورآلات", () => {
  const result = calculateVariantPrice({
    params: braceletParams,
    goldPricePerGramRial: PRICE_18K,
    vatBp: VAT_BP,
  });

  it("ارزش طلای خام را از وزن و قیمت می‌گیرد", () => {
    // ۷۲۰ میلی‌گرم × ۳۵ میلیون ÷ ۱۰۰۰
    expect(result.goldValueRial).toBe(25_200_000);
  });

  it("اجرت را روی ارزش طلای خام محاسبه می‌کند", () => {
    // ۱۵٪ از ۲۵٬۲۰۰٬۰۰۰
    expect(result.makingFeeRial).toBe(3_780_000);
  });

  it("سود را روی ارزش طلا به‌علاوه اجرت محاسبه می‌کند", () => {
    // ۷٪ از (۲۵٬۲۰۰٬۰۰۰ + ۳٬۷۸۰٬۰۰۰)
    expect(result.profitRial).toBe(2_028_600);
  });

  it("مالیات را فقط روی اجرت و سود اعمال می‌کند، نه روی طلای خام", () => {
    // ۱۰٪ از (۳٬۷۸۰٬۰۰۰ + ۲٬۰۲۸٬۶۰۰)
    expect(result.vatRial).toBe(580_860);
  });

  it("قیمت نهایی جمع همه اجزاست", () => {
    const expected = 25_200_000 + 3_780_000 + 2_028_600 + 580_860 + 500_000;
    expect(result.unitPriceRial).toBe(expected);
  });

  it("شخصی‌سازی فقط وقتی انتخاب شده اضافه می‌شود", () => {
    const withPersonalization = calculateVariantPrice({
      params: braceletParams,
      goldPricePerGramRial: PRICE_18K,
      vatBp: VAT_BP,
      withPersonalization: true,
    });

    expect(result.personalizationRial).toBe(0);
    expect(withPersonalization.personalizationRial).toBe(3_000_000);
    expect(withPersonalization.unitPriceRial - result.unitPriceRial).toBe(3_000_000);
  });

  it("خروجی همه اجزا را دارد تا در سفارش قفل شود", () => {
    expect(result).toMatchObject({
      weightMg: 720,
      karat: 18,
      goldPricePerGramRial: PRICE_18K,
      makingFeeBp: 1_500,
      profitBp: 700,
      vatBp: VAT_BP,
      isInvestment: false,
    });
  });
});

describe("calculateVariantPrice — محصول سرمایه‌ای", () => {
  const result = calculateVariantPrice({
    params: coinParams,
    goldPricePerGramRial: PRICE_24K,
    vatBp: VAT_BP,
  });

  it("فرمول ساده‌تر دارد: ارزش طلا به‌علاوه حباب و بسته‌بندی", () => {
    expect(result.unitPriceRial).toBe(46_000_000 + 5_000_000 + 1_000_000);
  });

  it("اجرت، سود و مالیات ندارد", () => {
    expect(result.makingFeeRial).toBe(0);
    expect(result.profitRial).toBe(0);
    expect(result.vatRial).toBe(0);
  });

  it("به‌عنوان سرمایه‌ای علامت‌گذاری می‌شود", () => {
    expect(result.isInvestment).toBe(true);
  });
});

describe("calculateVariantPrice — حالت‌های مرزی", () => {
  it("قیمت طلای صفر را رد می‌کند تا فروش بی‌قیمت انجام نشود", () => {
    expect(() =>
      calculateVariantPrice({
        params: braceletParams,
        goldPricePerGramRial: 0,
        vatBp: VAT_BP,
      }),
    ).toThrow(/قیمت طلا موجود نیست/);
  });

  it("وزن اعشاری را رد می‌کند", () => {
    expect(() =>
      calculateVariantPrice({
        params: { ...braceletParams, weightMg: 720.5 },
        goldPricePerGramRial: PRICE_18K,
        vatBp: VAT_BP,
      }),
    ).toThrow(/عدد صحیح/);
  });

  it("اجرت و سود صفر قیمت را برابر ارزش طلا و بسته‌بندی می‌کند", () => {
    const result = calculateVariantPrice({
      params: { ...braceletParams, makingFeeBp: 0, profitBp: 0, packagingRial: 0 },
      goldPricePerGramRial: PRICE_18K,
      vatBp: VAT_BP,
    });

    expect(result.unitPriceRial).toBe(25_200_000);
  });
});

describe("lineTotal", () => {
  it("قیمت واحد گردشده را در تعداد ضرب می‌کند", () => {
    expect(lineTotal(31_500_000, 3)).toBe(94_500_000);
  });

  it("تعداد صفر جمع صفر می‌دهد", () => {
    expect(lineTotal(31_500_000, 0)).toBe(0);
  });
});

describe("toBreakdownRows", () => {
  it("ردیف‌های شفافیت قیمت را می‌سازد", () => {
    const breakdown = calculateVariantPrice({
      params: braceletParams,
      goldPricePerGramRial: PRICE_18K,
      vatBp: VAT_BP,
    });

    const labels = toBreakdownRows(breakdown).map((row) => row.label);

    expect(labels).toEqual([
      "ارزش طلای خام",
      "اجرت ساخت",
      "سود فروشنده",
      "مالیات بر ارزش افزوده",
      "بسته‌بندی",
      "قیمت نهایی",
    ]);
  });

  it("برای محصول سرمایه‌ای ردیف حباب می‌گذارد نه اجرت", () => {
    const breakdown = calculateVariantPrice({
      params: coinParams,
      goldPricePerGramRial: PRICE_24K,
      vatBp: VAT_BP,
    });

    const labels = toBreakdownRows(breakdown).map((row) => row.label);

    expect(labels).toContain("حباب");
    expect(labels).not.toContain("اجرت ساخت");
  });

  it("ردیف آخر همیشه قیمت نهایی با تاکید است", () => {
    const breakdown = calculateVariantPrice({
      params: braceletParams,
      goldPricePerGramRial: PRICE_18K,
      vatBp: VAT_BP,
    });

    const rows = toBreakdownRows(breakdown);
    const last = rows.at(-1);

    expect(last?.emphasis).toBe(true);
    expect(last?.amountRial).toBe(breakdown.unitPriceRial);
  });
});

describe("grossMarginRial", () => {
  it("برای زیورآلات جمع اجرت و سود است", () => {
    const breakdown = calculateVariantPrice({
      params: braceletParams,
      goldPricePerGramRial: PRICE_18K,
      vatBp: VAT_BP,
    });

    expect(grossMarginRial(breakdown)).toBe(3_780_000 + 2_028_600);
  });

  it("برای محصول سرمایه‌ای حباب است", () => {
    const breakdown = calculateVariantPrice({
      params: coinParams,
      goldPricePerGramRial: PRICE_24K,
      vatBp: VAT_BP,
    });

    expect(grossMarginRial(breakdown)).toBe(5_000_000);
  });
});

describe("کهنگی قیمت", () => {
  const now = 1_700_000_000_000;

  it("قیمت تازه کهنه نیست", () => {
    expect(isPriceStale(now - 10 * 60_000, 720, now)).toBe(false);
  });

  it("قیمت قدیمی‌تر از حد مجاز کهنه است", () => {
    expect(isPriceStale(now - 800 * 60_000, 720, now)).toBe(true);
  });

  it("سن قیمت را به دقیقه می‌دهد", () => {
    expect(priceAgeMinutes(now - 45 * 60_000, now)).toBe(45);
  });

  it("قیمت آینده سن منفی نمی‌دهد", () => {
    expect(priceAgeMinutes(now + 60_000, now)).toBe(0);
  });
});
