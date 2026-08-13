/**
 * ریاضیات صحیح.
 *
 * تمام محاسبات مالی پروژه از این توابع می‌گذرند. دلیل کامل در ADR-0004:
 * اعداد اعشاری IEEE-754 برای پول ساخته نشده‌اند و در یک سیستم گنجینه که
 * هدفش جمع شدن مقادیر خرد در طول سال‌هاست، خطا انباشته می‌شود.
 */

/**
 * محاسبه (value × multiplier) ÷ divisor با گرد کردن نیم‌به‌بالا.
 *
 * چرا این تابع لازم است: نوشتن مستقیم `value * multiplier / divisor` نتیجه
 * اعشاری می‌دهد و اگر بعدش گرد کنیم، ترتیب عملیات باعث خطای انباشته می‌شود.
 * اینجا ضرب اول انجام می‌شود تا دقت حفظ شود، بعد یک بار گرد می‌کنیم.
 */
export function mulDiv(value: number, multiplier: number, divisor: number): number {
  assertInteger(value, "value");
  assertInteger(multiplier, "multiplier");
  assertInteger(divisor, "divisor");

  if (divisor === 0) {
    throw new Error("تقسیم بر صفر در محاسبه مالی");
  }

  const product = value * multiplier;

  if (!Number.isSafeInteger(product)) {
    throw new Error(
      `سرریز در محاسبه مالی: ${value} × ${multiplier} از محدوده عدد صحیح ایمن خارج است`,
    );
  }

  return roundHalfUp(product, divisor);
}

/** تقسیم صحیح با گرد کردن نیم‌به‌بالا؛ برای اعداد منفی هم قرینه عمل می‌کند. */
export function roundHalfUp(numerator: number, denominator: number): number {
  if (denominator === 0) {
    throw new Error("تقسیم بر صفر در محاسبه مالی");
  }

  const sign = Math.sign(numerator) * Math.sign(denominator) || 1;
  const absNumerator = Math.abs(numerator);
  const absDenominator = Math.abs(denominator);

  const quotient = Math.floor(absNumerator / absDenominator);
  const remainder = absNumerator - quotient * absDenominator;

  // نیم‌به‌بالا: اگر باقی‌مانده دو برابر شده به مقسوم‌علیه رسید یا از آن گذشت.
  const rounded = remainder * 2 >= absDenominator ? quotient + 1 : quotient;

  return sign * rounded;
}

/** یک درصد از مقدار، با درصد بر حسب basis point (صدم درصد). ۹٪ یعنی ۹۰۰. */
export function percentOf(value: number, basisPoints: number): number {
  return mulDiv(value, basisPoints, BASIS_POINTS_DENOMINATOR);
}

export const BASIS_POINTS_DENOMINATOR = 10_000;

/** تبدیل درصد خوانا به basis point. ۹ → ۹۰۰ */
export function percentToBasisPoints(percent: number): number {
  return Math.round(percent * 100);
}

/** تبدیل basis point به درصد خوانا. ۹۰۰ → ۹ */
export function basisPointsToPercent(basisPoints: number): number {
  return basisPoints / 100;
}

export function assertInteger(value: number, label = "value"): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} باید عدد صحیح باشد، مقدار دریافتی: ${value}`);
  }
}

export function assertNonNegativeInteger(value: number, label = "value"): void {
  assertInteger(value, label);
  if (value < 0) {
    throw new Error(`${label} نمی‌تواند منفی باشد، مقدار دریافتی: ${value}`);
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** جمع ایمن فهرستی از اعداد صحیح با بررسی سرریز. */
export function sumIntegers(values: readonly number[]): number {
  let total = 0;
  for (const value of values) {
    assertInteger(value, "مقدار در جمع");
    total += value;
    if (!Number.isSafeInteger(total)) {
      throw new Error("سرریز در جمع مقادیر صحیح");
    }
  }
  return total;
}
