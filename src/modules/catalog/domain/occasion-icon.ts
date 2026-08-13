/**
 * نگاشت مناسبت به کلید آیکون نمایشی.
 * خالص و تست‌پذیر؛ کامپوننت Lucide در لایه UI است.
 */

export const OCCASION_ICON_KEYS = [
  "cake",
  "smile",
  "flower",
  "moon-star",
  "calendar-heart",
] as const;

export type OccasionIconKey = (typeof OCCASION_ICON_KEYS)[number];

const SLUG_TO_ICON: Record<string, OccasionIconKey> = {
  birthday: "cake",
  "first-tooth": "smile",
  nowruz: "flower",
  "jashn-taklif": "moon-star",
};

const EMOJI_TO_ICON: Record<string, OccasionIconKey> = {
  "🎂": "cake",
  "🦷": "smile",
  "🌸": "flower",
  "✨": "moon-star",
};

/** کلید آیکون مناسبت؛ اول از اسلاگ، وگرنه از ایموجی ذخیره‌شده. */
export function occasionIconKey(slug: string, emoji?: string | null): OccasionIconKey {
  return SLUG_TO_ICON[slug] ?? (emoji ? EMOJI_TO_ICON[emoji] : undefined) ?? "calendar-heart";
}
