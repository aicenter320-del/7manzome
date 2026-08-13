import { formatKarat, goldValueRial, MG_PER_GRAM, mgToGram } from "@/shared/lib/gold";
import { assertNonNegativeInteger, percentOf, sumIntegers } from "@/shared/lib/math";
import { formatNumberFa } from "@/shared/lib/persian";
import { INVESTMENT_PRODUCT_KINDS } from "@/shared/types/enums";

import type { PriceBreakdown, PriceBreakdownRow, PricingParams } from "./types";

/**
 * موتور قیمت‌گذاری.
 *
 * تابع خالص و بدون هیچ وابستگی به دیتابیس، تا با تست واحد کامل پوشش داده شود.
 * فرمول‌ها در docs/02-domain/domain-rules.md بند ۹ مستند شده‌اند.
 */

export interface CalculatePriceInput {
  params: PricingParams;
  /** قیمت هر گرم طلای خام با همان عیار گونه. */
  goldPricePerGramRial: number;
  /** نرخ مالیات بر ارزش افزوده بر حسب صدم درصد. */
  vatBp: number;
  /** آیا شخصی‌سازی انتخاب شده است. */
  withPersonalization?: boolean;
}

export function calculateVariantPrice(input: CalculatePriceInput): PriceBreakdown {
  const { params, goldPricePerGramRial, vatBp } = input;

  assertNonNegativeInteger(params.weightMg, "وزن گونه");
  assertNonNegativeInteger(goldPricePerGramRial, "قیمت هر گرم طلا");

  if (goldPricePerGramRial <= 0) {
    throw new Error("قیمت طلا موجود نیست؛ محاسبه قیمت محصول ممکن نیست.");
  }

  const isInvestment = INVESTMENT_PRODUCT_KINDS.includes(params.kind);

  const goldValue = goldValueRial(params.weightMg, goldPricePerGramRial);

  const personalizationRial = input.withPersonalization ? params.personalizationRial : 0;

  if (isInvestment) {
    // محصول سرمایه‌ای: اجرت و سود ندارد؛ فقط حباب و بسته‌بندی.
    const unitPrice = sumIntegers([
      goldValue,
      params.premiumRial,
      params.packagingRial,
      personalizationRial,
    ]);

    return {
      weightMg: params.weightMg,
      karat: params.karat,
      goldPricePerGramRial,
      goldValueRial: goldValue,
      makingFeeBp: 0,
      makingFeeRial: 0,
      profitBp: 0,
      profitRial: 0,
      premiumRial: params.premiumRial,
      packagingRial: params.packagingRial,
      personalizationRial,
      vatBp: 0,
      vatRial: 0,
      unitPriceRial: unitPrice,
      isInvestment: true,
    };
  }

  const makingFee = percentOf(goldValue, params.makingFeeBp);
  const profit = percentOf(goldValue + makingFee, params.profitBp);

  // مالیات بر ارزش افزوده روی اجرت و سود اعمال می‌شود، نه روی ارزش طلای خام.
  const vat = percentOf(makingFee + profit, vatBp);

  const unitPrice = sumIntegers([
    goldValue,
    makingFee,
    profit,
    vat,
    params.packagingRial,
    personalizationRial,
  ]);

  return {
    weightMg: params.weightMg,
    karat: params.karat,
    goldPricePerGramRial,
    goldValueRial: goldValue,
    makingFeeBp: params.makingFeeBp,
    makingFeeRial: makingFee,
    profitBp: params.profitBp,
    profitRial: profit,
    premiumRial: 0,
    packagingRial: params.packagingRial,
    personalizationRial,
    vatBp,
    vatRial: vat,
    unitPriceRial: unitPrice,
    isInvestment: false,
  };
}

/**
 * جمع ردیف سفارش.
 *
 * جمع کل از ضرب قیمت واحد گردشده در تعداد به‌دست می‌آید، نه از محاسبه دوباره؛
 * تا عددی که کاربر می‌بیند با جمع ریز اقلام بخواند.
 */
export function lineTotal(unitPriceRial: number, quantity: number): number {
  assertNonNegativeInteger(unitPriceRial, "قیمت واحد");
  assertNonNegativeInteger(quantity, "تعداد");

  const total = unitPriceRial * quantity;

  if (!Number.isSafeInteger(total)) {
    throw new Error("سرریز در محاسبه جمع ردیف سفارش");
  }

  return total;
}

/**
 * ساخت ردیف‌های جدول شفافیت قیمت.
 *
 * این جدول یکی از تفاوت‌های اصلی برند با طلافروشی سنتی است؛ کاربر باید
 * دقیقاً ببیند پولش کجا می‌رود.
 */
export function toBreakdownRows(breakdown: PriceBreakdown): PriceBreakdownRow[] {
  const rows: PriceBreakdownRow[] = [
    {
      label: "ارزش طلای خام",
      amountRial: breakdown.goldValueRial,
      hint: `${formatNumberFa(mgToGram(breakdown.weightMg))} گرم، ${formatKarat(breakdown.karat)}`,
    },
  ];

  if (breakdown.isInvestment) {
    if (breakdown.premiumRial > 0) {
      rows.push({
        label: "حباب",
        amountRial: breakdown.premiumRial,
        hint: "تفاوت قیمت با ارزش ذاتی طلا",
      });
    }
  } else {
    if (breakdown.makingFeeRial > 0) {
      rows.push({
        label: "اجرت ساخت",
        amountRial: breakdown.makingFeeRial,
        hint: `${formatNumberFa(breakdown.makingFeeBp / 100)} درصد`,
      });
    }

    if (breakdown.profitRial > 0) {
      rows.push({
        label: "سود فروشنده",
        amountRial: breakdown.profitRial,
        hint: `${formatNumberFa(breakdown.profitBp / 100)} درصد`,
      });
    }

    if (breakdown.vatRial > 0) {
      rows.push({
        label: "مالیات بر ارزش افزوده",
        amountRial: breakdown.vatRial,
        hint: "روی اجرت و سود",
      });
    }
  }

  if (breakdown.packagingRial > 0) {
    rows.push({ label: "بسته‌بندی", amountRial: breakdown.packagingRial });
  }

  if (breakdown.personalizationRial > 0) {
    rows.push({ label: "شخصی‌سازی", amountRial: breakdown.personalizationRial });
  }

  rows.push({ label: "قیمت نهایی", amountRial: breakdown.unitPriceRial, emphasis: true });

  return rows;
}

/**
 * تخمین سود ناخالص یک ردیف؛ برای گزارش‌های مدیریتی.
 * ارزش طلای خام هزینه تلقی می‌شود، چون تامین آن با قیمت روز انجام می‌گیرد.
 */
export function grossMarginRial(breakdown: PriceBreakdown): number {
  return breakdown.isInvestment
    ? breakdown.premiumRial
    : breakdown.makingFeeRial + breakdown.profitRial;
}

/** آیا قیمت طلا کهنه شده است؟ */
export function isPriceStale(
  effectiveAt: number,
  maxAgeMinutes: number,
  nowMs: number = Date.now(),
): boolean {
  return nowMs - effectiveAt > maxAgeMinutes * 60_000;
}

/** سن قیمت به دقیقه؛ برای نمایش «آخرین به‌روزرسانی». */
export function priceAgeMinutes(effectiveAt: number, nowMs: number = Date.now()): number {
  return Math.max(0, Math.floor((nowMs - effectiveAt) / 60_000));
}

export { MG_PER_GRAM };
