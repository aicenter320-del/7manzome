import { describe, expect, it } from "vitest";

import {
  abbreviateNumberFa,
  formatCardNumber,
  formatNumberFa,
  formatPhoneFa,
  maskMiddle,
  normalizePersianText,
  sanitizeText,
  slugify,
  toEnglishDigits,
  toPersianDigits,
} from "./persian";

describe("تبدیل ارقام", () => {
  it("ارقام لاتین را به فارسی تبدیل می‌کند", () => {
    expect(toPersianDigits("1404/06/25")).toBe("۱۴۰۴/۰۶/۲۵");
  });

  it("ارقام فارسی را به لاتین تبدیل می‌کند", () => {
    expect(toEnglishDigits("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
  });

  it("ارقام عربی را هم به لاتین تبدیل می‌کند", () => {
    // کیبوردهای عربی ارقام متفاوتی می‌فرستند؛ این باگ‌ساز کلاسیک است.
    expect(toEnglishDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
  });

  it("حروف غیرعددی را دست‌نخورده نگه می‌دارد", () => {
    expect(toEnglishDigits("شماره ۱۲۳")).toBe("شماره 123");
  });
});

describe("formatNumberFa", () => {
  it("جداکننده هزارگان می‌گذارد", () => {
    expect(formatNumberFa(1_234_567)).toBe("۱٬۲۳۴٬۵۶۷");
  });

  it("اعداد کوچک را بدون جداکننده می‌دهد", () => {
    expect(formatNumberFa(42)).toBe("۴۲");
  });

  it("اعداد منفی را با علامت درست می‌دهد", () => {
    expect(formatNumberFa(-500)).toBe("−۵۰۰");
  });
});

describe("abbreviateNumberFa", () => {
  it("میلیون را خلاصه می‌کند", () => {
    expect(abbreviateNumberFa(52_000_000)).toBe("۵۲ میلیون");
  });

  it("میلیارد را خلاصه می‌کند", () => {
    expect(abbreviateNumberFa(2_500_000_000)).toBe("۲٫۵ میلیارد");
  });

  it("هزار را خلاصه می‌کند", () => {
    expect(abbreviateNumberFa(500_000)).toBe("۵۰۰ هزار");
  });
});

describe("normalizePersianText", () => {
  it("حروف عربی را به فارسی تبدیل می‌کند", () => {
    expect(normalizePersianText("علي")).toBe("علی");
    expect(normalizePersianText("كودك")).toBe("کودک");
  });

  it("اعراب را حذف می‌کند", () => {
    expect(normalizePersianText("مُحَمَّد")).toBe("محمد");
  });
});

describe("sanitizeText", () => {
  it("فاصله‌های اضافی را جمع می‌کند", () => {
    expect(sanitizeText("سلام    دنیا")).toBe("سلام دنیا");
  });

  it("طول را محدود می‌کند", () => {
    expect(sanitizeText("۱۲۳۴۵۶۷۸۹۰", 5)).toHaveLength(5);
  });

  it("کاراکترهای کنترلی را حذف می‌کند", () => {
    expect(sanitizeText("سلام\u0000دنیا")).toBe("سلامدنیا");
  });
});

describe("slugify", () => {
  it("عنوان فارسی را به اسلاگ تبدیل می‌کند", () => {
    expect(slugify("دستبند اسم آراد")).toBe("دستبند-اسم-آراد");
  });

  it("عنوان لاتین را به حروف کوچک می‌برد", () => {
    expect(slugify("Gold Coin 1g")).toBe("gold-coin-1g");
  });

  it("خط تیره‌های تکراری را جمع می‌کند", () => {
    expect(slugify("سکه   طلا")).toBe("سکه-طلا");
  });
});

describe("maskMiddle", () => {
  it("میان داده حساس را می‌پوشاند", () => {
    expect(maskMiddle("0012345678")).toBe("001***5678");
  });

  it("رشته کوتاه را تغییر نمی‌دهد", () => {
    expect(maskMiddle("123")).toBe("123");
  });
});

describe("formatPhoneFa", () => {
  it("شماره موبایل را با فاصله خوانا نمایش می‌دهد", () => {
    expect(formatPhoneFa("09123456789")).toBe("۰۹۱۲ ۳۴۵ ۶۷۸۹");
  });
});

describe("formatCardNumber", () => {
  it("شماره کارت را چهارتایی جدا می‌کند", () => {
    expect(formatCardNumber("6104337812345678")).toBe("6104-3378-1234-5678");
  });
});
