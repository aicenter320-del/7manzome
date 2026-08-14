import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardContent } from "@/shared/ui/card";

import { Sparkline } from "./owner-dashboard/trend-chart";

export function StatCard({
  label,
  value,
  hint,
  href,
  className,
  sparkline,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** اگر باشد، کل کارت به این مسیر می‌رود. */
  href?: string;
  className?: string;
  sparkline?: readonly number[];
}) {
  const card = (
    <Card
      className={cn(
        href && "transition-colors hover:bg-muted/60",
        className,
      )}
    >
      <CardContent className="flex flex-col items-start p-5 text-start">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
        {sparkline && sparkline.length > 0 ? (
          <div className="mt-3 w-full">
            <Sparkline values={sparkline} label={label} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      aria-label={`${label} — مشاهده جزئیات`}
      className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}
