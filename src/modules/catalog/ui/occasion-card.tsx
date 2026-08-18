import Link from "next/link";

import { cn } from "@/shared/lib/cn";

import type { Occasion } from "../domain/types";
import { OccasionIcon } from "./occasion-icon";

/** کارت مناسبت کرم با حلقهٔ آیکون طلایی. */
export function OccasionCard({
  occasion,
  className,
}: {
  occasion: Occasion;
  className?: string;
}) {
  return (
    <Link href={`/occasions/${occasion.slug}`} className={cn("block h-full", className)}>
      <div className="relative h-full min-h-40 overflow-hidden rounded-[1.25rem] border border-border from-card to-gold-soft/40 bg-linear-to-br p-5 text-card-foreground">
        <span className="mb-3 flex size-10 items-center justify-center rounded-full border border-gold bg-gold/10 text-gold-deep">
          <OccasionIcon slug={occasion.slug} emoji={occasion.emoji} variant="plain" size="sm" />
        </span>
        <h3 className="text-base font-bold text-foreground">{occasion.title}</h3>
        {occasion.description ? (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {occasion.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
