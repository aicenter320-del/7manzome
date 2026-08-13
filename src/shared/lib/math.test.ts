import { describe, expect, it } from "vitest";

import {
  basisPointsToPercent,
  clamp,
  mulDiv,
  percentOf,
  percentToBasisPoints,
  roundHalfUp,
  sumIntegers,
} from "./math";

describe("roundHalfUp", () => {
  it("به سمت بالا گرد می‌کند وقتی باقی‌مانده دقیقاً نیم است", () => {
    expect(roundHalfUp(5, 2)).toBe(3);
    expect(roundHalfUp(7, 2)).toBe(4);
  });

  it("به سمت پایین گرد می‌کند وقتی باقی‌مانده کمتر از نیم است", () => {
    expect(roundHalfUp(4, 3)).toBe(1);
    expect(roundHalfUp(10, 4)).toBe(3);
  });

  it("برای اعداد منفی قرینه عمل می‌کند", () => {
    expect(roundHalfUp(-5, 2)).toBe(-3);
    expect(roundHalfUp(5, -2)).toBe(-3);
  });

  it("تقسیم بر صفر را رد می‌کند", () => {
    expect(() => roundHalfUp(1, 0)).toThrow();
  });
});

describe("mulDiv", () => {
  it("ضرب را قبل از تقسیم انجام می‌دهد تا دقت حفظ شود", () => {
    // اگر اول تقسیم می‌شد: floor(1/3)*100 = 0 که غلط است.
    expect(mulDiv(1, 100, 3)).toBe(33);
  });

  it("ارزش طلا را درست محاسبه می‌کند", () => {
    // ۵۳۰ میلی‌گرم با قیمت ۳۵ میلیون ریال بر گرم
    expect(mulDiv(530, 35_000_000, 1_000)).toBe(18_550_000);
  });

  it("ورودی اعشاری را رد می‌کند", () => {
    expect(() => mulDiv(1.5, 2, 3)).toThrow(/عدد صحیح/);
  });

  it("سرریز را تشخیص می‌دهد", () => {
    expect(() => mulDiv(Number.MAX_SAFE_INTEGER, 2, 1)).toThrow(/سرریز/);
  });
});

describe("percentOf", () => {
  it("درصد را بر مبنای صدم درصد محاسبه می‌کند", () => {
    // ۹٪ از ۱۰۰ هزار ریال
    expect(percentOf(100_000, 900)).toBe(9_000);
  });

  it("درصدهای اعشاری را بدون خطای شناور مدیریت می‌کند", () => {
    // ۷.۵٪ از ۱۰۰۰ ریال
    expect(percentOf(1_000, 750)).toBe(75);
  });

  it("صفر درصد صفر می‌دهد", () => {
    expect(percentOf(999_999, 0)).toBe(0);
  });
});

describe("تبدیل درصد", () => {
  it("درصد را به صدم درصد و برعکس تبدیل می‌کند", () => {
    expect(percentToBasisPoints(9)).toBe(900);
    expect(percentToBasisPoints(7.5)).toBe(750);
    expect(basisPointsToPercent(900)).toBe(9);
  });
});

describe("sumIntegers", () => {
  it("فهرست خالی صفر می‌دهد", () => {
    expect(sumIntegers([])).toBe(0);
  });

  it("مقادیر را جمع می‌زند", () => {
    expect(sumIntegers([100, 250, 375])).toBe(725);
  });

  it("مقدار اعشاری را رد می‌کند", () => {
    expect(() => sumIntegers([1, 2.5])).toThrow();
  });
});

describe("clamp", () => {
  it("مقدار را در بازه محدود می‌کند", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(42, 0, 100)).toBe(42);
  });
});
