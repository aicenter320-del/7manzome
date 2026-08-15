"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";

import { orderedGallery } from "../domain/product-gallery";
import type { ProductMediaItem } from "../domain/types";

/** گالری صفحهٔ جزئیات: تصویر بزرگ و بندانگشتی‌ها. */
export function ProductGallery({
  title,
  heroFileId,
  media,
}: {
  title: string;
  heroFileId: string | null;
  media: readonly ProductMediaItem[];
}) {
  const slides = orderedGallery(heroFileId, media);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex] ?? slides[0];

  if (!active) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted shadow-product">
        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
          بدون تصویر
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted shadow-product">
        <Image
          src={`/api/files/${active.fileId}`}
          alt={active.alt ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6"
          priority
        />
      </div>

      {slides.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {slides.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`تصویر ${toPersianDigits(index + 1)}`}
                aria-current={index === activeIndex}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-md bg-muted transition-shadow",
                  index === activeIndex
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-background"
                    : "hover:ring-1 hover:ring-gold/50",
                )}
              >
                <Image
                  src={`/api/files/${item.fileId}`}
                  alt={item.alt ?? ""}
                  fill
                  sizes="120px"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
