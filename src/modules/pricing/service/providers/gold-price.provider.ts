import "server-only";

import { describeError, logger } from "@/server/logger";
import { env } from "@/shared/config/env";
import type { GoldKarat } from "@/shared/types/enums";

import { parseTalaGoldQuotes, type LiveGoldQuotes } from "../../domain/live-gold-quote";

/**
 * پورت منبع قیمت طلا.
 *
 * واکشی زنده از طلا دات آی‌آر است؛ اگر شکست بخورد سرویس از قیمت دستی دیتابیس می‌خواند.
 */

export interface FetchedGoldPrice {
  karat: GoldKarat;
  pricePerGramRial: number;
  sourceRef: string;
  effectiveAt: number;
}

export interface LiveQuoteSnapshot {
  quotes: LiveGoldQuotes;
  sourceRef: string;
  fetchedAt: number;
}

export interface GoldPriceProvider {
  readonly key: "manual" | "external";
  /** null یعنی این منبع قیمت نمی‌دهد و باید از دیتابیس خوانده شود. */
  fetchPrice(karat: GoldKarat): Promise<FetchedGoldPrice | null>;
}

const CACHE_TTL_MS = 60_000;

let cache: LiveQuoteSnapshot | null = null;
let inflight: Promise<LiveQuoteSnapshot | null> | null = null;

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (compatible; HaftManzoome/1.0; +https://haftmanzoome.ir)";

export const manualGoldPriceProvider: GoldPriceProvider = {
  key: "manual",
  async fetchPrice(): Promise<FetchedGoldPrice | null> {
    return null;
  },
};

async function fetchTalaSnapshot(): Promise<LiveQuoteSnapshot | null> {
  const url = env.GOLD_PRICE_API_URL;
  if (!url) return null;

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": DEFAULT_USER_AGENT,
    };
    if (env.GOLD_PRICE_API_KEY) {
      headers.Authorization = `Bearer ${env.GOLD_PRICE_API_KEY}`;
    }

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      logger.warn("gold price provider returned error", { status: response.status });
      return null;
    }

    const payload: unknown = await response.json();
    const quotes = parseTalaGoldQuotes(payload);
    if (!quotes) {
      logger.warn("gold price payload could not be parsed");
      return null;
    }

    return { quotes, sourceRef: url, fetchedAt: Date.now() };
  } catch (error) {
    logger.error("gold price fetch failed", { error: describeError(error) });
    return null;
  }
}

/** نقل زنده با کش یک دقیقه‌ای؛ هر دو عیار در یک درخواست. */
export async function getCachedLiveQuotes(): Promise<LiveQuoteSnapshot | null> {
  if (env.GOLD_PRICE_PROVIDER !== "external") return null;

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache;

  inflight ??= fetchTalaSnapshot()
    .then((snapshot) => {
      if (snapshot) cache = snapshot;
      return snapshot;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export const externalGoldPriceProvider: GoldPriceProvider = {
  key: "external",

  async fetchPrice(karat: GoldKarat): Promise<FetchedGoldPrice | null> {
    const snapshot = await getCachedLiveQuotes();
    const pricePerGramRial = snapshot?.quotes[karat];
    if (!snapshot || pricePerGramRial === undefined) return null;

    return {
      karat,
      pricePerGramRial,
      sourceRef: snapshot.sourceRef,
      effectiveAt: snapshot.fetchedAt,
    };
  },
};

export function activeGoldPriceProvider(): GoldPriceProvider {
  return env.GOLD_PRICE_PROVIDER === "external"
    ? externalGoldPriceProvider
    : manualGoldPriceProvider;
}
