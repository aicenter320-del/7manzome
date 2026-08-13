import { AlertTriangleIcon, TrendingUpIcon } from "lucide-react";

import { formatKarat } from "@/shared/lib/gold";
import { formatJalaliTime } from "@/shared/lib/jalali";
import { cn } from "@/shared/lib/cn";
import { Money } from "@/shared/ui/money";

import type { GoldPriceView } from "../domain/types";

/**
 * نشان قیمت روز طلا.
 *
 * شفافیت یکی از اصول برند است، پس زمان آخرین به‌روزرسانی هم نمایش داده می‌شود.
 * اگر قیمت کهنه باشد، به‌جای پنهان کردن، صریح هشدار می‌دهیم.
 */
export function GoldPriceBadge({
  price,
  className,
}: {
  price: GoldPriceView | null;
  className?: string;
}) {
  if (!price) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs text-warning",
          className,
        )}
      >
        <AlertTriangleIcon className="size-3.5" />
        قیمت طلا ثبت نشده است
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-1.5 text-xs",
        price.isStale
          ? "border-warning/30 bg-warning/10 text-warning"
          : "border-gold/30 bg-gold-soft/40 text-gold-deep",
        className,
      )}
    >
      {price.isStale ? (
        <AlertTriangleIcon className="size-3.5" />
      ) : (
        <TrendingUpIcon className="size-3.5" />
      )}

      <span className="font-medium">
        طلای {formatKarat(price.karat)}: <Money rial={price.pricePerGramRial} /> در هر گرم
      </span>

      <span className="opacity-75">
        {price.isStale ? "قیمت به‌روز نیست — " : ""}
        آخرین به‌روزرسانی {formatJalaliTime(price.effectiveAt)}
      </span>
    </div>
  );
}
