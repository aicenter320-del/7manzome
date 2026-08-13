import "server-only";

import { describeError, logger } from "@/server/logger";
import { env } from "@/shared/config/env";
import type { GoldKarat } from "@/shared/types/enums";

/**
 * پورت منبع قیمت طلا.
 *
 * دو پیاده‌سازی دارد. افزودن منبع جدید یعنی نوشتن یک شیء دیگر از این اینترفیس؛
 * هیچ‌جای دیگر پروژه نباید بداند قیمت از کجا می‌آید.
 */

export interface FetchedGoldPrice {
  karat: GoldKarat;
  pricePerGramRial: number;
  sourceRef: string;
  effectiveAt: number;
}

export interface GoldPriceProvider {
  readonly key: "manual" | "external";
  /** null یعنی این منبع قیمت نمی‌دهد و باید از دیتابیس خوانده شود. */
  fetchPrice(karat: GoldKarat): Promise<FetchedGoldPrice | null>;
}

/**
 * منبع دستی: قیمت را ادمین از پنل وارد می‌کند.
 * این پیاده‌سازی چیزی واکشی نمی‌کند؛ قیمت جاری از دیتابیس خوانده می‌شود.
 */
export const manualGoldPriceProvider: GoldPriceProvider = {
  key: "manual",
  async fetchPrice(): Promise<FetchedGoldPrice | null> {
    return null;
  },
};

/**
 * منبع بیرونی.
 *
 * ⚠️ منبع رسمی و قابل استناد قیمت اتحادیه هنوز تعیین نشده است
 * (docs/03-modules/pricing.md). این پیاده‌سازی اسکلت آماده است: انتظار
 * پاسخی با شکل { prices: [{ karat, pricePerGram }] } دارد و در صورت
 * تفاوت شکل پاسخ، فقط تابع mapResponse باید عوض شود.
 */
export const externalGoldPriceProvider: GoldPriceProvider = {
  key: "external",

  async fetchPrice(karat: GoldKarat): Promise<FetchedGoldPrice | null> {
    const url = env.GOLD_PRICE_API_URL;
    if (!url) return null;

    try {
      const response = await fetch(url, {
        headers: env.GOLD_PRICE_API_KEY
          ? { Authorization: `Bearer ${env.GOLD_PRICE_API_KEY}` }
          : {},
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });

      if (!response.ok) {
        logger.warn("gold price provider returned error", { status: response.status });
        return null;
      }

      const payload: unknown = await response.json();
      return mapResponse(payload, karat, url);
    } catch (error) {
      logger.error("gold price fetch failed", { error: describeError(error) });
      return null;
    }
  },
};

interface ExternalPricePayload {
  prices?: Array<{ karat?: number; pricePerGram?: number }>;
}

function mapResponse(
  payload: unknown,
  karat: GoldKarat,
  sourceRef: string,
): FetchedGoldPrice | null {
  const typed = payload as ExternalPricePayload;
  const match = typed.prices?.find((item) => item.karat === karat);

  if (!match?.pricePerGram || !Number.isFinite(match.pricePerGram)) return null;

  return {
    karat,
    pricePerGramRial: Math.round(match.pricePerGram),
    sourceRef,
    effectiveAt: Date.now(),
  };
}

export function activeGoldPriceProvider(): GoldPriceProvider {
  return env.GOLD_PRICE_PROVIDER === "external"
    ? externalGoldPriceProvider
    : manualGoldPriceProvider;
}
