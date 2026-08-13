/**
 * ماژول قیمت‌گذاری — API عمومی.
 *
 * مسئول: قیمت مرجع طلا و محاسبه شفاف قیمت نهایی محصول.
 * مستندات: docs/03-modules/pricing.md
 */

export {
  calculateVariantPrice,
  lineTotal,
  toBreakdownRows,
  grossMarginRial,
  isPriceStale,
  priceAgeMinutes,
} from "./domain/pricing-engine";

export type {
  GoldPrice,
  GoldPriceView,
  PriceBreakdown,
  PriceBreakdownRow,
  PricingParams,
} from "./domain/types";

export {
  getCurrentGoldPrice,
  tryGetCurrentGoldPrice,
  getAllCurrentGoldPrices,
  listGoldPriceHistory,
  recordManualPrice,
  refreshFromProvider,
  GoldPriceUnavailableError,
} from "./service/gold-price.service";

export { priceVariant, priceVariants, priceVariantAt } from "./service/pricing.service";

export type { GoldPriceProvider, FetchedGoldPrice } from "./service/providers/gold-price.provider";

export { setManualGoldPrice, refreshExternalGoldPrice } from "./actions/gold-price.actions";

export { PriceBreakdownTable } from "./ui/price-breakdown-table";
export { GoldPriceBadge } from "./ui/gold-price-badge";
