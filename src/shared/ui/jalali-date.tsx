import { cn } from "@/shared/lib/cn";
import {
  formatJalaliDate,
  formatJalaliDateTime,
  formatJalaliDateWithWeekday,
  formatJalaliShort,
  formatRelativeFa,
} from "@/shared/lib/jalali";

/**
 * نمایش تاریخ شمسی.
 *
 * ورودی همیشه epoch میلی‌ثانیه است. تبدیل به شمسی فقط اینجا انجام می‌شود.
 * برای دسترسی‌پذیری، تاریخ کامل روی title قرار می‌گیرد.
 */
export function JalaliDate({
  at,
  variant = "date",
  className,
}: {
  at: number;
  variant?: "date" | "datetime" | "weekday" | "short" | "relative";
  className?: string;
}) {
  const text = {
    date: formatJalaliDate(at),
    datetime: formatJalaliDateTime(at),
    weekday: formatJalaliDateWithWeekday(at),
    short: formatJalaliShort(at),
    relative: formatRelativeFa(at),
  }[variant];

  return (
    <time
      dateTime={new Date(at).toISOString()}
      title={formatJalaliDateTime(at)}
      className={cn("tabular-nums", className)}
    >
      {text}
    </time>
  );
}
