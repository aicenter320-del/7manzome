import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Progress } from "@/shared/ui/progress";

/**
 * پیشرفت گنجینه برای صفحه عمومی هدیه.
 *
 * فقط نام کوچک، سن و پیشرفت. بدون کارت گنجینه تا دادهٔ اضافی لو نرود.
 */
export function GiftProgress({
  childFirstName,
  childAgeLabel,
  balanceMg,
  goalTargetMg,
  progressPercent,
  className,
}: {
  childFirstName: string;
  childAgeLabel: string;
  balanceMg: number;
  goalTargetMg: number | null;
  progressPercent: number;
  className?: string;
}) {
  return (
    <section className={cn("glass grid gap-4 rounded-3xl p-6", className)}>
      <header className="grid gap-1">
        <h1 className="text-xl font-semibold text-foreground">گنجینه {childFirstName}</h1>
        <p className="text-sm text-muted-foreground">{childAgeLabel}</p>
      </header>

      <div className="grid gap-1">
        <p className="text-xs text-muted-foreground">طلای ذخیره‌شده</p>
        <GoldWeight mg={balanceMg} size="hero" className="text-treasure" />
      </div>

      {goalTargetMg && goalTargetMg > 0 ? (
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted-foreground">پیشرفت تا هدف</span>
            <span className="font-semibold text-gold-deep">
              {toPersianDigits(progressPercent)}٪
            </span>
          </div>
          <Progress value={progressPercent} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          هنوز هدفی برای این گنجینه تعیین نشده؛ هر هدیه‌ای ارزشمند است.
        </p>
      )}
    </section>
  );
}
