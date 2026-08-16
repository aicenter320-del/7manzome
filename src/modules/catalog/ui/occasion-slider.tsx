"use client";

import { SnapSlideTrack } from "@/shared/ui/snap-slide-track";

import type { Occasion } from "../domain/types";
import { OccasionCard } from "./occasion-card";

const HOME_OCCASION_COUNT = 5;

/** نوار افقی پنج مناسبت؛ کارت فعال وسط است و همسایه‌ها از دو طرف دیده می‌شوند. */
export function OccasionSlider({
  occasions,
  labelledBy,
}: {
  occasions: Occasion[];
  labelledBy: string;
}) {
  const items = occasions.slice(0, HOME_OCCASION_COUNT);

  if (items.length === 0) return null;

  return (
    <SnapSlideTrack
      labelledBy={labelledBy}
      align="center"
      slideClassName="w-[72cqi] shrink-0"
      slideKind="مناسبت"
    >
      {items.map((occasion) => (
        <OccasionCard key={occasion.id} occasion={occasion} />
      ))}
    </SnapSlideTrack>
  );
}
