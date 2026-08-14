"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";

import type { Occasion } from "../domain/types";
import { OccasionCard } from "./occasion-card";

const HOME_OCCASION_COUNT = 5;

/** نوار افقی پنج مناسبت، با نشانگر اسلاید و لینک فهرست کامل. */
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncActive = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const slides = [...root.querySelectorAll<HTMLElement>("[data-occasion-slide]")];
    if (slides.length === 0) return;

    const rootRect = root.getBoundingClientRect();
    const isRtl = getComputedStyle(root).direction === "rtl";
    const edge = isRtl ? rootRect.right : rootRect.left;

    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const start = isRtl ? rect.right : rect.left;
      const dist = Math.abs(start - edge);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    setActiveIndex(best);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    syncActive();
    root.addEventListener("scroll", syncActive, { passive: true });
    const observer = new ResizeObserver(syncActive);
    observer.observe(root);
    return () => {
      root.removeEventListener("scroll", syncActive);
      observer.disconnect();
    };
  }, [syncActive, items.length]);

  const scrollToIndex = (index: number) => {
    const root = scrollerRef.current;
    const slide = root?.querySelectorAll<HTMLElement>("[data-occasion-slide]")[index];
    slide?.scrollIntoView({ inline: "start", block: "nearest", behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 id={headingId} className="text-xl font-semibold">
          {heading}
        </h2>
        <ol className="flex min-w-0 flex-1 items-center gap-1.5">
          {items.map((occasion, index) => (
            <li key={occasion.id} className="flex-1">
              <button
                type="button"
                aria-label={`مناسبت ${toPersianDigits(index + 1)} از ${toPersianDigits(items.length)}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => scrollToIndex(index)}
                className="flex h-6 w-full items-center"
              >
                <span
                  className={cn(
                    "h-0.5 w-full rounded-full transition-colors",
                    index === activeIndex ? "bg-gold" : "bg-border",
                  )}
                />
              </button>
            </li>
          ))}
        </ol>
        <Button asChild variant="link" className="ms-auto shrink-0">
          <Link href="/occasions">تمام مناسبت‌ها</Link>
        </Button>
      </div>

      <div
        ref={scrollerRef}
        role="region"
        aria-labelledby={headingId}
        className="@container -mx-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex gap-3 px-1">
          {items.map((occasion) => (
            <li
              key={occasion.id}
              data-occasion-slide
              className="w-[78cqi] shrink-0 snap-start sm:w-[calc((100cqi-0.75rem)/2)] lg:w-[calc((100cqi-3rem)/5)]"
            >
              <OccasionCard occasion={occasion} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
