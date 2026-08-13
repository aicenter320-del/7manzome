import { z } from "zod";

import { toEnglishDigits } from "./persian";

/**
 * اعتبارسنجی‌های مشترک با پیام فارسی.
 *
 * همه ورودی‌های عددی ابتدا نرمال می‌شوند، چون کاربر با کیبورد فارسی
 * ممکن است ارقام فارسی تایپ کند.
 */

/** شماره موبایل ایرانی: ۱۱ رقم با شروع 09 */
export const phoneSchema = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
  .refine((value) => /^09\d{9}$/.test(value), {
    message: "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود",
  });

/**
 * کد ملی ایرانی با بررسی رقم کنترلی.
 * بررسی طول به‌تنهایی کافی نیست؛ کد ملی الگوریتم کنترلی دارد.
 */
export const nationalIdSchema = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
  .refine((value) => value.length === 10, { message: "کد ملی باید ۱۰ رقم باشد" })
  .refine((value) => isValidNationalId(value), { message: "کد ملی معتبر نیست" });

export function isValidNationalId(input: string): boolean {
  const digits = toEnglishDigits(input).replace(/\D/g, "");
  if (digits.length !== 10) return false;

  // کدهایی با تمام ارقام یکسان از نظر الگوریتمی معتبرند اما واقعی نیستند.
  if (/^(\d)\1{9}$/.test(digits)) return false;

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index);
  }

  const remainder = sum % 11;
  const checkDigit = Number(digits[9]);

  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
}

/** کد یک‌بارمصرف شش‌رقمی. */
export const otpCodeSchema = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
  .refine((value) => /^\d{6}$/.test(value), { message: "کد تایید باید ۶ رقم باشد" });

/** شماره کارت بانکی ۱۶ رقمی با الگوریتم لان. */
export const cardNumberSchema = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
  .refine((value) => value.length === 16, { message: "شماره کارت باید ۱۶ رقم باشد" })
  .refine((value) => isValidCardNumber(value), { message: "شماره کارت معتبر نیست" });

export function isValidCardNumber(input: string): boolean {
  const digits = toEnglishDigits(input).replace(/\D/g, "");
  if (digits.length !== 16) return false;

  let sum = 0;
  for (let index = 0; index < 16; index += 1) {
    const value = Number(digits[index]);
    const doubled = index % 2 === 0 ? value * 2 : value;
    sum += doubled > 9 ? doubled - 9 : doubled;
  }

  return sum % 10 === 0;
}

/** شبا؛ فقط بررسی قالب، نه رقم کنترلی. */
export const ibanSchema = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/\s/g, "").toUpperCase())
  .refine((value) => /^IR\d{24}$/.test(value), {
    message: "شماره شبا باید با IR شروع شود و ۲۶ کاراکتر باشد",
  });

/** کد پستی ایرانی ۱۰ رقمی. */
export const postalCodeSchema = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
  .refine((value) => /^\d{10}$/.test(value), { message: "کد پستی باید ۱۰ رقم باشد" });

/** شناسه nanoid؛ برای پارامترهای مسیر. */
export const idSchema = z
  .string()
  .min(10, "شناسه نامعتبر است")
  .max(40, "شناسه نامعتبر است")
  .regex(/^[A-Za-z0-9_-]+$/, "شناسه نامعتبر است");

/** مبلغ ریالی: عدد صحیح نامنفی. */
export const rialSchema = z
  .number()
  .int("مبلغ باید عدد صحیح ریالی باشد")
  .nonnegative("مبلغ نمی‌تواند منفی باشد");

/** وزن طلا به میلی‌گرم: عدد صحیح نامنفی. */
export const mgSchema = z
  .number()
  .int("وزن باید عدد صحیح میلی‌گرمی باشد")
  .nonnegative("وزن نمی‌تواند منفی باشد");

/** زمان به‌صورت epoch میلی‌ثانیه. */
export const epochSchema = z.number().int("زمان باید epoch میلی‌ثانیه باشد").positive();

/** نام فارسی؛ حروف فارسی، فاصله و نیم‌فاصله. */
export const persianNameSchema = z
  .string()
  .trim()
  .min(2, "نام باید حداقل ۲ حرف باشد")
  .max(50, "نام نمی‌تواند بیش از ۵۰ حرف باشد")
  .regex(/^[\u0600-\u06FF\s\u200c]+$/, "نام باید با حروف فارسی نوشته شود");

/** نام لاتین؛ برای حکاکی روی محصول. */
export const latinNameSchema = z
  .string()
  .trim()
  .min(2, "نام لاتین باید حداقل ۲ حرف باشد")
  .max(30, "نام لاتین نمی‌تواند بیش از ۳۰ حرف باشد")
  .regex(/^[A-Za-z\s'-]+$/, "نام لاتین باید فقط با حروف انگلیسی نوشته شود");

/** اسلاگ URL. */
export const slugSchema = z
  .string()
  .trim()
  .min(2, "اسلاگ باید حداقل ۲ کاراکتر باشد")
  .max(80, "اسلاگ نمی‌تواند بیش از ۸۰ کاراکتر باشد")
  .regex(/^[\u0600-\u06FFa-z0-9-]+$/, "اسلاگ فقط می‌تواند حرف، رقم و خط تیره داشته باشد");

/** توکن لینک هدیه. */
export const giftTokenSchema = z
  .string()
  .min(16, "لینک هدیه معتبر نیست")
  .max(64, "لینک هدیه معتبر نیست")
  .regex(/^[A-Za-z0-9_-]+$/, "لینک هدیه معتبر نیست");
