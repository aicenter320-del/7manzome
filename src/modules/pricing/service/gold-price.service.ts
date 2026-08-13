import "server-only";

import { getSetting } from "@/modules/content";
import { logger } from "@/server/logger";
import { DISPLAY_KARAT } from "@/shared/lib/gold";
import { GOLD_KARATS, type GoldKarat } from "@/shared/types/enums";

import { isPriceStale, priceAgeMinutes } from "../domain/pricing-engine";
import type { GoldPrice, GoldPriceView } from "../domain/types";
import { findLatestPrice, findPriceHistory, insertPrice } from "../repo/gold-price.repo";
import { activeGoldPriceProvider } from "./providers/gold-price.provider";

/**
 * قیمت مرجع طلا.
 *
 * قانون حیاتی: اگر قیمت موجود نباشد، فروش **متوقف** می‌شود.
 * هرگز با مقدار پیش‌فرض یا قیمت کهنه ادامه نمی‌دهیم.
 */

export class GoldPriceUnavailableError extends Error {
  constructor(karat: GoldKarat) {
    super(
      `قیمت طلای ${karat} عیار در سیستم ثبت نشده است. تا ثبت قیمت، امکان خرید وجود ندارد.`,
    );
    this.name = "GoldPriceUnavailableError";
  }
}

export type { GoldPriceView };

/** قیمت جاری یک عیار، به‌همراه اطلاعات تازگی آن. */
export async function getCurrentGoldPrice(
  karat: GoldKarat = DISPLAY_KARAT,
): Promise<GoldPriceView> {
  const row = await findLatestPrice(karat);

  if (!row) throw new GoldPriceUnavailableError(karat);

  const maxAgeMinutes = await getSetting("pricing.max_price_age_minutes");

  return {
    karat,
    pricePerGramRial: row.pricePerGramRial,
    source: row.source,
    sourceRef: row.sourceRef,
    effectiveAt: row.effectiveAt,
    ageMinutes: priceAgeMinutes(row.effectiveAt),
    isStale: isPriceStale(row.effectiveAt, maxAgeMinutes),
  };
}

/** قیمت جاری بدون پرتاب خطا؛ برای صفحاتی که باید حتی بدون قیمت بالا بیایند. */
export async function tryGetCurrentGoldPrice(
  karat: GoldKarat = DISPLAY_KARAT,
): Promise<GoldPriceView | null> {
  try {
    return await getCurrentGoldPrice(karat);
  } catch {
    return null;
  }
}

/** قیمت جاری همه عیارها؛ برای قفل کردن اسنپ‌شات قیمت در سفارش. */
export async function getAllCurrentGoldPrices(): Promise<Record<string, number>> {
  const snapshot: Record<string, number> = {};

  for (const karat of GOLD_KARATS) {
    const row = await findLatestPrice(karat);
    if (row) snapshot[String(karat)] = row.pricePerGramRial;
  }

  return snapshot;
}

export async function listGoldPriceHistory(
  karat: GoldKarat = DISPLAY_KARAT,
  limit = 50,
): Promise<GoldPrice[]> {
  const rows = await findPriceHistory(karat, limit);

  return rows.map((row) => ({
    karat,
    pricePerGramRial: row.pricePerGramRial,
    source: row.source,
    sourceRef: row.sourceRef,
    effectiveAt: row.effectiveAt,
  }));
}

/** ثبت قیمت دستی توسط ادمین. */
export async function recordManualPrice(input: {
  karat: GoldKarat;
  pricePerGramRial: number;
  note?: string;
  actorUserId: string;
}): Promise<GoldPrice> {
  const row = await insertPrice({
    karat: input.karat,
    pricePerGramRial: input.pricePerGramRial,
    source: "manual",
    sourceRef: input.note ?? null,
    createdByUserId: input.actorUserId,
  });

  logger.info("gold price recorded", {
    karat: input.karat,
    pricePerGramRial: input.pricePerGramRial,
    actorUserId: input.actorUserId,
  });

  return {
    karat: input.karat,
    pricePerGramRial: row.pricePerGramRial,
    source: row.source,
    sourceRef: row.sourceRef,
    effectiveAt: row.effectiveAt,
  };
}

/**
 * تلاش برای به‌روزرسانی قیمت از منبع بیرونی.
 * اگر منبع تنظیم نشده یا پاسخ نداد، چیزی ثبت نمی‌شود و null برمی‌گردد.
 */
export async function refreshFromProvider(karat: GoldKarat): Promise<GoldPrice | null> {
  const provider = activeGoldPriceProvider();
  const fetched = await provider.fetchPrice(karat);

  if (!fetched) return null;

  const row = await insertPrice({
    karat: fetched.karat,
    pricePerGramRial: fetched.pricePerGramRial,
    source: "external",
    sourceRef: fetched.sourceRef,
    effectiveAt: fetched.effectiveAt,
  });

  return {
    karat: fetched.karat,
    pricePerGramRial: row.pricePerGramRial,
    source: row.source,
    sourceRef: row.sourceRef,
    effectiveAt: row.effectiveAt,
  };
}
