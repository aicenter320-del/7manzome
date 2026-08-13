import { describe, expect, it } from "vitest";

import {
  calculateVat,
  formatRial,
  formatRialShort,
  parseTomanInput,
  rialToToman,
  roundRialTo,
  sumRial,
  tomanToRial,
} from "./money";

describe("تبدیل ریال و تومان", () => {
  it("تومان را به ریال تبدیل می‌کند", () => {
    expect(tomanToRial(500_000)).toBe(5_000_000);
  });

  it("ریال را به تومان تبدیل می‌کند", () => {
    expect(rialToToman(5_000_000)).toBe(500_000);
  });

  it("ورودی اعشاری تومان را رد می‌کند", () => {
    expect(() => tomanToRial(1.5)).toThrow(/عدد صحیح/);
  });
});

describe("formatRial", () => {
  it("مبلغ را به تومان با ارقام فارسی نمایش می‌دهد", () => {
    expect(formatRial(5_000_000)).toBe("۵۰۰٬۰۰۰ تومان");
  });

  it("بدون واحد هم قابل استفاده است", () => {
    expect(formatRial(5_000_000, { withUnit: false })).toBe("۵۰۰٬۰۰۰");
  });

  it("صفر را درست نمایش می‌دهد", () => {
    expect(formatRial(0)).toBe("۰ تومان");
  });
});

describe("formatRialShort", () => {
  it("مبالغ بزرگ را خلاصه می‌کند", () => {
    // ۵۲۰ میلیون ریال = ۵۲ میلیون تومان
    expect(formatRialShort(520_000_000)).toBe("۵۲ میلیون تومان");
  });

  it("مبالغ کوچک را خلاصه نمی‌کند", () => {
    expect(formatRialShort(5_000)).toBe("۵۰۰ تومان");
  });
});

describe("parseTomanInput", () => {
  it("ورودی ساده لاتین را می‌پذیرد", () => {
    expect(parseTomanInput("500000")).toBe(5_000_000);
  });

  it("جداکننده هزارگان را تحمل می‌کند", () => {
    expect(parseTomanInput("500,000")).toBe(5_000_000);
    expect(parseTomanInput("۵۰۰٬۰۰۰")).toBe(5_000_000);
  });

  it("ارقام فارسی را می‌پذیرد", () => {
    expect(parseTomanInput("۱۰۰۰۰۰۰")).toBe(10_000_000);
  });

  it("واحد نوشته‌شده را حذف می‌کند", () => {
    expect(parseTomanInput("۵۰۰۰۰۰ تومان")).toBe(5_000_000);
  });

  it("ورودی نامعتبر null می‌دهد", () => {
    expect(parseTomanInput("")).toBeNull();
    expect(parseTomanInput("سلام")).toBeNull();
    expect(parseTomanInput("12.5")).toBeNull();
  });
});

describe("calculateVat", () => {
  it("مالیات را با نرخ صدم درصدی محاسبه می‌کند", () => {
    // ۹٪ روی ۱۰ میلیون ریال
    expect(calculateVat(10_000_000, 900)).toBe(900_000);
  });
});

describe("sumRial", () => {
  it("مبالغ اقلام سفارش را جمع می‌زند", () => {
    expect(sumRial([18_550_000, 2_000_000, 500_000])).toBe(21_050_000);
  });
});

describe("roundRialTo", () => {
  it("مبلغ را به نزدیک‌ترین گام گرد می‌کند", () => {
    // گرد کردن به هزار تومان = ۱۰ هزار ریال
    expect(roundRialTo(21_047_000, 10_000)).toBe(21_050_000);
  });

  it("گام غیرمثبت مبلغ را تغییر نمی‌دهد", () => {
    expect(roundRialTo(12_345, 0)).toBe(12_345);
  });
});
