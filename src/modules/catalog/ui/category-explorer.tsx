import { SnapSlideTrack } from "@/shared/ui/snap-slide-track";

import type { Category } from "../domain/types";
import { CategoryCircle } from "./category-icon";

/** نوار افقی دایره‌های دسته؛ لبهٔ بعدی دیده می‌شود. */
export function CategoryExplorer({
  categories,
  labelledBy,
  activeSlug,
}: {
  categories: Category[];
  labelledBy?: string;
  activeSlug?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <SnapSlideTrack
      labelledBy={labelledBy}
      slideClassName="w-[22cqi] min-w-20 shrink-0 snap-start"
      slideKind="دسته"
    >
      {categories.map((category) => (
        <CategoryCircle
          key={category.id}
          category={category}
          active={activeSlug === category.slug}
        />
      ))}
    </SnapSlideTrack>
  );
}
