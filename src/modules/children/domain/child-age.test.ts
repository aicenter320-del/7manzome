import { describe, expect, it } from "vitest";

import { fromJalali } from "@/shared/lib/jalali";

import {
  buildDisplayName,
  computeAgeInfo,
  isBirthdayNear,
  matchesAgeRange,
  upcomingBirthdayAge,
  validateBirthDate,
} from "./child-age";

const NOW = fromJalali({ year: 1404, month: 6, day: 25 });

describe("computeAgeInfo", () => {
  it("سن و برچسب فارسی را می‌دهد", () => {
    const birth = fromJalali({ year: 1400, month: 6, day: 25 });
    const info = computeAgeInfo(birth, NOW);

    expect(info.ageMonths).toBe(48);
    expect(info.ageLabel).toBe("۴ سال");
  });

  it("روزهای مانده به تولد بعدی را می‌دهد", () => {
    const birth = fromJalali({ year: 1400, month: 7, day: 5 });
    const info = computeAgeInfo(birth, NOW);

    expect(info.daysToBirthday).toBe(11);
  });
});

describe("validateBirthDate", () => {
  it("تاریخ گذشته معتبر است", () => {
    const birth = fromJalali({ year: 1402, month: 1, day: 1 });
    expect(validateBirthDate(birth, NOW)).toEqual({ ok: true });
  });

  it("تاریخ آینده را رد می‌کند", () => {
    const birth = fromJalali({ year: 1405, month: 1, day: 1 });
    const result = validateBirthDate(birth, NOW);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problem).toBe("future");
  });

  it("سن بالای هجده سال را رد می‌کند", () => {
    const birth = fromJalali({ year: 1380, month: 1, day: 1 });
    const result = validateBirthDate(birth, NOW);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problem).toBe("too_old");
  });

  it("امروز به‌عنوان تاریخ تولد نوزاد معتبر است", () => {
    expect(validateBirthDate(NOW, NOW)).toEqual({ ok: true });
  });
});

describe("matchesAgeRange", () => {
  it("بازه باز از دو طرف همه سن‌ها را می‌پذیرد", () => {
    expect(matchesAgeRange(24, { ageMinMonths: null, ageMaxMonths: null })).toBe(true);
  });

  it("سن داخل بازه را می‌پذیرد", () => {
    expect(matchesAgeRange(24, { ageMinMonths: 12, ageMaxMonths: 72 })).toBe(true);
  });

  it("سن کمتر از حد پایین را رد می‌کند", () => {
    expect(matchesAgeRange(6, { ageMinMonths: 12, ageMaxMonths: 72 })).toBe(false);
  });

  it("سن بیشتر از حد بالا را رد می‌کند", () => {
    expect(matchesAgeRange(90, { ageMinMonths: 12, ageMaxMonths: 72 })).toBe(false);
  });

  it("مرزها شامل هستند", () => {
    expect(matchesAgeRange(12, { ageMinMonths: 12, ageMaxMonths: 72 })).toBe(true);
    expect(matchesAgeRange(72, { ageMinMonths: 12, ageMaxMonths: 72 })).toBe(true);
  });
});

describe("isBirthdayNear", () => {
  it("تولد نزدیک را تشخیص می‌دهد", () => {
    const birth = fromJalali({ year: 1400, month: 7, day: 5 });
    expect(isBirthdayNear(birth, 30, NOW)).toBe(true);
  });

  it("تولد دور را نزدیک نمی‌داند", () => {
    const birth = fromJalali({ year: 1400, month: 11, day: 5 });
    expect(isBirthdayNear(birth, 30, NOW)).toBe(false);
  });
});

describe("upcomingBirthdayAge", () => {
  it("سنی که کودک وارد آن می‌شود را می‌دهد", () => {
    const birth = fromJalali({ year: 1400, month: 7, day: 5 });
    // تولد بعدی مهر ۱۴۰۴ است، یعنی چهار‌سالگی.
    expect(upcomingBirthdayAge(birth, NOW)).toBe(4);
  });
});

describe("buildDisplayName", () => {
  it("نام و نام خانوادگی را ترکیب می‌کند", () => {
    expect(buildDisplayName("آراد", "محمدی")).toBe("آراد محمدی");
  });

  it("بدون نام خانوادگی فقط نام را می‌دهد", () => {
    expect(buildDisplayName("آراد", null)).toBe("آراد");
  });
});
