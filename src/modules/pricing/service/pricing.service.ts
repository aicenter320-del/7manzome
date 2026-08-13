import "server-only";

import { getSetting } from "@/modules/content";
import type { GoldKarat } from "@/shared/types/enums";

import { calculateVariantPrice } from "../domain/pricing-engine";
import type { PriceBreakdown, PricingParams } from "../domain/types";
import { getCurrentGoldPrice } from "./gold-price.service";

/**
 * محاسبه قیمت با قیمت جاری طلا و نرخ مالیات جاری.
 *
 * منطق محاسبه در domain/pricing-engine است و خالص می‌ماند؛ این لایه فقط
 * ورودی‌های زنده (قیمت طلا و تنظیمات) را تامین می‌کند.
 */
export async function priceVariant(
  params: PricingParams,
  options?: { withPersonalization?: boolean },
): Promise<PriceBreakdown> {
  const [price, vatBp] = await Promise.all([
    getCurrentGoldPrice(params.karat),
    getSetting("pricing.vat_bp"),
  ]);

  return calculateVariantPrice({
    params,
    goldPricePerGramRial: price.pricePerGramRial,
    vatBp,
    ...(options?.withPersonalization ? { withPersonalization: true } : {}),
  });
}

/**
 * محاسبه قیمت چند گونه با یک بار خواندن قیمت هر عیار.
 * برای صفحه فهرست محصولات که ممکن است ده‌ها گونه داشته باشد.
 */
export async function priceVariants(
  items: readonly { key: string; params: PricingParams; withPersonalization?: boolean }[],
): Promise<Map<string, PriceBreakdown>> {
  const vatBp = await getSetting("pricing.vat_bp");

  const karats = [...new Set(items.map((item) => item.params.karat))];
  const priceByKarat = new Map<GoldKarat, number>();

  for (const karat of karats) {
    const price = await getCurrentGoldPrice(karat);
    priceByKarat.set(karat, price.pricePerGramRial);
  }

  const result = new Map<string, PriceBreakdown>();

  for (const item of items) {
    const pricePerGram = priceByKarat.get(item.params.karat);
    if (!pricePerGram) continue;

    result.set(
      item.key,
      calculateVariantPrice({
        params: item.params,
        goldPricePerGramRial: pricePerGram,
        vatBp,
        ...(item.withPersonalization ? { withPersonalization: true } : {}),
      }),
    );
  }

  return result;
}

/** محاسبه قیمت با قیمت طلای مشخص (نه جاری)؛ برای بازسازی سفارش تاریخی. */
export async function priceVariantAt(
  params: PricingParams,
  goldPricePerGramRial: number,
  vatBp: number,
  options?: { withPersonalization?: boolean },
): Promise<PriceBreakdown> {
  return calculateVariantPrice({
    params,
    goldPricePerGramRial,
    vatBp,
    ...(options?.withPersonalization ? { withPersonalization: true } : {}),
  });
}
