import { describe, expect, it } from "vitest";

import {
  formatKarat,
  formatMg,
  fromPureMg,
  goldValueRial,
  gramToMg,
  mgToGram,
  parseGramInput,
  progressPercent,
  rialToGoldMg,
  sumMg,
  toPureMg,
} from "./gold";

describe("تبدیل واحد", () => {
  it("گرم و میلی‌گرم را دوطرفه تبدیل می‌کند", () => {
    expect(gramToMg(0.53)).toBe(530);
    expect(gramToMg(1)).toBe(1_000);
    expect(mgToGram(3_720)).toBe(3.72);
  });

  it("اعشار گرم را با گرد کردن به میلی‌گرم صحیح می‌برد", () => {
    expect(gramToMg(0.0001)).toBe(0);
    expect(gramToMg(0.0006)).toBe(1);
  });
});

describe("معادل طلای خالص", () => {
  it("طلای ۱۸ عیار را به معادل ۲۴ عیار تبدیل می‌کند", () => {
    // ۱ گرم طلای ۱۸ عیار = ۰.۷۵ گرم طلای خالص
    expect(toPureMg(1_000, 18)).toBe(750);
  });

  it("طلای ۲۴ عیار بدون تغییر می‌ماند", () => {
    expect(toPureMg(1_000, 24)).toBe(1_000);
  });

  it("تبدیل معکوس مقدار اولیه را برمی‌گرداند", () => {
    expect(fromPureMg(750, 18)).toBe(1_000);
  });

  it("وزن منفی را رد می‌کند", () => {
    expect(() => toPureMg(-100, 18)).toThrow(/منفی/);
  });
});

describe("goldValueRial", () => {
  it("ارزش ریالی وزن را محاسبه می‌کند", () => {
    // ۵۳۰ میلی‌گرم با قیمت ۳۵ میلیون ریال بر گرم
    expect(goldValueRial(530, 35_000_000)).toBe(18_550_000);
  });

  it("وزن صفر ارزش صفر دارد", () => {
    expect(goldValueRial(0, 35_000_000)).toBe(0);
  });
});

describe("rialToGoldMg", () => {
  it("مبلغ هدیه را به وزن طلا تبدیل می‌کند", () => {
    // ۵ میلیون تومان = ۵۰ میلیون ریال، قیمت ۳۵ میلیون ریال بر گرم
    expect(rialToGoldMg(50_000_000, 35_000_000)).toBe(1_428);
  });

  it("همیشه به سمت پایین گرد می‌کند تا بیش از پول دریافتی طلا ثبت نشود", () => {
    // ۱۰۰۰ ریال با قیمت ۳ ریال بر گرم = ۳۳۳۳۳۳.۳ میلی‌گرم
    expect(rialToGoldMg(1_000, 3)).toBe(333_333);
  });

  it("مبلغ صفر وزن صفر می‌دهد", () => {
    expect(rialToGoldMg(0, 35_000_000)).toBe(0);
  });

  it("قیمت نامعتبر را رد می‌کند تا فروش با قیمت صفر انجام نشود", () => {
    expect(() => rialToGoldMg(1_000_000, 0)).toThrow(/قیمت طلا نامعتبر/);
    expect(() => rialToGoldMg(1_000_000, -1)).toThrow(/قیمت طلا نامعتبر/);
  });
});

describe("sumMg", () => {
  it("مجموع مشارکت‌های یک گنجینه را می‌دهد", () => {
    // خاله + پدربزرگ + مامان
    expect(sumMg([80, 150, 100])).toBe(330);
  });
});

describe("formatMg", () => {
  it("وزن را با گرم و ارقام فارسی نمایش می‌دهد", () => {
    expect(formatMg(3_720)).toBe("۳٫۷۲ گرم");
  });

  it("صفرهای انتهایی را حذف می‌کند", () => {
    expect(formatMg(1_500)).toBe("۱٫۵ گرم");
    expect(formatMg(2_000)).toBe("۲ گرم");
  });

  it("وزن صفر را درست نمایش می‌دهد", () => {
    expect(formatMg(0)).toBe("۰ گرم");
  });

  it("صفر ابتدای بخش اعشاری را از دست نمی‌دهد", () => {
    // ۱٫۰۰۵ نباید به ۱٫۵ تبدیل شود.
    expect(formatMg(1_005)).toBe("۱٫۰۰۵ گرم");
    expect(formatMg(1_050)).toBe("۱٫۰۵ گرم");
  });

  it("وزن‌های بزرگ جداکننده هزارگان می‌گیرند", () => {
    expect(formatMg(1_250_000)).toBe("۱٬۲۵۰ گرم");
  });

  it("بدون واحد هم قابل استفاده است", () => {
    expect(formatMg(530, { withUnit: false })).toBe("۰٫۵۳");
  });
});

describe("parseGramInput", () => {
  it("ورودی لاتین را می‌پذیرد", () => {
    expect(parseGramInput("0.53")).toBe(530);
  });

  it("ارقام فارسی و ممیز فارسی را می‌پذیرد", () => {
    expect(parseGramInput("۰٫۵۳")).toBe(530);
  });

  it("واحد نوشته‌شده را تحمل می‌کند", () => {
    expect(parseGramInput("۱٫۵ گرم")).toBe(1_500);
  });

  it("ورودی نامعتبر null می‌دهد", () => {
    expect(parseGramInput("")).toBeNull();
    expect(parseGramInput("abc")).toBeNull();
    expect(parseGramInput("-1")).toBeNull();
  });
});

describe("progressPercent", () => {
  it("درصد پیشرفت به سمت هدف را می‌دهد", () => {
    // ۳.۷۲ گرم از هدف ۱۰ گرم
    expect(progressPercent(3_720, 10_000)).toBe(37);
  });

  it("بیش از صد درصد نمی‌شود", () => {
    expect(progressPercent(15_000, 10_000)).toBe(100);
  });

  it("هدف تعیین‌نشده صفر می‌دهد", () => {
    expect(progressPercent(5_000, 0)).toBe(0);
  });

  it("موجودی منفی را صفر در نظر می‌گیرد", () => {
    expect(progressPercent(-100, 10_000)).toBe(0);
  });
});

describe("formatKarat", () => {
  it("عیار را با ارقام فارسی نمایش می‌دهد", () => {
    expect(formatKarat(18)).toBe("۱۸ عیار");
  });
});
