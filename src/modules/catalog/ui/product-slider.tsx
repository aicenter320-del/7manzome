"use client";

import { PackageSearchIcon } from "lucide-react";

import { copy } from "@/shared/config/copy";
import { EmptyState } from "@/shared/ui/empty-state";
import { SnapSlideTrack } from "@/shared/ui/snap-slide-track";

import type { ProductListItem } from "../domain/types";
import { ProductCard } from "./product-card";

/** اسلایدر افقی کارت محصول؛ نقطه‌ها بقیهٔ ویترین را نشان می‌دهند. */
export function ProductSlider({
  products,
  labelledBy,
  emptyTitle = copy.products.emptyTitle,
  emptyDescription = copy.products.emptyDescription,
}: {
  products: readonly ProductListItem[];
  labelledBy?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return <EmptyState icon={<PackageSearchIcon />} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <SnapSlideTrack
      labelledBy={labelledBy}
      gapClassName="gap-6"
      slideClassName="flex w-[78cqi] shrink-0 snap-start"
      slideKind="قطعه"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} className="w-full" />
      ))}
    </SnapSlideTrack>
  );
}
