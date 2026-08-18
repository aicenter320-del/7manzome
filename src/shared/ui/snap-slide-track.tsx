"use client";

import { Children, isValidElement, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { overflowScrollLeft, overflowThumb } from "@/shared/lib/overflow-thumb";
import { toPersianDigits } from "@/shared/lib/persian";

/** نوار افقی با اسنپ و نشانگر تناسبی طول محتوا؛ بدون دانش دامنه. */
export function SnapSlideTrack({
  labelledBy,
  slideClassName,
  slideKind,
  gapClassName = "gap-3",
  align = "start",
  children,
}: {
  labelledBy?: string;
  slideClassName: string;
  slideKind: string;
  gapClassName?: string;
  align?: "start" | "center";
  children: ReactNode;
}) {
  const slides = Children.toArray(children);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumb, setThumb] = useState({ overflow: false, start: 0, size: 1 });
  const isCenter = align === "center";

  const syncMetrics = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const rtl = getComputedStyle(root).direction === "rtl";
    setThumb(
      overflowThumb({
        clientWidth: root.clientWidth,
        scrollWidth: root.scrollWidth,
        scrollLeft: root.scrollLeft,
        rtl,
      }),
    );

    const nodes = [...root.querySelectorAll<HTMLElement>("[data-snap-slide]")];
    if (nodes.length === 0) return;

    const rootRect = root.getBoundingClientRect();
    const edge = rtl ? rootRect.right : rootRect.left;
    const mid = (rootRect.left + rootRect.right) / 2;

    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    nodes.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const dist = isCenter
        ? Math.abs((rect.left + rect.right) / 2 - mid)
        : Math.abs((rtl ? rect.right : rect.left) - edge);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    setActiveIndex(best);
  }, [isCenter]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    syncMetrics();
    root.addEventListener("scroll", syncMetrics, { passive: true });
    const observer = new ResizeObserver(syncMetrics);
    observer.observe(root);
    const list = root.querySelector("ul");
    if (list) observer.observe(list);
    return () => {
      root.removeEventListener("scroll", syncMetrics);
      observer.disconnect();
    };
  }, [syncMetrics, slides.length]);

  const jumpToRatio = (ratio: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    const rtl = getComputedStyle(root).direction === "rtl";
    root.scrollTo({
      left: overflowScrollLeft({
        clientWidth: root.clientWidth,
        scrollWidth: root.scrollWidth,
        ratio,
        rtl,
      }),
      behavior: "smooth",
    });
  };

  if (slides.length === 0) return null;

  return (
    <div>
      <div
        ref={scrollerRef}
        role="region"
        {...(labelledBy ? { "aria-labelledby": labelledBy } : {})}
        className="@container -mx-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className={cn("flex", isCenter ? "items-stretch px-[14cqi]" : "px-1", gapClassName)}>
          {slides.map((child, index) => {
            const isActive = index === activeIndex;
            return (
              <li
                key={isValidElement(child) && child.key != null ? String(child.key) : index}
                data-snap-slide
                className={cn(
                  slideClassName,
                  isCenter &&
                    "origin-center snap-center snap-always transition-[transform,opacity] duration-300",
                  isCenter &&
                    (isActive ? "z-10 scale-100" : "scale-[0.88] opacity-70 shadow-glow"),
                )}
              >
                {child}
              </li>
            );
          })}
        </ul>
      </div>

      {thumb.overflow ? (
        <div className="mt-3 px-1">
          <button
            type="button"
            aria-label={`پیمایش ${slideKind}، ${toPersianDigits(activeIndex + 1)} از ${toPersianDigits(slides.length)}`}
            className="relative block h-1 w-full overflow-hidden rounded-full bg-gold/20 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
              const x = rtl ? rect.right - event.clientX : event.clientX - rect.left;
              jumpToRatio(x / rect.width);
            }}
          >
            <span
              aria-hidden
              className="absolute inset-y-0 rounded-full bg-gold transition-[inset-inline-start,width] duration-200"
              style={{
                width: `${thumb.size * 100}%`,
                insetInlineStart: `${thumb.start * 100}%`,
              }}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
