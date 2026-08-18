/**
 * نگاشت دسته‌بندی به کلید آیکون نمایشی.
 * خالص و تست‌پذیر؛ کامپوننت Lucide در لایه UI است.
 */

export const CATEGORY_ICON_KEYS = [
  "link",
  "medal",
  "gem",
  "coins",
  "ring",
  "footprints",
  "sparkles",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

const SLUG_TO_ICON: Record<string, CategoryIconKey> = {
  bracelet: "link",
  necklace: "medal",
  earring: "gem",
  "coin-bar": "coins",
  ring: "ring",
  anklet: "footprints",
};

/** کلید آیکون دسته؛ اسلاگ ناشناخته به درخشش برمی‌گردد. */
export function categoryIconKey(slug: string): CategoryIconKey {
  return SLUG_TO_ICON[slug] ?? "sparkles";
}
