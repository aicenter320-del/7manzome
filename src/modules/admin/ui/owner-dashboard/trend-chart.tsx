import { toPersianDigits } from "@/shared/lib/persian";

import type { OwnerTrendPoint } from "../../domain/types";

function sparkPath(values: number[]): string {
  if (values.length === 0) return "";

  const peak = Math.max(...values, 1);
  const last = values.length - 1;

  return values
    .map((value, index) => {
      const x = last === 0 ? 50 : (index / last) * 100;
      const y = 36 - (value / peak) * 32;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function TrendChart({
  points,
  field,
  label,
}: {
  points: readonly OwnerTrendPoint[];
  field: keyof Pick<OwnerTrendPoint, "salesRial" | "profitRial" | "orderCount" | "goldMg">;
  label: string;
}) {
  const values = points.map((point) => point[field]);
  const path = sparkPath(values);
  const first = points[0]?.label;
  const last = points[points.length - 1]?.label;

  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <svg
        viewBox="0 0 100 40"
        className="h-16 w-full text-gold-deep"
        role="img"
        aria-label={label}
        preserveAspectRatio="none"
      >
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {first && last ? (
        <div className="flex justify-between text-[0.65rem] text-muted-foreground">
          <span>{toPersianDigits(first)}</span>
          <span>{toPersianDigits(last)}</span>
        </div>
      ) : null}
    </div>
  );
}
