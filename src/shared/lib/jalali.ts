import { toJalaali, toGregorian, isValidJalaaliDate, jalaaliMonthLength } from "jalaali-js";

import { formatNumberFa, formatPlainNumberFa, toPersianDigits } from "./persian";

/**
 * تاریخ شمسی.
 *
 * قانون: زمان‌ها همیشه به‌صورت epoch میلی‌ثانیه UTC ذخیره می‌شوند و تبدیل به
 * شمسی فقط در لایه نمایش انجام می‌گیرد. هیچ رشته تاریخ شمسی در دیتابیس نیست.
 *
 * محاسبات تقویمی روی منطقه زمانی تهران انجام می‌شود، وگرنه مرز روز برای
 * کاربر ایرانی یک روز جابه‌جا دیده می‌شود.
 */

export const TEHRAN_TIME_ZONE = "Asia/Tehran";

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export const JALALI_WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface JalaliDateTime extends JalaliDate {
  hour: number;
  minute: number;
  /** ۰ = شنبه ... ۶ = جمعه */
  weekday: number;
}

/** اجزای تاریخ و ساعت یک epoch در منطقه زمانی تهران. */
function tehranParts(epochMs: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekdayIndex: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory", {
    timeZone: TEHRAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const parts = new Map(
    formatter.formatToParts(new Date(epochMs)).map((part) => [part.type, part.value]),
  );

  // ترتیب هفته در تقویم ایرانی از شنبه شروع می‌شود.
  const weekdayOrder = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const weekdayIndex = Math.max(0, weekdayOrder.indexOf(parts.get("weekday") ?? "Sat"));

  return {
    year: Number(parts.get("year")),
    month: Number(parts.get("month")),
    day: Number(parts.get("day")),
    // ساعت ۲۴ در برخی محیط‌ها به‌جای ۰ برگردانده می‌شود.
    hour: Number(parts.get("hour")) % 24,
    minute: Number(parts.get("minute")),
    weekdayIndex,
  };
}

/** تبدیل epoch به تاریخ و ساعت شمسی در منطقه زمانی تهران. */
export function toJalali(epochMs: number): JalaliDateTime {
  const parts = tehranParts(epochMs);
  const jalali = toJalaali(parts.year, parts.month, parts.day);

  return {
    year: jalali.jy,
    month: jalali.jm,
    day: jalali.jd,
    hour: parts.hour,
    minute: parts.minute,
    weekday: parts.weekdayIndex,
  };
}

/**
 * تبدیل تاریخ شمسی به epoch میلی‌ثانیه.
 * ساعت پیش‌فرض ابتدای روز به وقت تهران است.
 */
export function fromJalali(
  date: JalaliDate,
  time?: { hour?: number; minute?: number },
): number {
  if (!isValidJalaaliDate(date.year, date.month, date.day)) {
    throw new Error(`تاریخ شمسی نامعتبر است: ${date.year}/${date.month}/${date.day}`);
  }

  const gregorian = toGregorian(date.year, date.month, date.day);
  const hour = time?.hour ?? 0;
  const minute = time?.minute ?? 0;

  // ابتدا زمان را به‌عنوان UTC می‌سازیم، سپس اختلاف تهران را جبران می‌کنیم.
  const asUtc = Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd, hour, minute);
  return asUtc - tehranOffsetMs(asUtc);
}

/** اختلاف زمانی تهران با UTC بر حسب میلی‌ثانیه در یک لحظه مشخص. */
function tehranOffsetMs(epochMs: number): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TEHRAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = new Map(
    formatter.formatToParts(new Date(epochMs)).map((part) => [part.type, part.value]),
  );

  const asIfUtc = Date.UTC(
    Number(parts.get("year")),
    Number(parts.get("month")) - 1,
    Number(parts.get("day")),
    Number(parts.get("hour")) % 24,
    Number(parts.get("minute")),
    Number(parts.get("second")),
  );

  return asIfUtc - epochMs;
}

/** تاریخ کامل: «۲۵ شهریور ۱۴۰۴». سال هرگز جداکننده هزارگان نمی‌گیرد. */
export function formatJalaliDate(epochMs: number): string {
  const { year, month, day } = toJalali(epochMs);
  return `${formatPlainNumberFa(day)} ${JALALI_MONTHS[month - 1]} ${formatPlainNumberFa(year)}`;
}

/** تاریخ با روز هفته: «چهارشنبه ۲۵ شهریور ۱۴۰۴» */
export function formatJalaliDateWithWeekday(epochMs: number): string {
  const { weekday } = toJalali(epochMs);
  return `${JALALI_WEEKDAYS[weekday]} ${formatJalaliDate(epochMs)}`;
}

