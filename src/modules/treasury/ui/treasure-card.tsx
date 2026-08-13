import Link from "next/link";
import { GiftIcon, UsersIcon } from "lucide-react";

import { ChildAvatar } from "@/modules/children/ui/child-avatar";
import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { TREASURE_STATUS_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";

import type { TreasureSummary } from "../domain/types";
import { TreasureProgress } from "./treasure-progress";

/**
 * کارت گنجینه.
 *
 * ⚠️ تصمیم مهم برند: وزن طلا معیار اصلی و بزرگ است؛ ارزش ریالی ثانویه و کوچک‌تر.
 * اگر مبلغ قهرمان صفحه شود، برند به یک اپلیکیشن سرمایه‌گذاری تبدیل می‌شود
 * (بند ۲۶ سند محصول).
 */
export function TreasureCard({
  summary,
  href,
  className,
}: {
  summary: TreasureSummary;
  href?: string;
  className?: string;
}) {
  const { treasure, child, balance, currentValueRial, goal, progressPercent } = summary;
  const target = href ?? `/dashboard/treasures/${treasure.id}`;

  return (
    <Card className={cn("overflow-hidden transition-transform hover:-translate-y-0.5", className)}>
      <Link href={target} className="block p-5 focus-visible:outline-none">
        <div className="flex items-start gap-3">
          <ChildAvatar
            displayName={child.displayName}
            avatarFileId={child.avatarFileId}
            size="default"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{treasure.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {child.displayName} — {child.ageLabel}
                </p>
              </div>

              {treasure.status !== "active" ? (
                <Badge variant="muted">{TREASURE_STATUS_LABELS[treasure.status]}</Badge>
              ) : treasure.kind === "event" ? (
                <Badge variant="gold">مناسبتی</Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-1">
          <GoldWeight mg={balance.balanceMg} size="hero" className="text-treasure" />
          {currentValueRial !== null ? (
            <p className="text-sm text-muted-foreground">
              ارزش امروز: <Money rial={currentValueRial} short />
            </p>
          ) : null}
        </div>

        <TreasureProgress
          className="mt-5"
          balanceMg={balance.balanceMg}
          goal={goal}
          progressPercent={progressPercent}
        />

        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UsersIcon className="size-3.5" />
            {toPersianDigits(summary.contributorCount)} هدیه‌دهنده
          </span>
          <span className="flex items-center gap-1.5">
            <GiftIcon className="size-3.5" />
            {toPersianDigits(summary.milestones.length)} نقطه عطف
          </span>
        </div>
      </Link>
    </Card>
  );
}
