import { ageInMonths, daysUntil, formatAge, nextBirthday, toJalali } from "@/shared/lib/jalali";

/**
 * محاسبات سن کودک و موتور مناسبت.
 *
 * منطق خالص و تست‌پذیر. سن هیچ‌جا ذخیره نمی‌شود؛ همیشه از تاریخ تولد
 * محاسبه می‌گردد تا هرگز کهنه نشود.
 */

/** حداکثر سن مجاز برای پروفایل کودک: ۱۸ سال. */
export const MAX_CHILD_AGE_MONTHS = 18 * 12;

export interface AgeInfo {
  ageMonths: number;
  ageLabel: string;
  nextBirthdayAt: number;
  daysToBirthday: number;
}

export function computeAgeInfo(birthDateAt: number, nowMs: number = Date.now()): AgeInfo {
  const nextAt = nextBirthday(birthDateAt, nowMs);

  return {
    ageMonths: ageInMonths(birthDateAt, nowMs),
    ageLabel: formatAge(birthDateAt, nowMs),
    nextBirthdayAt: nextAt,
    daysToBirthday: daysUntil(nextAt, nowMs),
  };
}

export type BirthDateProblem = "future" | "too_old";

export const BIRTH_DATE_MESSAGES: Record<BirthDateProblem, string> = {
  future: "تاریخ تولد نمی‌تواند در آینده باشد.",
  too_old: "پروفایل هفت منظومه برای کودکان زیر هجده سال است.",
};

/** اعتبارسنجی تاریخ تولد کودک. */
export function validateBirthDate(
  birthDateAt: number,
  nowMs: number = Date.now(),
): { ok: true } | { ok: false; problem: BirthDateProblem; message: string } {
  if (birthDateAt > nowMs) {
    return { ok: false, problem: "future", message: BIRTH_DATE_MESSAGES.future };
  }

  if (ageInMonths(birthDateAt, nowMs) > MAX_CHILD_AGE_MONTHS) {
    return { ok: false, problem: "too_old", message: BIRTH_DATE_MESSAGES.too_old };
  }

  return { ok: true };
}

/**
 * مناسبت‌های پیشنهادی بر اساس سن کودک.
 *
 * موتور مناسبت (بند ۳۰ سند محصول): سیستم سن کودک را می‌داند و می‌تواند
 * هدیه مناسب پیشنهاد دهد. اینجا فقط قاعده انتخاب است؛ داده مناسبت‌ها در
 * جدول occasions است.
 */
export function matchesAgeRange(
  ageMonths: number,
  range: { ageMinMonths: number | null; ageMaxMonths: number | null },
): boolean {
  if (range.ageMinMonths !== null && ageMonths < range.ageMinMonths) return false;
  if (range.ageMaxMonths !== null && ageMonths > range.ageMaxMonths) return false;
  return true;
}

/** آیا تولد کودک نزدیک است؟ مبنای یادآور و پیشنهاد ساخت گنجینه رویدادی. */
export function isBirthdayNear(
  birthDateAt: number,
  withinDays = 30,
  nowMs: number = Date.now(),
): boolean {
  const days = daysUntil(nextBirthday(birthDateAt, nowMs), nowMs);
  return days >= 0 && days <= withinDays;
}

/** سالی که کودک در تولد بعدی وارد آن می‌شود؛ برای متن «تولد ۵ سالگی». */
export function upcomingBirthdayAge(
  birthDateAt: number,
  nowMs: number = Date.now(),
): number {
  const birthYear = toJalali(birthDateAt).year;
  const nextYear = toJalali(nextBirthday(birthDateAt, nowMs)).year;
  return nextYear - birthYear;
}

/** نام نمایشی کودک؛ فقط نام کوچک در جاهای عمومی استفاده می‌شود. */
export function buildDisplayName(firstName: string, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}
