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
      <div className="relative h-full min-h-40 overflow-hidden rounded-2xl bg-card text-card-foreground transition-transform hover:-translate-y-0.5">
        <OccasionIcon slug={occasion.slug} emoji={occasion.emoji} variant="watermark" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-base">{occasion.title}</CardTitle>
        </CardHeader>
        {occasion.description ? (
          <CardContent className="relative z-10">
            <p className="line-clamp-3 max-w-[85%] text-sm text-muted-foreground">
              {occasion.description}
            </p>
          </CardContent>
        ) : null}
      </div>
    </Link>
  );
}
