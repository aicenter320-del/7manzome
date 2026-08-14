import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardContent } from "@/shared/ui/card";

export function StatCard({
  label,
  value,
  hint,
  href,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  /** اگر باشد، کل کارت به این مسیر می‌رود. */
  href?: string;
  className?: string;
}) {
  const card = (
    <Card
      className={cn(
        href && "transition-colors hover:bg-gold-soft/50",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center p-5 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      aria-label={`${label} — مشاهده جزئیات`}
      className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      {card}
    </Link>
  );
}
