import "server-only";

import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { env } from "@/shared/config/env";

/**
 * ابزارهای رمزنگاری احراز هویت.
 *
 * قانون: کد یک‌بارمصرف و توکن سشن هرگز به‌صورت متن خام ذخیره نمی‌شوند.
 * فقط هش HMAC آن‌ها در دیتابیس می‌نشیند، تا دسترسی خواندن به دیتابیس
 * به‌تنهایی اجازه جعل ندهد.
 */

/** هش HMAC-SHA256 با کلید سشن. */
export function hashSecret(value: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}

/** مقایسه امن در برابر حملات زمان‌سنجی. */
export function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  // timingSafeEqual روی طول‌های نامساوی خطا می‌دهد، پس اول طول را می‌سنجیم.
  if (bufferA.length !== bufferB.length) return false;

  return timingSafeEqual(bufferA, bufferB);
}

/** توکن تصادفی امن برای سشن و لینک هدیه. */
export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

/** کد یک‌بارمصرف عددی؛ با randomInt رمزنگاری‌شده، نه Math.random. */
export function generateOtpCode(digits = 6): string {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits;
  return String(randomInt(min, max));
}

/** کد خوانای انسانی برای کارت هدیه؛ حروف مبهم حذف شده‌اند. */
export function generateHumanCode(length = 8): string {
  // I، O، 0، 1 و L حذف شده‌اند تا هنگام خواندن از روی کارت اشتباه نشود.
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);

  let code = "";
  for (let index = 0; index < length; index += 1) {
    code += alphabet[(bytes[index] ?? 0) % alphabet.length];
  }

  return code;
}
