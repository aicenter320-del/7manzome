import type { GoldKarat, GoldPriceSource, ProductKind } from "@/shared/types/enums";

export interface GoldPrice {
  karat: GoldKarat;
  pricePerGramRial: number;
  source: GoldPriceSource;
  sourceRef: string | null;
  effectiveAt: number;
}

/** قیمت مرجع به‌همراه سن و وضعیت تازگی، برای نمایش در رابط کاربری. */
export interface GoldPriceView extends GoldPrice {
  ageMinutes: number;
  isStale: boolean;
}

/** پارامترهای قیمت‌گذاری یک گونه محصول. */
export interface PricingParams {
  kind: ProductKind;
  weightMg: number;
  karat: GoldKarat;
  makingFeeBp: number;
  profitBp: number;
  premiumRial: number;
  packagingRial: number;
  personalizationRial: number;
}

/**
 * ریزمحاسبات کامل قیمت.
 *
 * خروجی موتور قیمت همیشه همین شیء است، نه یک عدد. دلیل: همین شیء هم به
 * کاربر نشان داده می‌شود (شفافیت) و هم در order_items ذخیره می‌گردد (قفل قیمت).
 */
export interface PriceBreakdown {
  weightMg: number;
  karat: GoldKarat;
  goldPricePerGramRial: number;

  goldValueRial: number;
  makingFeeBp: number;
  makingFeeRial: number;
  profitBp: number;
  profitRial: number;
  premiumRial: number;
  packagingRial: number;
  personalizationRial: number;
  vatBp: number;
  vatRial: number;

  /** قیمت نهایی یک عدد از این گونه. */
  unitPriceRial: number;

  /** آیا محصول سرمایه‌ای است (سکه یا شمش) و فرمول ساده‌تری دارد. */
  isInvestment: boolean;
}

/** ردیف قابل نمایش در جدول شفافیت قیمت صفحه محصول. */
export interface PriceBreakdownRow {
  label: string;
  amountRial: number;
  /** توضیح کوتاه برای کاربر؛ اختیاری. */
  hint?: string;
  emphasis?: boolean;
}
