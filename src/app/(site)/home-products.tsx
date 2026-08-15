import Link from "next/link";
import { ArrowLeftIcon, SparklesIcon } from "lucide-react";

import { ProductHoverImage, ProductSlider, type ProductListItem } from "@/modules/catalog";
import { copy, cta } from "@/shared/config/copy";
import { formatMg } from "@/shared/lib/gold";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { GoldGlow } from "@/shared/ui/gold-glow";
import { Money } from "@/shared/ui/money";

function weightLabel(product: ProductListItem) {
  if (product.minWeightMg === null) return null;
  if (product.minWeightMg === product.maxWeightMg) {
    return formatMg(product.minWeightMg);
  }
  return `${formatMg(product.minWeightMg, { withUnit: false })} تا ${formatMg(product.maxWeightMg ?? product.minWeightMg)}`;
}

/** قطعهٔ شاخص؛ همان زبان کارت شبکه: عکس، گونه، نام، وزن، قیمت. */
function FeaturedProduct({ product }: { product: ProductListItem }) {
  const weight = weightLabel(product);

  return (
    <article className="product-card-wash group grid overflow-hidden rounded-lg text-card-foreground lg:grid-cols-2">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted lg:aspect-auto lg:min-h-[28rem]"
      >
        <ProductHoverImage
          heroFileId={product.heroFileId}
          hoverFileId={product.hoverFileId}
          alt={product.title}
          sizes="(max-width: 1024px) 100vw, 50vw"
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

      <div className="flex flex-col justify-center gap-3 px-6 py-8 sm:px-10 sm:py-12">
        <p className="text-xs text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
        <h3 className="text-2xl font-semibold text-balance text-treasure sm:text-3xl">{product.title}</h3>
        {product.subtitle ? (
          <p className="max-w-md text-muted-foreground leading-relaxed">{product.subtitle}</p>
        ) : null}
        {weight ? <p className="text-sm text-muted-foreground">وزن: {weight}</p> : null}

        {product.fromPriceRial === null ? (
          <p className="text-muted-foreground">قیمت به‌زودی</p>
        ) : (
          <p>
            <span className="text-xs text-muted-foreground">از </span>
            <span className="text-xl font-semibold text-gold-deep">
              <Money rial={product.fromPriceRial} />
            </span>
          </p>
        )}

        <div className="pt-2">
          <Button asChild variant="gold">
            <Link href={`/products/${product.slug}`}>مشاهده این قطعه</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** ویترین خانه: سربرگ ویرایشی، یک قطعهٔ شاخص، اسلایدر بقیهٔ قطعه‌ها. */
export function HomeProductsSection({ products }: { products: ProductListItem[] }) {
  const [featured, ...rest] = products;

  return (
    <section className="product-vitrine relative overflow-hidden px-4 pt-14 pb-16 text-foreground sm:px-6 sm:pt-20 sm:pb-24">
      <GoldGlow className="z-0 h-40 sm:h-56" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 sm:gap-12">
        <header className="grid gap-3">
          <p className="flex items-center gap-3 text-xs font-medium tracking-wide text-gold-deep">
            <span className="h-px w-8 shrink-0 bg-gold" aria-hidden />
            {copy.vitrine.kicker}
          </p>

          <div className="flex items-center justify-between gap-6">
            <h2 id="home-vitrine-heading" className="text-2xl font-semibold text-balance text-treasure sm:text-4xl">
              {copy.vitrine.title}
            </h2>
            <Link
              href="/products"
              className="hidden min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-gold-deep transition-colors hover:text-treasure sm:inline-flex"
            >
              {cta.allProducts}
              <ArrowLeftIcon className="size-4" aria-hidden />
            </Link>
          </div>

          <p className="max-w-xl text-muted-foreground leading-relaxed">{copy.vitrine.body}</p>

          <Link
            href="/products"
            className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-gold-deep sm:hidden"
          >
            {cta.allProducts}
            <ArrowLeftIcon className="size-4" aria-hidden />
          </Link>
        </header>

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
