import { formatRial, formatRialShort } from "@/shared/lib/money";
import { cn } from "@/shared/lib/cn";

/**
 * نمایش مبلغ.
 *
 * ورودی همیشه ریال است (واحد پایه دیتابیس) و خروجی همیشه تومان با ارقام فارسی.
 * هیچ‌جای رابط کاربری نباید خودش این تبدیل را انجام دهد.
 */
export function Money({
  rial,
  short = false,
  withUnit = true,
  className,
}: {
  rial: number;
  /** خلاصه‌سازی به «۵۲ میلیون تومان» برای جاهایی که دقت ریالی مهم نیست. */
  short?: boolean;
  withUnit?: boolean;
  className?: string;
}) {
  const text = short ? formatRialShort(rial, { withUnit }) : formatRial(rial, { withUnit });

  return (
    <span className={cn("tabular-nums", className)} title={formatRial(rial)}>
      {text}
    </span>
  );
}
