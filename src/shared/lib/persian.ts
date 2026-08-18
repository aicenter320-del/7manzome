/**
 * ابزارهای زبان فارسی.
 *
 * نکته مهم: ورودی عددی کاربر همیشه باید با toEnglishDigits نرمال شود.
 * کاربر با کیبورد فارسی ممکن است ارقام فارسی یا عربی تایپ کند و بدون
 * نرمال‌سازی، اعتبارسنجی شماره موبایل و مبلغ بی‌دلیل شکست می‌خورد.
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/** نیم‌فاصله؛ برای درست نوشتن «می‌شود» و مانند آن. */
export const ZWNJ = "\u200c";

/** جداسازی چپ‌به‌راست یونیکد؛ شماره داخل متن فارسی برعکس دیده نشود. */
export const LRI = "\u2066";
export const PDI = "\u2069";

/** تبدیل ارقام لاتین به فارسی. برای هر عددی که کاربر می‌بیند لازم است. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

/** تبدیل ارقام فارسی و عربی به لاتین. برای هر ورودی کاربر لازم است. */
export function toEnglishDigits(input: string): string {
  let output = "";

  for (const char of input) {
    const persianIndex = PERSIAN_DIGITS.indexOf(char as (typeof PERSIAN_DIGITS)[number]);
    if (persianIndex >= 0) {
      output += String(persianIndex);
      continue;
    }

    const arabicIndex = ARABIC_DIGITS.indexOf(char as (typeof ARABIC_DIGITS)[number]);
    if (arabicIndex >= 0) {
      output += String(arabicIndex);
      continue;
    }

    output += char;
  }

  return output;
}

/**
 * نرمال‌سازی متن فارسی برای ذخیره و جست‌وجو.
 *
 * حروف عربی «ي» و «ك» را به فارسی تبدیل و اعراب را حذف می‌کند تا جست‌وجو
 * روی «علي» و «علی» یک نتیجه بدهد.
 */
export function normalizePersianText(input: string): string {
  return input
    .replace(/[\u064A\u0649]/g, "ی")
    .replace(/\u0643/g, "ک")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u200B|\uFEFF/g, "")
    .trim();
}

/**
 * جداکننده هزارگان با ارقام فارسی: 1234567 → «۱٬۲۳۴٬۵۶۷»
 * ممیز اعشاری فارسی (U+066B) است، نه نقطه لاتین.
 */
export function formatNumberFa(value: number): string {
  const [integerPart, fractionPart] = Math.abs(value).toString().split(".");
  const grouped = (integerPart ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  const sign = value < 0 ? "−" : "";
  const joined = fractionPart ? `${grouped}٫${fractionPart}` : grouped;
  return sign + toPersianDigits(joined);
}

/**
 * عدد بدون جداکننده هزارگان، فقط با ارقام فارسی.
 * برای سال، شماره صفحه و مواردی که گروه‌بندی غلط است.
 */
export function formatPlainNumberFa(value: number): string {
  return toPersianDigits(value);
}

/** جداکننده هزارگان با ارقام لاتین؛ برای جاهایی که ارقام باید لاتین بمانند. */
export function formatNumberEn(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * خلاصه‌سازی اعداد بزرگ به فارسی: ۵۲٬۰۰۰٬۰۰۰ → «۵۲ میلیون»
 * برای نمایش ارزش گنجینه در جاهایی که دقت ریالی مهم نیست.
 */
export function abbreviateNumberFa(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000_000) {
    return `${formatNumberFa(round(value / 1_000_000_000_000, 1))} هزار میلیارد`;
  }
  if (abs >= 1_000_000_000) {
    return `${formatNumberFa(round(value / 1_000_000_000, 1))} میلیارد`;
  }
  if (abs >= 1_000_000) {
    return `${formatNumberFa(round(value / 1_000_000, 1))} میلیون`;
  }
  if (abs >= 1_000) {
    return `${formatNumberFa(round(value / 1_000, 0))} هزار`;
  }

  return formatNumberFa(value);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** حذف کاراکترهای کنترلی و فضاهای اضافی از متن ورودی کاربر. */
export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

/**
 * ساخت اسلاگ از عنوان فارسی.
 * حروف فارسی حفظ می‌شوند چون در URL قابل استفاده و برای سئوی فارسی مفیدند.
 */
export function slugify(input: string): string {
  return normalizePersianText(input)
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/** ماسک کردن داده حساس برای نمایش در فهرست‌ها: ۰۰۱۲۳۴۵۶۷۸ → «۰۰۱***۵۶۷۸» */
export function maskMiddle(input: string, visibleStart = 3, visibleEnd = 4): string {
  if (input.length <= visibleStart + visibleEnd) return input;
  const start = input.slice(0, visibleStart);
  const end = input.slice(-visibleEnd);
  return `${start}${"*".repeat(3)}${end}`;
}

/** نمایش شماره موبایل با فاصله خوانا: ۰۹۱۲ ۳۴۵ ۶۷۸۹ */
export function formatPhoneFa(phone: string): string {
  const digits = toEnglishDigits(phone).replace(/\D/g, "");
  if (digits.length !== 11) return toPersianDigits(phone);
  return toPersianDigits(
    `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`,
  );
}

/** متن را در ایزولهٔ چپ‌به‌راست می‌گذارد؛ برای نمایش شماره وسط جملهٔ فارسی. */
export function isolateLtr(text: string): string {
  return `${LRI}${text}${PDI}`;
}

/** نمایش شماره کارت بانکی در چهار گروه چهاررقمی. */
export function formatCardNumber(cardNumber: string): string {
  const digits = toEnglishDigits(cardNumber).replace(/\D/g, "");
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
}
