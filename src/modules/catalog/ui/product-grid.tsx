import { PackageSearchIcon } from "lucide-react";

import { copy } from "@/shared/config/copy";
import { cn } from "@/shared/lib/cn";
import { EmptyState } from "@/shared/ui/empty-state";

import type { ProductListItem } from "../domain/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  className,
  emptyTitle = copy.products.emptyTitle,
  emptyDescription = copy.products.emptyDescription,
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
        "grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
