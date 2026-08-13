import { TargetIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatMg } from "@/shared/lib/gold";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";
import { Progress } from "@/shared/ui/progress";

import { monthsToGoal, requiredMonthlyMg } from "../domain/gold-ledger";
import type { TreasureGoal } from "../domain/types";

/**
 * نوار پیشرفت گنجینه به سمت هدف.
 *
 * وقتی هدفی تعیین نشده، به‌جای پنهان کردن، کاربر را به تعریف هدف تشویق می‌کنیم؛
 * چون هدف نقطه شروع حلقه عادت است (بند ۲۷ سند محصول).
 */
export function TreasureProgress({
  balanceMg,
  goal,
  progressPercent,
  className,
}: {
  balanceMg: number;
  goal: TreasureGoal | null;
  progressPercent: number;
  className?: string;
}) {
  if (!goal) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground",
          className,
        )}
      >
        <TargetIcon className="size-4 shrink-0" />
        هنوز هدفی برای این گنجینه تعیین نشده است.
      </div>
    );
  }

  const remainingMg = Math.max(0, goal.targetMg - balanceMg);
  const monthly = requiredMonthlyMg(balanceMg, goal.targetMg, 12);
  const months = monthsToGoal(balanceMg, goal.targetMg, monthly);

  return (
    <div className={cn("grid gap-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <TargetIcon className="size-4" />
          هدف: {formatMg(goal.targetMg)}
          {goal.targetDateAt ? (
            <span className="text-xs">تا {formatJalaliDate(goal.targetDateAt)}</span>
          ) : null}
        </span>
        <span className="font-semibold text-gold-deep">
          {toPersianDigits(progressPercent)}٪
        </span>
      </div>

      <Progress value={progressPercent} />

      <p className="text-xs text-muted-foreground">
        {remainingMg === 0 ? (
          <span className="font-medium text-success">هدف این گنجینه محقق شده است.</span>
        ) : (
          <>
            {formatMg(remainingMg)} تا رسیدن به هدف مانده است.
            {months !== null && months > 0 ? (
              <>
                {" "}
                با افزودن ماهی {formatMg(monthly)} در حدود {toPersianDigits(months)} ماه به
                هدف می‌رسید.
              </>
            ) : null}
          </>
        )}
      </p>
    </div>
  );
}
