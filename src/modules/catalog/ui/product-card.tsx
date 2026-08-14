import Image from "next/image";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatMg } from "@/shared/lib/gold";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Money } from "@/shared/ui/money";

import type { ProductListItem } from "../domain/types";

/** کارت محصول در فهرست. */
export function ProductCard({
  product,
  className,
}: {
  product: ProductListItem;
  className?: string;
}) {
  const weightLabel =
    product.minWeightMg === null
      ? null
      : product.minWeightMg === product.maxWeightMg
        ? formatMg(product.minWeightMg)
        : `${formatMg(product.minWeightMg, { withUnit: false })} تا ${formatMg(product.maxWeightMg ?? product.minWeightMg)}`;

  return (
    <div
      className={cn(
        "product-card-wash group overflow-hidden rounded-lg border border-gold-deep/70 text-card-foreground transition-transform hover:-translate-y-0.5",
        className,
      )}
    >
      <Link href={`/products/${product.slug}`} className="block focus-visible:outline-none">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.heroFileId ? (
            <Image
              src={`/api/files/${product.heroFileId}`}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              بدون تصویر
            </div>
          )}

          <div className="absolute end-2 top-2 flex flex-col items-end gap-1">
            {product.brandLine === "signature" ? (
              <Badge variant="gold">
                <SparklesIcon />
                اختصاصی هفت منظومه
              </Badge>
            ) : null}
            {product.isPersonalizable ? (
              <Badge variant="secondary">قابل شخصی‌سازی</Badge>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2 p-4">
          <div className="flex h-5 items-center justify-between gap-3">
            <p className="text-xs leading-5 text-muted-foreground">
              {PRODUCT_KIND_LABELS[product.kind]}
            </p>
            {product.fromPriceRial === null ? (
              <p className="shrink-0 text-sm leading-5 text-muted-foreground">قیمت به‌زودی</p>
            ) : (
              <p className="shrink-0 text-sm leading-5">
                <span className="text-muted-foreground">از </span>
                <span className="font-semibold text-gold-deep">
                  <Money rial={product.fromPriceRial} />
                </span>
              </p>
            )}
          </div>

          <div className="flex h-5 items-center justify-between gap-3">
            <h3 className="min-w-0 truncate text-sm font-medium leading-5">{product.title}</h3>
            {weightLabel ? (
              <p className="shrink-0 text-xs leading-5 text-muted-foreground">وزن: {weightLabel}</p>
            ) : null}
          </div>
        </div>
      </Link>
    </div>
  );
}
