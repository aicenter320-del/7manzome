import { normalizePersianText, sanitizeText } from "@/shared/lib/persian";

/**
 * قوانین حکاکی.
 *
 * محدودیت طول به گونه محصول بستگی دارد، نه یک عدد ثابت. متن حکاکی باید
 * پاک‌سازی شود چون روی فلز اجرا می‌شود و کاراکتر غیرمجاز عملاً غیرقابل حکاکی است.
 */

/** حروف مجاز حکاکی فارسی: حروف فارسی، فاصله و نیم‌فاصله. */
const PERSIAN_ENGRAVING_PATTERN = /^[\u0600-\u06FF\s\u200c]+$/;

/** حروف مجاز حکاکی لاتین. */
const LATIN_ENGRAVING_PATTERN = /^[A-Za-z0-9\s.'&-]+$/;

export type EngravingProblem = "empty" | "too_long" | "invalid_chars" | "not_supported";

export const ENGRAVING_MESSAGES: Record<EngravingProblem, string> = {
  empty: "متن حکاکی را وارد کنید.",
  too_long: "متن حکاکی از ظرفیت این محصول بیشتر است.",
  invalid_chars: "متن حکاکی فقط می‌تواند حرف، رقم و فاصله داشته باشد.",
  not_supported: "این محصول قابلیت حکاکی ندارد.",
};

export type EngravingValidation =
  | { ok: true; text: string }
  | { ok: false; problem: EngravingProblem; message: string };

/**
 * اعتبارسنجی و پاک‌سازی متن حکاکی.
 * خروجی موفق، متن نرمال‌شده آماده ذخیره است.
 */
export function validateEngravingText(
  raw: string,
  options: { maxChars: number; script: "persian" | "latin" },
): EngravingValidation {
  const reject = (problem: EngravingProblem): EngravingValidation => ({
    ok: false,
    problem,
    message: ENGRAVING_MESSAGES[problem],
  });

  if (options.maxChars <= 0) return reject("not_supported");

  const cleaned = sanitizeText(normalizePersianText(raw), options.maxChars + 1);

  if (cleaned.length === 0) return reject("empty");
  if (cleaned.length > options.maxChars) return reject("too_long");

  const pattern =
    options.script === "persian" ? PERSIAN_ENGRAVING_PATTERN : LATIN_ENGRAVING_PATTERN;

  if (!pattern.test(cleaned)) return reject("invalid_chars");

  return { ok: true, text: cleaned };
}

/**
 * تخمین جاگیری متن روی محصول.
 *
 * حروف فارسی به‌هم‌چسبیده‌اند و عرض کمتری از حروف لاتین می‌گیرند، پس
 * شمارش خالی کاراکتر برای تخمین جا کافی نیست.
 */
export function estimateEngravingFit(
  text: string,
  maxChars: number,
): { usedRatio: number; fits: boolean; remainingChars: number } {
  const remainingChars = Math.max(0, maxChars - text.length);

  return {
    usedRatio: maxChars > 0 ? Math.min(1, text.length / maxChars) : 1,
    fits: text.length <= maxChars,
    remainingChars,
  };
}

/** آیا متن حکاکی فارسی است؟ برای انتخاب فونت پیش‌نمایش. */
export function detectScript(text: string): "persian" | "latin" {
  return /[\u0600-\u06FF]/.test(text) ? "persian" : "latin";
}