/** تاریخ و ساعت: «۲۵ شهریور ۱۴۰۴، ساعت ۱۴:۳۰» */
export function formatJalaliDateTime(epochMs: number): string {
  const { hour, minute } = toJalali(epochMs);
  const clock = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return `${formatJalaliDate(epochMs)}، ساعت ${toPersianDigits(clock)}`;
}

/** فقط ساعت: «۱۴:۳۰» */
export function formatJalaliTime(epochMs: number): string {
  const { hour, minute } = toJalali(epochMs);
  const clock = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return toPersianDigits(clock);
}

/** قالب کوتاه عددی: «۱۴۰۴/۰۶/۲۵» */
export function formatJalaliShort(epochMs: number): string {
  const { year, month, day } = toJalali(epochMs);
  const text = `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
  return toPersianDigits(text);
}

/** زمان نسبی فارسی: «۳ روز پیش»، «همین حالا»، «۲ ماه بعد» */
export function formatRelativeFa(epochMs: number, nowMs: number = Date.now()): string {
  const diff = epochMs - nowMs;
  const abs = Math.abs(diff);
  const isFuture = diff > 0;

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return "همین حالا";

  const build = (value: number, unit: string): string =>
    isFuture ? `${formatNumberFa(value)} ${unit} بعد` : `${formatNumberFa(value)} ${unit} پیش`;

  if (abs < hour) return build(Math.floor(abs / minute), "دقیقه");
  if (abs < day) return build(Math.floor(abs / hour), "ساعت");
  if (abs < 30 * day) return build(Math.floor(abs / day), "روز");
  if (abs < 365 * day) return build(Math.floor(abs / (30 * day)), "ماه");

  return build(Math.floor(abs / (365 * day)), "سال");
}

/** ابتدای روز جاری به وقت تهران، به‌صورت epoch. مبنای گزارش‌های روزانه. */
export function startOfTehranDay(epochMs: number = Date.now()): number {
  const { year, month, day } = toJalali(epochMs);
  return fromJalali({ year, month, day });
}

/** ابتدای ماه شمسی جاری به‌صورت epoch. */
export function startOfJalaliMonth(epochMs: number = Date.now()): number {
  const { year, month } = toJalali(epochMs);
  return fromJalali({ year, month, day: 1 });
}

/** تعداد روزهای یک ماه شمسی. */
export function jalaliMonthDays(year: number, month: number): number {
  return jalaaliMonthLength(year, month);
}

/**
 * سن بر حسب ماه کامل.
 * محاسبه روی تقویم شمسی انجام می‌شود تا با درک کاربر ایرانی بخواند.
 */
export function ageInMonths(birthDateAt: number, nowMs: number = Date.now()): number {
  const birth = toJalali(birthDateAt);
  const now = toJalali(nowMs);

  let months = (now.year - birth.year) * 12 + (now.month - birth.month);

  // اگر روز ماه تولد نرسیده، آن ماه کامل نشده است.
  if (now.day < birth.day) months -= 1;

  return Math.max(0, months);
}

/** نمایش سن کودک: «۳ سال و ۴ ماه»، «۷ ماه»، «تازه به دنیا آمده» */
export function formatAge(birthDateAt: number, nowMs: number = Date.now()): string {
  const months = ageInMonths(birthDateAt, nowMs);

  if (months === 0) return "تازه به دنیا آمده";
  if (months < 12) return `${formatNumberFa(months)} ماه`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) return `${formatNumberFa(years)} سال`;

  return `${formatNumberFa(years)} سال و ${formatNumberFa(remainingMonths)} ماه`;
}

/**
 * epoch تولد بعدی کودک.
 * برای موتور مناسبت و یادآور تولد استفاده می‌شود.
 */
export function nextBirthday(birthDateAt: number, nowMs: number = Date.now()): number {
  const birth = toJalali(birthDateAt);
  const now = toJalali(nowMs);

  // اسفند ۳۰ در سال‌های غیرکبیسه وجود ندارد؛ به آخرین روز ماه محدود می‌شود.
  const clampDay = (year: number, month: number, day: number): number =>
    Math.min(day, jalaaliMonthLength(year, month));

  const thisYear = fromJalali({
    year: now.year,
    month: birth.month,
    day: clampDay(now.year, birth.month, birth.day),
  });

  if (thisYear >= startOfTehranDay(nowMs)) return thisYear;

  return fromJalali({
    year: now.year + 1,
    month: birth.month,
    day: clampDay(now.year + 1, birth.month, birth.day),
  });
}

/** تعداد روز تا تاریخ هدف، بر مبنای مرز روز تهران. */
export function daysUntil(targetEpochMs: number, nowMs: number = Date.now()): number {
  const start = startOfTehranDay(nowMs);
  const target = startOfTehranDay(targetEpochMs);
  return Math.round((target - start) / 86_400_000);
}

/** سال شمسی جاری؛ برای ساخت شماره سفارش. */
export function currentJalaliYear(nowMs: number = Date.now()): number {
  return toJalali(nowMs).year;
}
