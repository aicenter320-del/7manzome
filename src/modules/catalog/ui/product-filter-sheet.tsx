"use client";

import Link from "next/link";
import { ListFilterIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { copy } from "@/shared/config/copy";
import { cn } from "@/shared/lib/cn";
import {
  GlassSheet,
  GlassSheetClose,
  GlassSheetContent,
  GlassSheetTitle,
} from "@/shared/ui/glass-sheet";

import type { Category, Occasion } from "../domain/types";
import { CategoryCircle } from "./category-icon";
import { OccasionLabel } from "./occasion-icon";

/** نوار چسبان فیلتر کاتالوگ؛ دسته و مناسبت داخل شیت پایین. */
export function ProductFilterSheet({
  categories,
  occasions,
  categorySlug,
  occasionSlug,
}: {
  categories: Category[];
  occasions: Occasion[];
  categorySlug?: string;
  occasionSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const activeCategory = categories.find((item) => item.slug === categorySlug);
  const activeOccasion = occasions.find((item) => item.slug === occasionSlug);
  const summary = activeCategory?.title ?? activeOccasion?.title;
  const close = () => setOpen(false);

  return (
    <GlassSheet open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "fixed inset-x-0 z-40 mx-auto w-full max-w-(--customer-app-width)",
          "bottom-[calc(var(--app-tab-bar-height)+env(safe-area-inset-bottom,0px))]",
          "border-t border-border bg-card/95 px-4 py-2.5 backdrop-blur-md",
        )}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gold bg-gold-soft px-4 py-3 text-sm font-bold text-gold-deep"
          onClick={() => setOpen(true)}
        >
          <ListFilterIcon className="size-4" />
          {summary ? `${copy.products.filter} · ${summary}` : copy.products.filter}
        </button>
      </div>

      <GlassSheetContent side="bottom" className="app-column-sheet">
        <div className="flex items-start justify-between gap-3">
          <GlassSheetTitle>{copy.products.filter}</GlassSheetTitle>
          <GlassSheetClose aria-label="بستن" className="rounded-full p-2 hover:bg-gold-soft/50">
            <XIcon className="size-5 text-gold-deep" />
          </GlassSheetClose>
        </div>

        <Link
          href="/products"
          onClick={close}
          className={cn(
            "mt-5 inline-flex rounded-full border px-3 py-1.5 text-sm",
            !categorySlug && !occasionSlug
              ? "border-gold bg-gold-soft text-gold-deep shadow-glow"
              : "border-border text-muted-foreground",
          )}
        >
          {copy.products.filterAll}
        </Link>

        <section className="mt-6 grid gap-3">
          <h3 className="text-xs font-bold text-gold-deep">{copy.products.filterCategories}</h3>
          <ul className="grid grid-cols-3 gap-4">
            {categories.map((category) => (
              <li key={category.id}>
                <CategoryCircle
                  category={category}
                  active={categorySlug === category.slug}
                  onNavigate={close}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 grid gap-3">
          <h3 className="text-xs font-bold text-gold-deep">{copy.products.filterOccasions}</h3>
          <ul className="flex flex-wrap gap-2">
            {occasions.map((occasion) => {
              const active = occasionSlug === occasion.slug;
              return (
                <li key={occasion.id}>
                  <Link
                    href={`/products?occasion=${occasion.slug}`}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                      active
                        ? "border-gold bg-gold-soft text-gold-deep shadow-glow"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <OccasionLabel
                      slug={occasion.slug}
                      title={occasion.title}
                      emoji={occasion.emoji}
                      variant="plain"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </GlassSheetContent>
    </GlassSheet>
  );
}
