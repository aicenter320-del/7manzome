import "server-only";

import { getSetting } from "@/modules/content";
import { logger } from "@/server/logger";
import { DISPLAY_KARAT } from "@/shared/lib/gold";
import { GOLD_KARATS, type GoldKarat } from "@/shared/types/enums";

import { applyLiveMarkup } from "../domain/live-gold-quote";
import { isPriceStale, priceAgeMinutes } from "../domain/pricing-engine";
import type { GoldPrice, GoldPriceView } from "../domain/types";
import { findLatestPrice, findPriceHistory, insertPrice } from "../repo/gold-price.repo";
import {
  activeGoldPriceProvider,
  getCachedLiveQuotes,
} from "./providers/gold-price.provider";

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
  const live = await getCachedLiveQuotes();
  const liveRial = live?.quotes[karat];
  if (live && liveRial !== undefined) {
    const markupBp = await getSetting("pricing.live_markup_bp");
    return {
      karat,
      pricePerGramRial: applyLiveMarkup(liveRial, markupBp),
      source: "external",
      sourceRef: live.sourceRef,
      effectiveAt: live.fetchedAt,
      ageMinutes: priceAgeMinutes(live.fetchedAt),
      isStale: false,
    };
  }

  const row = await findLatestPrice(karat, "manual");
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
    try {
      const price = await getCurrentGoldPrice(karat);
      snapshot[String(karat)] = price.pricePerGramRial;
    } catch {
      // عیار بدون قیمت در اسنپ‌شات نمی‌آید؛ قفل سفارش همان را می‌بیند.
    }
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

  const markupBp = await getSetting("pricing.live_markup_bp");
  const pricePerGramRial = applyLiveMarkup(fetched.pricePerGramRial, markupBp);

  const row = await insertPrice({
    karat: fetched.karat,
    pricePerGramRial,
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
