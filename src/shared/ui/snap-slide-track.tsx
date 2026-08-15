"use client";

import { Children, isValidElement, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

/** نوار افقی با اسنپ و نقطه‌های طلایی؛ بدون دانش دامنه. */
export function SnapSlideTrack({
  labelledBy,
  slideClassName,
  slideLabel,
  gapClassName = "gap-3",
  children,
}: {
  labelledBy?: string;
  slideClassName: string;
  slideLabel: (index: number, total: number) => string;
  gapClassName?: string;
  children: ReactNode;
}) {
  const slides = Children.toArray(children);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncActive = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-snap-slide]")];
    if (nodes.length === 0) return;

    const rootRect = root.getBoundingClientRect();
    const isRtl = getComputedStyle(root).direction === "rtl";
    const edge = isRtl ? rootRect.right : rootRect.left;

    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    nodes.forEach((slide, index) => {
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
  }, [syncActive, slides.length]);

  const scrollToIndex = (index: number) => {
    const root = scrollerRef.current;
    const slide = root?.querySelectorAll<HTMLElement>("[data-snap-slide]")[index];
    slide?.scrollIntoView({ inline: "start", block: "nearest", behavior: "smooth" });
  };

  if (slides.length === 0) return null;

  return (
    <div>
      <div
        ref={scrollerRef}
        role="region"
        {...(labelledBy ? { "aria-labelledby": labelledBy } : {})}
        className="@container -mx-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className={cn("flex px-1", gapClassName)}>
          {slides.map((child, index) => (
            <li
              key={isValidElement(child) && child.key != null ? String(child.key) : index}
              data-snap-slide
              className={slideClassName}
            >
              {child}
            </li>
          ))}
        </ul>
      </div>

      {slides.length > 1 ? (
        <ol className="mt-4 flex items-center justify-center gap-0.5">
          {slides.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={index}>
                <button
                  type="button"
                  aria-label={slideLabel(index, slides.length)}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => scrollToIndex(index)}
                  className="flex size-5 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "rounded-full transition-[width,background-color] duration-300",
                      isActive ? "h-1 w-3.5 bg-gold" : "size-1 bg-gold/35 hover:bg-gold/55",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
