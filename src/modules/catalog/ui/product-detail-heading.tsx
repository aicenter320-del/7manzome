"use client";

import Link from "next/link";
import { toast } from "sonner";
import { SparklesIcon } from "lucide-react";

import { updateProduct } from "@/modules/catalog/actions/catalog.actions";
import { copy } from "@/shared/config/copy";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";

import type { ProductDetail } from "../domain/types";
import { InlineTextField } from "./inline-text-field";
import { useProductEdit } from "./product-edit-context";

/** سربرگ صفحهٔ محصول: مسیر، عنوان، مناسبت. */
export function ProductDetailHeading({ product }: { product: ProductDetail }) {
  const { editing } = useProductEdit();
  const kindLabel = PRODUCT_KIND_LABELS[product.kind];

  const saveTitle = async (title: string) => {
    if (title.length < 2) {
      toast.error("عنوان باید حداقل دو حرف باشد.");
      throw new Error("title");
    }
    const result = await updateProduct({ productId: product.id, title });
    if (!result.ok) {
      toast.error(result.error);
      throw new Error(result.error);
    }
  };

  const saveSubtitle = async (subtitle: string) => {
    const result = await updateProduct({ productId: product.id, subtitle });
    if (!result.ok) {
      toast.error(result.error);
      throw new Error(result.error);
    }
  };

  return (
    <div className="grid gap-5">
      <nav aria-label="مسیر صفحه">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <li>
            <Link href="/products" className="transition-colors hover:text-gold-deep">
              {copy.products.title}
            </Link>
          </li>
          <li aria-hidden className="text-gold/60">
            /
          </li>
          <li>{kindLabel}</li>
        </ol>
      </nav>

      <div className="grid gap-3">
        <p className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-gold-deep">
          <span className="h-px w-8 shrink-0 bg-gold" aria-hidden />
          {kindLabel}
          {product.brandLine === "signature" ? (
            <Badge variant="gold">
              <SparklesIcon />
              {copy.productDetail.signature}
            </Badge>
          ) : null}
          {product.isPersonalizable ? (
            <Badge variant="secondary">قابل شخصی‌سازی</Badge>
          ) : null}
        </p>

        {editing ? (
          <InlineTextField
            value={product.title}
            placeholder="عنوان قطعه"
            className="text-3xl font-semibold text-balance text-treasure sm:text-4xl"
            inputClassName="text-3xl font-semibold text-treasure sm:text-4xl"
            onSave={saveTitle}
          />
        ) : (
          <h1 className="text-3xl font-semibold text-balance text-treasure sm:text-4xl">
            {product.title}
          </h1>
        )}

        {editing ? (
          <InlineTextField
            value={product.subtitle ?? ""}
            placeholder="زیرعنوان؛ برای نوشتن کلیک کنید"
            className="max-w-xl text-muted-foreground leading-relaxed"
            onSave={saveSubtitle}
          />
        ) : product.subtitle ? (
          <p className="max-w-xl text-muted-foreground leading-relaxed">{product.subtitle}</p>
        ) : null}

        {!editing && product.occasions.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {product.occasions.map((occasion) => (
              <li key={occasion.id}>
                <Link
                  href={`/occasions/${occasion.slug}`}
                  className="text-muted-foreground transition-colors hover:text-gold-deep"
                >
                  {occasion.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
