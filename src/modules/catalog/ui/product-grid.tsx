import { PackageSearchIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { EmptyState } from "@/shared/ui/empty-state";

import type { ProductListItem } from "../domain/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  className,
  emptyTitle = "محصولی با این مشخصات پیدا نشد",
  emptyDescription = "فیلترها را تغییر دهید یا از میان مناسبت‌ها انتخاب کنید.",
}: {
  products: readonly ProductListItem[];
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearchIcon />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
