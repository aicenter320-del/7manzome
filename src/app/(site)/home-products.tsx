import Link from "next/link";

import { ProductHoverImage, ProductSlider, type ProductListItem } from "@/modules/catalog";
import { copy } from "@/shared/config/copy";
import { customerImageSizes } from "@/shared/config/site";
import { formatMg } from "@/shared/lib/gold";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Money } from "@/shared/ui/money";
import { SectionHead } from "@/shared/ui/section-head";

function weightLabel(product: ProductListItem) {
  if (product.minWeightMg === null) return null;
  if (product.minWeightMg === product.maxWeightMg) {
    return formatMg(product.minWeightMg);
  }
  return `${formatMg(product.minWeightMg, { withUnit: false })} تا ${formatMg(product.maxWeightMg ?? product.minWeightMg)}`;
}

/** قطعهٔ شاخص فشرده: عکس، گونه، نام، وزن، قیمت. */
function FeaturedProduct({ product }: { product: ProductListItem }) {
  const weight = weightLabel(product);

  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-border bg-card">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-4/3 overflow-hidden bg-muted"
      >
        <ProductHoverImage
          heroFileId={product.heroFileId}
          hoverFileId={product.hoverFileId}
          alt={product.title}
          sizes={customerImageSizes.column}
        />
        <div className="absolute end-3 top-3 z-10 flex flex-col items-end gap-1">
          {product.isPersonalizable ? (
            <Badge className="rounded-full bg-card text-gold-deep">قابل شخصی‌سازی</Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-col gap-1 px-4 py-4">
        <p className="text-[0.7rem] text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
        <h3 className="text-base font-bold text-balance text-treasure">{product.title}</h3>
        {product.subtitle ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{product.subtitle}</p>
        ) : weight ? (
          <p className="text-xs text-muted-foreground">وزن: {weight}</p>
        ) : null}

        {product.fromPriceRial === null ? (
          <p className="pt-1 text-sm text-muted-foreground">قیمت به‌زودی</p>
        ) : (
          <p className="pt-1 text-sm font-extrabold text-gold-deep">
            <Money rial={product.fromPriceRial} />
          </p>
        )}
      </div>
    </article>
  );
}

/** ویترین خانه: سربرگ، قطعهٔ شاخص فشرده، اسلایدر بقیه. */
export function HomeProductsSection({ products }: { products: ProductListItem[] }) {
  const [featured, ...rest] = products;

  return (
    <section className="relative overflow-hidden bg-background px-5 pt-2 pb-8 text-foreground">
      <div className="grid gap-5">
        <SectionHead
          headingId="home-vitrine-heading"
          kicker={copy.vitrine.kicker}
          title={copy.vitrine.title}
          description={copy.vitrine.body}
        />

        {featured ? <FeaturedProduct product={featured} /> : null}

        {rest.length > 0 || !featured ? (
          <ProductSlider
            products={rest}
            labelledBy="home-vitrine-heading"
            emptyTitle={copy.vitrine.emptyTitle}
            emptyDescription={copy.vitrine.emptyDescription}
          />
        ) : null}
      </div>
    </section>
  );
}
