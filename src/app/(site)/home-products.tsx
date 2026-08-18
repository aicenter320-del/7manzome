import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { ProductHoverImage, ProductSlider, type ProductListItem } from "@/modules/catalog";
import { copy, cta } from "@/shared/config/copy";
import { customerImageSizes } from "@/shared/config/site";
import { formatMg } from "@/shared/lib/gold";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { GoldGlow } from "@/shared/ui/gold-glow";
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
    <article className="product-card-wash group grid overflow-hidden rounded-3xl text-card-foreground">
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
          {product.brandLine === "signature" ? (
            <Badge variant="gold">
              <SparklesIcon />
              اختصاصی هفت منظومه
            </Badge>
          ) : null}
          {product.isPersonalizable ? <Badge variant="secondary">قابل شخصی‌سازی</Badge> : null}
        </div>
      </Link>

      <div className="flex flex-col gap-2 px-4 py-5">
        <p className="text-xs text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
        <h3 className="text-lg font-semibold text-balance text-treasure">{product.title}</h3>
        {product.subtitle ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{product.subtitle}</p>
        ) : null}
        {weight ? <p className="text-sm text-muted-foreground">وزن: {weight}</p> : null}

        {product.fromPriceRial === null ? (
          <p className="text-sm text-muted-foreground">قیمت به‌زودی</p>
        ) : (
          <p>
            <span className="text-xs text-muted-foreground">از </span>
            <span className="text-lg font-semibold text-gold-deep">
              <Money rial={product.fromPriceRial} />
            </span>
          </p>
        )}

        <div className="pt-1">
          <Button asChild variant="gold" className="rounded-full">
            <Link href={`/products/${product.slug}`}>مشاهده این قطعه</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** ویترین خانه: سربرگ، قطعهٔ شاخص فشرده، اسلایدر بقیه. */
export function HomeProductsSection({ products }: { products: ProductListItem[] }) {
  const [featured, ...rest] = products;

  return (
    <section className="product-vitrine relative overflow-hidden px-4 pt-6 pb-12 text-foreground">
      <GoldGlow className="z-0 h-32" />

      <div className="relative z-10 grid gap-6">
        <SectionHead
          headingId="home-vitrine-heading"
          kicker={copy.vitrine.kicker}
          title={copy.vitrine.title}
          description={copy.vitrine.body}
          actionHref="/products"
          actionLabel={cta.viewAll}
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
