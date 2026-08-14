import { mulDiv, percentOf } from "@/shared/lib/math";
import { tomanToRial } from "@/shared/lib/money";
import type { GoldKarat } from "@/shared/types/enums";

/** پیش‌فرض حاشیه اگر تنظیمات خالی باشد؛ ۲٪ = ۲۰۰ صدم‌درصد. */
export const DEFAULT_LIVE_GOLD_MARKUP_BP = 200;

/** سقف درصد قابل تنظیم در پنل؛ ۲۰٪ = ۲۰۰۰ صدم‌درصد. */
export const MAX_LIVE_GOLD_MARKUP_PERCENT = 20;

const TALA_KEYS: Record<GoldKarat, string> = {
  18: "gold_18k",
  24: "gold_24k",
};

/** قیمت زنده بازار به ریال، بدون حاشیهٔ فروشگاه. */
export type LiveGoldQuotes = Partial<Record<GoldKarat, number>>;

/** تومان هر گرم (رشته با ویرگول) → ریال صحیح، یا null اگر نامعتبر. */
export function parseTomanPerGram(value: string): number | null {
  const digits = value.replace(/,/g, "").trim();
  if (!/^\d+$/.test(digits)) return null;
  const toman = Number(digits);
  if (!Number.isSafeInteger(toman) || toman <= 0) return null;
  return tomanToRial(toman);
}

/** درصد خوانا (۰ تا ۲۰) به صدم‌درصد ذخیره. */
export function liveMarkupPercentToBp(percent: number): number {
  return mulDiv(percent, 100, 1);
}

/** صدم‌درصد ذخیره به درصد خوانا. */
export function liveMarkupBpToPercent(markupBp: number): number {
  return mulDiv(markupBp, 1, 100);
}

/** قیمت دریافتی به‌علاوهٔ حاشیهٔ تنظیم‌شده. */
export function applyLiveMarkup(pricePerGramRial: number, markupBp: number): number {
  return pricePerGramRial + percentOf(pricePerGramRial, markupBp);
}

function readQuoteValue(gold: Record<string, unknown>, key: string): string | null {
  const item = gold[key];
  if (!item || typeof item !== "object") return null;
  const raw = (item as { v?: unknown }).v;
  return typeof raw === "string" ? raw : null;
}

/**
 * پارس پاسخ طلا دات آی‌آر.
 * مقدار `v` تومان هر گرم است؛ خروجی ریال خام بدون حاشیه.
 */
export function parseTalaGoldQuotes(payload: unknown): LiveGoldQuotes | null {
  if (!payload || typeof payload !== "object") return null;
  const gold = (payload as { gold?: unknown }).gold;
  if (!gold || typeof gold !== "object") return null;
  const goldRecord = gold as Record<string, unknown>;

  const quotes: LiveGoldQuotes = {};
  for (const karat of [18, 24] as const) {
    const raw = readQuoteValue(goldRecord, TALA_KEYS[karat]);
    if (!raw) continue;
    const rial = parseTomanPerGram(raw);
    if (rial === null) continue;
    quotes[karat] = rial;
  }

  return Object.keys(quotes).length > 0 ? quotes : null;
}
