import { describe, expect, it } from "vitest";

import {
  applyLiveMarkup,
  DEFAULT_LIVE_GOLD_MARKUP_BP,
  liveMarkupBpToPercent,
  liveMarkupPercentToBp,
  parseTalaGoldQuotes,
  parseTomanPerGram,
} from "./live-gold-quote";

describe("parseTomanPerGram", () => {
  it("ویرگول را برمی‌دارد و تومان را به ریال تبدیل می‌کند", () => {
    expect(parseTomanPerGram("19,000,600")).toBe(190_006_000);
  });

  it("مقدار نامعتبر را رد می‌کند", () => {
    expect(parseTomanPerGram("")).toBeNull();
    expect(parseTomanPerGram("0")).toBeNull();
    expect(parseTomanPerGram("19.5")).toBeNull();
    expect(parseTomanPerGram("abc")).toBeNull();
  });
});

describe("applyLiveMarkup", () => {
  it("حاشیهٔ داده‌شده را به قیمت اضافه می‌کند", () => {
    expect(applyLiveMarkup(100_000, 200)).toBe(102_000);
    expect(applyLiveMarkup(190_006_000, 200)).toBe(193_806_120);
    expect(applyLiveMarkup(190_006_000, 100)).toBe(191_906_060);
    expect(applyLiveMarkup(190_006_000, 0)).toBe(190_006_000);
  });
});

describe("liveMarkup percent conversion", () => {
  it("درصد و صدم‌درصد را دوطرفه تبدیل می‌کند", () => {
    expect(liveMarkupPercentToBp(2)).toBe(DEFAULT_LIVE_GOLD_MARKUP_BP);
    expect(liveMarkupPercentToBp(1)).toBe(100);
    expect(liveMarkupBpToPercent(200)).toBe(2);
    expect(liveMarkupBpToPercent(100)).toBe(1);
  });
});

describe("parseTalaGoldQuotes", () => {
  it("۱۸ و ۲۴ عیار را بدون حاشیه می‌خواند", () => {
    const quotes = parseTalaGoldQuotes({
      gold: {
        gold_18k: { v: "19,000,600" },
        gold_24k: { v: "25,331,600" },
      },
    });

    expect(quotes).toEqual({
      18: 190_006_000,
      24: 253_316_000,
    });
  });

  it("پاسخ بی‌ربط را رد می‌کند", () => {
    expect(parseTalaGoldQuotes(null)).toBeNull();
    expect(parseTalaGoldQuotes({ gold: {} })).toBeNull();
  });
});
