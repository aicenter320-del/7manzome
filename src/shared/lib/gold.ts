import type { GoldKarat } from "@/shared/types/enums";

import { assertNonNegativeInteger, mulDiv, sumIntegers } from "./math";
import { formatNumberFa, formatPlainNumberFa, toEnglishDigits, toPersianDigits } from "./persian";

/**
 * طلا.
 *
 * واحد پایه در تمام کد و دیتابیس **میلی‌گرم** به‌صورت عدد صحیح است.
 * گرم فقط واحد نمایش است. (ADR-0004)
 */

export const MG_PER_GRAM = 1_000;
export const PURE_KARAT = 24;

/** عیاری که موجودی به کاربر با آن نمایش داده می‌شود (استاندارد بازار ایران). */
export const DISPLAY_KARAT: GoldKarat = 18;

export function gramToMg(gram: number): number {
  return Math.round(gram * MG_PER_GRAM);
}

export function mgToGram(mg: number): number {
  return mg / MG_PER_GRAM;
}

/**
 * معادل طلای ۲۴ عیار.
 *
 * طلای ۱۸ و ۲۴ عیار مستقیماً جمع‌پذیر نیستند؛ برای جمع‌زدن و مقایسه باید
 * همه به طلای خالص تبدیل شوند.
 */
export function toPureMg(amountMg: number, karat: GoldKarat): number {
  assertNonNegativeInteger(amountMg, "وزن طلا");
  return mulDiv(amountMg, karat, PURE_KARAT);
}

/** تبدیل معادل طلای خالص به وزن در عیار مشخص. */
export function fromPureMg(pureMg: number, karat: GoldKarat): number {
  assertNonNegativeInteger(pureMg, "وزن طلای خالص");
  return mulDiv(pureMg, PURE_KARAT, karat);
}

/**
 * ارزش ریالی یک وزن طلا.
 *
 * قیمت مرجع همیشه برای طلای خام همان عیار داده می‌شود، پس تبدیل عیار
 * اینجا انجام نمی‌شود؛ فقط تبدیل میلی‌گرم به گرم.
 */
export function goldValueRial(amountMg: number, pricePerGramRial: number): number {
  assertNonNegativeInteger(amountMg, "وزن طلا");
  assertNonNegativeInteger(pricePerGramRial, "قیمت هر گرم");
  return mulDiv(amountMg, pricePerGramRial, MG_PER_GRAM);
}

/**
 * تبدیل مبلغ ریالی به وزن طلا.
 *
 * این تابع قلب تبدیل «هدیه نقدی» به «طلای گنجینه» است.
 * حاصل به سمت پایین گرد می‌شود تا هرگز بیش از پول دریافتی طلا ثبت نکنیم.
 */
export function rialToGoldMg(amountRial: number, pricePerGramRial: number): number {
  assertNonNegativeInteger(amountRial, "مبلغ");

  if (pricePerGramRial <= 0) {
    throw new Error("قیمت طلا نامعتبر است؛ تبدیل مبلغ به طلا ممکن نیست.");
  }

  const product = amountRial * MG_PER_GRAM;

  if (!Number.isSafeInteger(product)) {
    throw new Error("سرریز در تبدیل مبلغ به وزن طلا");
  }

  return Math.floor(product / pricePerGramRial);
}

/** جمع وزن‌های طلا با بررسی سرریز. */
export function sumMg(values: readonly number[]): number {
  return sumIntegers(values);
}

/**
 * نمایش وزن طلا به کاربر: همیشه گرم با ارقام فارسی و حداکثر سه رقم اعشار.
 * صفرهای انتهایی حذف می‌شوند: ۱٫۵۰۰ → «۱٫۵»
 */
export function formatMg(
  amountMg: number,
  options?: { withUnit?: boolean; maxFractionDigits?: number },
): string {
  const withUnit = options?.withUnit ?? true;
  const maxFractionDigits = options?.maxFractionDigits ?? 3;

  const gram = mgToGram(amountMg);
  const fixed = gram.toFixed(maxFractionDigits);
  const trimmed = fixed.replace(/\.?0+$/, "");

  const [integerPart, fractionPart] = trimmed.split(".");

  // بخش اعشاری باید کاراکتر به کاراکتر تبدیل شود، نه به‌عنوان عدد؛
  // وگرنه صفر ابتدایی از دست می‌رود و ۱٫۰۰۵ به ۱٫۵ تبدیل می‌شود.
  const formatted = fractionPart
    ? `${formatNumberFa(Number(integerPart ?? 0))}٫${toPersianDigits(fractionPart)}`
    : formatNumberFa(Number(integerPart ?? 0));

  return withUnit ? `${formatted} گرم` : formatted;
}

/**
 * تفسیر وزن وارد‌شده توسط کاربر (بر حسب گرم) و تبدیل به میلی‌گرم.
 * خروجی null یعنی ورودی معتبر نبود.
 */
export function parseGramInput(input: string): number | null {
  const normalized = toEnglishDigits(input)
    .replace(/[٫،,٬\s]/g, (match) => (match === "٫" ? "." : ""))
    .replace(/گرم/g, "")
    .trim();

  if (normalized === "" || !/^\d+(\.\d+)?$/.test(normalized)) return null;

  const gram = Number(normalized);
  if (!Number.isFinite(gram) || gram < 0) return null;

  return gramToMg(gram);
}

/** برچسب فارسی عیار: «۱۸ عیار» */
export function formatKarat(karat: GoldKarat): string {
  return `${formatPlainNumberFa(karat)} عیار`;
}

/**
 * درصد پیشرفت به سمت هدف؛ عددی صحیح بین ۰ تا ۱۰۰.
 * هدف صفر یا منفی به معنی «هدفی تعیین نشده» است و صفر برمی‌گرداند.
 */
export function progressPercent(currentMg: number, targetMg: number): number {
  if (targetMg <= 0) return 0;
  const raw = mulDiv(Math.max(0, currentMg), 100, targetMg);
  return Math.min(100, raw);
}
