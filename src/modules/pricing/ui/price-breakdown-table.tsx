import { cn } from "@/shared/lib/cn";
import { Money } from "@/shared/ui/money";
import { Separator } from "@/shared/ui/separator";

import { toBreakdownRows } from "../domain/pricing-engine";
import type { PriceBreakdown } from "../domain/types";

/**
 * جدول شفافیت قیمت.
 *
 * یکی از تفاوت‌های اصلی برند با طلافروشی سنتی: کاربر دقیقاً می‌بیند پولش
 * کجا می‌رود. این کامپوننت هرگز نباید ساده‌سازی شود.
 */
export function PriceBreakdownTable({
  breakdown,
  className,
}: {
  breakdown: PriceBreakdown;
  className?: string;
}) {
  const rows = toBreakdownRows(breakdown);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <p className="mb-3 text-sm font-medium">جزئیات کامل قیمت</p>

      <dl className="grid gap-2.5 text-sm">
        {rows.map((row, index) => (
          <div key={row.label}>
            {row.emphasis && index > 0 ? <Separator className="my-3" /> : null}

            <div className="flex items-baseline justify-between gap-4">
              <dt
                className={cn(
                  "text-muted-foreground",
                  row.emphasis && "font-semibold text-foreground",
                )}
              >
                {row.label}
                {row.hint ? (
                  <span className="ms-2 text-xs text-muted-foreground/80">({row.hint})</span>
                ) : null}
              </dt>
              <dd className={cn(row.emphasis && "text-base font-bold text-gold-deep")}>
                <Money rial={row.amountRial} />
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        قیمت بر مبنای نرخ روز طلا محاسبه می‌شود و تا لحظه ثبت سفارش ممکن است تغییر کند. پس از
        ثبت سفارش، قیمت برای شما قفل می‌شود.
      </p>
    </div>
  );
}
