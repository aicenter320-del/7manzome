import { cn } from "@/shared/lib/cn";
import { mulDiv } from "@/shared/lib/math";
import { toPersianDigits } from "@/shared/lib/persian";

export function ChangeBadge({
  bp,
  emptyLabel = "دوره قبل برای مقایسه نیست",
}: {
  bp: number | null;
  emptyLabel?: string;
}) {
  if (bp === null) {
    return <span className="text-xs text-muted-foreground">{emptyLabel}</span>;
  }

  const percent = mulDiv(bp, 1, 100);
  const sign = percent > 0 ? "+" : "";
  const tone =
    percent > 0 ? "text-gold-deep" : percent < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <span className={cn("text-xs tabular-nums", tone)}>
      {sign}
      {toPersianDigits(percent)}٪ نسبت به دوره قبل
    </span>
  );
}
