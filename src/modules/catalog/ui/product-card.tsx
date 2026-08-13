import Image from "next/image";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatMg } from "@/shared/lib/gold";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
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
    <Card className={cn("group overflow-hidden transition-shadow hover:shadow-md", className)}>
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

        <div className="grid gap-1.5 p-4">
          <p className="text-xs text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
          <h3 className="line-clamp-2 font-medium leading-snug">{product.title}</h3>

          {weightLabel ? (
            <p className="text-xs text-muted-foreground">وزن: {weightLabel}</p>
          ) : null}

          <div className="mt-1.5">
            {product.fromPriceRial === null ? (
              <p className="text-sm text-muted-foreground">قیمت به‌زودی</p>
            ) : (
              <p className="text-sm">
                <span className="text-muted-foreground">از </span>
                <span className="font-semibold text-gold-deep">
                  <Money rial={product.fromPriceRial} />
                </span>
              </p>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
