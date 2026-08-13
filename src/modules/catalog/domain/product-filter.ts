import { matchesAgeRange } from "@/modules/children/domain/child-age";

import type { Occasion, PricedVariant, ProductVariant } from "./types";

/**
 * منطق فیلتر و انتخاب گونه محصول.
 * خالص و تست‌پذیر؛ بدون دیتابیس.
 */

/** گونه‌های قابل فروش: فعال و موجود. */
export function sellableVariants<T extends ProductVariant>(
  variants: readonly T[],
): T[] {
  return variants.filter((variant) => variant.isActive && variant.stockQty > 0);
}

/** ارزان‌ترین گونه؛ مبنای نمایش «از ... تومان» در فهرست. */
export function cheapestVariant(variants: readonly PricedVariant[]): PricedVariant | null {
  const priced = variants.filter(
    (variant): variant is PricedVariant & { price: NonNullable<PricedVariant["price"]> } =>
      variant.price !== null,
  );

  if (priced.length === 0) return null;

  return priced.reduce((cheapest, variant) =>
    variant.price.unitPriceRial < cheapest.price.unitPriceRial ? variant : cheapest,
  );
}

/** بازه وزنی گونه‌های محصول؛ برای نمایش «۰.۵ تا ۲ گرم». */
export function weightRange(
  variants: readonly ProductVariant[],
): { minMg: number; maxMg: number } | null {
  if (variants.length === 0) return null;

  let minMg = Number.POSITIVE_INFINITY;
  let maxMg = 0;

  for (const variant of variants) {
    if (variant.weightMg < minMg) minMg = variant.weightMg;
    if (variant.weightMg > maxMg) maxMg = variant.weightMg;
  }

  return { minMg, maxMg };
}

/** مناسبت‌های متناسب با سن کودک. */
export function occasionsForAge(
  occasions: readonly Occasion[],
  ageMonths: number,
): Occasion[] {
  return occasions.filter((occasion) =>
    matchesAgeRange(ageMonths, {
      ageMinMonths: occasion.ageMinMonths,
      ageMaxMonths: occasion.ageMaxMonths,
    }),
  );
}

/** آیا محصول برای این سن مناسب است؟ */
export function productMatchesAge(
  product: { ageMinMonths: number | null; ageMaxMonths: number | null },
  ageMonths: number,
): boolean {
  return matchesAgeRange(ageMonths, product);
}

/** آیا این گونه امکان حکاکی دارد؟ */
export function supportsEngraving(variant: ProductVariant): boolean {
  return variant.engravingMaxChars > 0;
}

/** موجودی کافی برای این تعداد هست؟ */
export function hasStock(variant: ProductVariant, quantity: number): boolean {
  return variant.isActive && variant.stockQty >= quantity;
}

/** برچسب فارسی وضعیت موجودی برای نمایش در صفحه محصول. */
export function stockLabel(variant: ProductVariant): {
  label: string;
  tone: "success" | "warning" | "destructive";
} {
  if (!variant.isActive || variant.stockQty <= 0) {
    return { label: "ناموجود", tone: "destructive" };
  }

  if (variant.stockQty <= 3) {
    return { label: "موجودی محدود", tone: "warning" };
  }

  return { label: "موجود", tone: "success" };
}
