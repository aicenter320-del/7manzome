"use client";

import Link from "next/link";

import { cta } from "@/shared/config/copy";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { SnapSlideTrack } from "@/shared/ui/snap-slide-track";

import type { Occasion } from "../domain/types";
import { OccasionCard } from "./occasion-card";

const HOME_OCCASION_COUNT = 5;

/** نوار افقی پنج مناسبت، با نقطه‌های کوچک اسلاید و لینک فهرست کامل. */
export function OccasionSlider({
  occasions,
  heading,
  headingId,
}: {
  occasions: Occasion[];
  heading: string;
  headingId: string;
}) {
  const items = occasions.slice(0, HOME_OCCASION_COUNT);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-xl font-semibold">
          {heading}
        </h2>
        <Button asChild variant="link" className="shrink-0">
          <Link href="/occasions">{cta.allOccasions}</Link>
        </Button>
      </div>

      <SnapSlideTrack
        labelledBy={headingId}
        slideClassName="w-[78cqi] shrink-0 snap-start sm:w-[calc((100cqi-0.75rem)/2)] lg:w-[calc((100cqi-3rem)/5)]"
        slideLabel={(index, total) =>
          `مناسبت ${toPersianDigits(index + 1)} از ${toPersianDigits(total)}`
        }
      >
        {items.map((occasion) => (
          <OccasionCard key={occasion.id} occasion={occasion} />
        ))}
      </SnapSlideTrack>
    </div>
  );
}
