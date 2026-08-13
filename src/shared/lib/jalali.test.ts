import { describe, expect, it } from "vitest";

import {
  ageInMonths,
  currentJalaliYear,
  daysUntil,
  formatAge,
  formatJalaliDate,
  formatJalaliShort,
  formatRelativeFa,
  fromJalali,
  nextBirthday,
  startOfTehranDay,
  toJalali,
} from "./jalali";

/** ۲۵ شهریور ۱۴۰۴ برابر ۱۶ سپتامبر ۲۰۲۵ است. */
const SHAHRIVAR_25_1404 = fromJalali({ year: 1404, month: 6, day: 25 });

describe("تبدیل شمسی و میلادی", () => {
  it("تاریخ شمسی را به epoch و برعکس تبدیل می‌کند", () => {
    const jalali = toJalali(SHAHRIVAR_25_1404);
    expect(jalali.year).toBe(1404);
    expect(jalali.month).toBe(6);
    expect(jalali.day).toBe(25);
  });

  it("نوروز را درست تشخیص می‌دهد", () => {
    const nowruz = fromJalali({ year: 1404, month: 1, day: 1 });
    const jalali = toJalali(nowruz);
    expect(jalali.month).toBe(1);
    expect(jalali.day).toBe(1);
  });

  it("تاریخ شمسی نامعتبر را رد می‌کند", () => {
    expect(() => fromJalali({ year: 1404, month: 13, day: 1 })).toThrow(/نامعتبر/);
    expect(() => fromJalali({ year: 1404, month: 7, day: 31 })).toThrow(/نامعتبر/);
  });

  it("رفت‌وبرگشت برای همه ماه‌ها پایدار است", () => {
    for (let month = 1; month <= 12; month += 1) {
      const epoch = fromJalali({ year: 1404, month, day: 15 });
      const back = toJalali(epoch);
      expect(back).toMatchObject({ year: 1404, month, day: 15 });
    }
  });
});

describe("قالب‌بندی تاریخ", () => {
  it("تاریخ کامل فارسی می‌دهد", () => {
    expect(formatJalaliDate(SHAHRIVAR_25_1404)).toBe("۲۵ شهریور ۱۴۰۴");
  });

  it("قالب کوتاه عددی می‌دهد", () => {
    expect(formatJalaliShort(SHAHRIVAR_25_1404)).toBe("۱۴۰۴/۰۶/۲۵");
  });
});

describe("formatRelativeFa", () => {
  const now = SHAHRIVAR_25_1404;

  it("زمان بسیار نزدیک را «همین حالا» می‌گوید", () => {
    expect(formatRelativeFa(now - 5_000, now)).toBe("همین حالا");
  });

  it("گذشته را با «پیش» می‌گوید", () => {
    expect(formatRelativeFa(now - 3 * 86_400_000, now)).toBe("۳ روز پیش");
  });

  it("آینده را با «بعد» می‌گوید", () => {
    expect(formatRelativeFa(now + 2 * 3_600_000, now)).toBe("۲ ساعت بعد");
  });
});

describe("ageInMonths", () => {
  it("سن را بر حسب ماه کامل می‌دهد", () => {
    const birth = fromJalali({ year: 1400, month: 6, day: 25 });
    expect(ageInMonths(birth, SHAHRIVAR_25_1404)).toBe(48);
  });

  it("ماه ناتمام را حساب نمی‌کند", () => {
    const birth = fromJalali({ year: 1400, month: 6, day: 26 });
    expect(ageInMonths(birth, SHAHRIVAR_25_1404)).toBe(47);
  });

  it("نوزاد تازه متولد صفر ماه است", () => {
    expect(ageInMonths(SHAHRIVAR_25_1404, SHAHRIVAR_25_1404)).toBe(0);
  });
});

describe("formatAge", () => {
  it("نوزاد را با عبارت مناسب نشان می‌دهد", () => {
    expect(formatAge(SHAHRIVAR_25_1404, SHAHRIVAR_25_1404)).toBe("تازه به دنیا آمده");
  });

  it("سن زیر یک سال را با ماه می‌گوید", () => {
    const birth = fromJalali({ year: 1404, month: 1, day: 25 });
    expect(formatAge(birth, SHAHRIVAR_25_1404)).toBe("۵ ماه");
  });

  it("سن بالای یک سال را با سال و ماه می‌گوید", () => {
    const birth = fromJalali({ year: 1401, month: 2, day: 25 });
    expect(formatAge(birth, SHAHRIVAR_25_1404)).toBe("۳ سال و ۴ ماه");
  });

  it("سن رُند را فقط با سال می‌گوید", () => {
    const birth = fromJalali({ year: 1400, month: 6, day: 25 });
    expect(formatAge(birth, SHAHRIVAR_25_1404)).toBe("۴ سال");
  });
});

describe("nextBirthday", () => {
  it("تولد امسال را می‌دهد اگر هنوز نرسیده", () => {
    const birth = fromJalali({ year: 1400, month: 8, day: 10 });
    const next = nextBirthday(birth, SHAHRIVAR_25_1404);
    expect(toJalali(next)).toMatchObject({ year: 1404, month: 8, day: 10 });
  });

  it("تولد سال بعد را می‌دهد اگر گذشته باشد", () => {
    const birth = fromJalali({ year: 1400, month: 3, day: 10 });
    const next = nextBirthday(birth, SHAHRIVAR_25_1404);
    expect(toJalali(next)).toMatchObject({ year: 1405, month: 3, day: 10 });
  });

  it("تولد امروز را همین امروز می‌داند", () => {
    const birth = fromJalali({ year: 1400, month: 6, day: 25 });
    expect(nextBirthday(birth, SHAHRIVAR_25_1404)).toBe(startOfTehranDay(SHAHRIVAR_25_1404));
  });

  it("متولد ۳۰ اسفند را به آخرین روز اسفند محدود می‌کند", () => {
    // ۱۴۰۳ کبیسه است و ۳۰ اسفند دارد؛ ۱۴۰۴ ندارد.
    const birth = fromJalali({ year: 1403, month: 12, day: 30 });
    const next = nextBirthday(birth, SHAHRIVAR_25_1404);
    const result = toJalali(next);
    expect(result.month).toBe(12);
    expect(result.day).toBeLessThanOrEqual(30);
  });
});

describe("daysUntil", () => {
  it("فاصله روزها را می‌دهد", () => {
    const target = fromJalali({ year: 1404, month: 7, day: 5 });
    expect(daysUntil(target, SHAHRIVAR_25_1404)).toBe(11);
  });

  it("امروز صفر است", () => {
    expect(daysUntil(SHAHRIVAR_25_1404, SHAHRIVAR_25_1404)).toBe(0);
  });
});

describe("startOfTehranDay", () => {
  it("به ابتدای روز تهران برمی‌گردد", () => {
    const noon = SHAHRIVAR_25_1404 + 12 * 3_600_000;
    expect(startOfTehranDay(noon)).toBe(SHAHRIVAR_25_1404);
  });
});

describe("currentJalaliYear", () => {
  it("سال شمسی را می‌دهد", () => {
    expect(currentJalaliYear(SHAHRIVAR_25_1404)).toBe(1404);
  });
});
