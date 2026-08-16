import { AwardIcon, CircleDashedIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatMg } from "@/shared/lib/gold";
import { JalaliDate } from "@/shared/ui/jalali-date";

import { milestoneTitle } from "../domain/gold-ledger";
import type { Milestone } from "../domain/types";

/**
 * فهرست نقاط عطف.
 *
 * گیمیفیکیشن ظریف: نقاط عطف کسب‌شده و نقاط بعدی با هم نشان داده می‌شوند
 * تا مسیر پیش رو دیده شود، اما سایت شبیه بازی نشود (بند ۲۹ سند محصول).
 */
export function MilestoneList({
  milestones,
  thresholdsMg,
  balanceMg,
  className,
}: {
  milestones: readonly Milestone[];
  thresholdsMg: readonly number[];
  balanceMg: number;
  className?: string;
}) {
  const achieved = new Map(milestones.map((item) => [item.thresholdMg, item]));

  return (
    <ol className={cn("grid gap-2", className)}>
      {[...thresholdsMg].sort((a, b) => a - b).map((thresholdMg) => {
        const item = achieved.get(thresholdMg);
        const isAchieved = Boolean(item);
        const isNext = !isAchieved && balanceMg < thresholdMg;

        return (
          <li
            key={thresholdMg}
            className={cn(
              "flex items-center gap-3 rounded-3xl border p-3 text-sm",
              isAchieved
                ? "border-gold/35 bg-gold-soft/40"
                : "border-border bg-muted/20 opacity-70",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                isAchieved ? "bg-gold text-accent-foreground" : "bg-muted text-muted-foreground",
              )}
              aria-hidden
            >
              {isAchieved ? (
                <AwardIcon className="size-4" />
              ) : (
                <CircleDashedIcon className="size-4" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className={cn("font-medium", isAchieved && "text-gold-deep")}>
                {item?.title ?? milestoneTitle(thresholdMg)}
              </p>
              <p className="text-xs text-muted-foreground">{formatMg(thresholdMg)}</p>
            </div>

            {item ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                <JalaliDate at={item.achievedAt} variant="date" />
              </span>
            ) : isNext ? (
              <span className="shrink-0 text-xs text-muted-foreground">مرحله بعد</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
