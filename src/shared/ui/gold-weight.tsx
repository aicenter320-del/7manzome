import { cn } from "@/shared/lib/cn";
import { formatKarat, formatMg } from "@/shared/lib/gold";
import type { GoldKarat } from "@/shared/types/enums";

/**
 * نمایش وزن طلا.
 *
 * ورودی همیشه میلی‌گرم (واحد پایه دیتابیس) و خروجی همیشه گرم با ارقام فارسی.
 *
 * توجه به تصمیم برند: وزن طلا معیار اصلی نمایش است، نه مبلغ. پس این کامپوننت
 * واریانت «قهرمان» دارد که در داشبورد گنجینه بزرگ نمایش داده می‌شود.
 */
export function GoldWeight({
  mg,
  karat,
  size = "default",
  withUnit = true,
  className,
}: {
  mg: number;
  karat?: GoldKarat;
  size?: "sm" | "default" | "hero";
  withUnit?: boolean;
  className?: string;
}) {
  const sizeClass = {
    sm: "text-sm",
    default: "text-base font-medium",
    hero: "text-3xl font-bold sm:text-4xl",
  }[size];

  return (
    <span className={cn("tabular-nums", sizeClass, className)}>
      {formatMg(mg, { withUnit })}
      {karat ? (
        <span className="ms-1.5 align-middle text-xs font-normal text-muted-foreground">
          {formatKarat(karat)}
        </span>
      ) : null}
    </span>
  );
}
