import Link from "next/link";

import { cn } from "@/shared/lib/cn";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import type { Occasion } from "../domain/types";
import { OccasionIcon } from "./occasion-icon";

/** کارت مناسبت سفید، بدون شیشه؛ آیکون واترمارک در انتها. */
export function OccasionCard({
  occasion,
  className,
}: {
  occasion: Occasion;
  className?: string;
}) {
  return (
    <Link href={`/occasions/${occasion.slug}`} className={cn("block h-full", className)}>
      <div className="relative h-full min-h-40 overflow-hidden rounded-lg bg-card text-card-foreground shadow-product transition-transform motion-safe:hover:-translate-y-1">
        <OccasionIcon slug={occasion.slug} emoji={occasion.emoji} variant="watermark" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-base font-bold text-foreground">{occasion.title}</CardTitle>
        </CardHeader>
        {occasion.description ? (
          <CardContent className="relative z-10">
            <p className="line-clamp-3 max-w-[85%] text-sm font-medium text-foreground">
              {occasion.description}
            </p>
          </CardContent>
        ) : null}
      </div>
    </Link>
  );
}
