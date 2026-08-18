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
  variant = "soft",
  className,
}: {
  price: GoldPriceView | null;
  variant?: "soft" | "gold" | "night";
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

  if (variant === "night") {
    return (
      <div className={cn("hero-price-strip text-xs", className)}>
        <span className="flex items-center gap-1.5 text-night-muted">
          {price.isStale ? <AlertTriangleIcon className="size-3.5 text-warning" /> : null}
          طلای {formatKarat(price.karat)}{" "}
          <span className="font-bold text-gold-300">هر گرم</span>
        </span>
        <span className="ltr-nums text-sm font-extrabold text-night-foreground">
          <Money rial={price.pricePerGramRial} />
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-1.5 text-xs",
        price.isStale
          ? "border-warning/30 bg-warning/10 text-warning"
          : variant === "gold"
            ? "rounded-full border-0 hero-gold-band"
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
