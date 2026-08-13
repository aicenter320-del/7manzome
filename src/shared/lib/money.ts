import { assertInteger, mulDiv, percentOf, sumIntegers } from "./math";
import { abbreviateNumberFa, formatNumberFa, toEnglishDigits } from "./persian";

/**
 * پول.
 *
 * واحد پایه در تمام کد و دیتابیس **ریال** به‌صورت عدد صحیح است.
 * تومان فقط واحد نمایش است و هرگز ذخیره نمی‌شود. (ADR-0004)
 */

export const RIAL_PER_TOMAN = 10;

/** تبدیل تومان به ریال؛ برای ورودی‌های ادمین که با تومان کار می‌کند. */
export function tomanToRial(toman: number): number {
  assertInteger(toman, "مبلغ تومان");
  return toman * RIAL_PER_TOMAN;
}

/** تبدیل ریال به تومان برای نمایش. */
export function rialToToman(rial: number): number {
  assertInteger(rial, "مبلغ ریال");
  return mulDiv(rial, 1, RIAL_PER_TOMAN);
}

/** نمایش مبلغ به کاربر: همیشه تومان با ارقام فارسی. */
export function formatRial(rial: number, options?: { withUnit?: boolean }): string {
  const withUnit = options?.withUnit ?? true;
  const formatted = formatNumberFa(rialToToman(rial));
  return withUnit ? `${formatted} تومان` : formatted;
}

/** نمایش خلاصه مبلغ: «۵۲ میلیون تومان». برای جاهایی که دقت ریالی مهم نیست. */
export function formatRialShort(rial: number, options?: { withUnit?: boolean }): string {
  const withUnit = options?.withUnit ?? true;
  const formatted = abbreviateNumberFa(rialToToman(rial));
  return withUnit ? `${formatted} تومان` : formatted;
}

/**
 * تفسیر مبلغ وارد‌شده توسط کاربر (بر حسب تومان) و تبدیل به ریال.
 *
 * ارقام فارسی، جداکننده هزارگان و فاصله را تحمل می‌کند.
 * خروجی null یعنی ورودی معتبر نبود.
 */
export function parseTomanInput(input: string): number | null {
  const normalized = toEnglishDigits(input)
    .replace(/[،,٬\s]/g, "")
    .replace(/تومان|ریال/g, "")
    .trim();

  if (normalized === "" || !/^\d+$/.test(normalized)) return null;

  const toman = Number(normalized);
  if (!Number.isSafeInteger(toman)) return null;

  return tomanToRial(toman);
}

/** جمع مبالغ ریالی با بررسی سرریز. */
export function sumRial(values: readonly number[]): number {
  return sumIntegers(values);
}

/** محاسبه مالیات بر ارزش افزوده روی یک مبلغ پایه. */
export function calculateVat(baseRial: number, vatBasisPoints: number): number {
  return percentOf(baseRial, vatBasisPoints);
}

/** گرد کردن مبلغ ریالی به نزدیک‌ترین مضرب؛ مثلاً برای رند کردن به هزار تومان. */
export function roundRialTo(rial: number, stepRial: number): number {
  assertInteger(rial, "مبلغ ریال");
  assertInteger(stepRial, "گام گرد کردن");
  if (stepRial <= 0) return rial;
  return Math.round(rial / stepRial) * stepRial;
}
