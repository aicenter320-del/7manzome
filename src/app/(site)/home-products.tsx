import Link from "next/link";
import { PackageSearchIcon } from "lucide-react";

import { CategoryExplorer, ProductHoverImage, type Category, type ProductListItem } from "@/modules/catalog";
import { copy, cta } from "@/shared/config/copy";
import { customerImageSizes } from "@/shared/config/site";
import { formatMg } from "@/shared/lib/gold";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Money } from "@/shared/ui/money";
import { SectionHead } from "@/shared/ui/section-head";
import { SnapSlideTrack } from "@/shared/ui/snap-slide-track";

function weightLabel(product: ProductListItem) {
  if (product.minWeightMg === null) return null;
  if (product.minWeightMg === product.maxWeightMg) {
    return formatMg(product.minWeightMg);
  }
  return `${formatMg(product.minWeightMg, { withUnit: false })} تا ${formatMg(product.maxWeightMg ?? product.minWeightMg)}`;
}

function productPrice(product: ProductListItem) {
  if (product.fromPriceRial === null) {
    return <p className="pt-1 text-sm text-muted-foreground">قیمت به‌زودی</p>;
  }
  return (
    <p className="pt-1 text-sm font-extrabold text-gold-deep">
      <Money rial={product.fromPriceRial} />
    </p>
  );
}

/** قطعهٔ شاخص فشرده: کل کارت لینک به محصول است. */
function FeaturedProduct({ product }: { product: ProductListItem }) {
  const weight = weightLabel(product);

  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-border bg-card">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-56 overflow-hidden bg-muted">
          <ProductHoverImage
            heroFileId={product.heroFileId}
            hoverFileId={product.hoverFileId}
            alt={product.title}
            sizes={customerImageSizes.column}
          />
          {product.isPersonalizable ? (
            <Badge className="absolute inset-e-3 top-3 z-10 rounded-full bg-card text-gold-deep">
              قابل شخصی‌سازی
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 px-4 py-3.5">
          <p className="text-[0.7rem] text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
          <h3 className="text-base font-bold text-balance text-treasure">{product.title}</h3>
          {product.subtitle ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{product.subtitle}</p>
          ) : weight ? (
            <p className="text-xs text-muted-foreground">وزن: {weight}</p>
          ) : null}
          {productPrice(product)}
        </div>
      </Link>
    </article>
  );
}

/** کارت peek کوتاه برای اسلایدر خانه؛ مربع کاتالوگ نیست. */
function PeekProduct({ product }: { product: ProductListItem }) {
  const weight = weightLabel(product);

  return (
    <article className="h-full overflow-hidden rounded-[1.125rem] border border-border bg-card">
      <Link href={`/products/${product.slug}`} className="flex h-full flex-col">
        <div className="relative h-38 overflow-hidden bg-muted">
          <ProductHoverImage
            heroFileId={product.heroFileId}
            hoverFileId={product.hoverFileId}
            alt={product.title}
            sizes={customerImageSizes.halfColumn}
          />
        </div>
        <div className="grid flex-1 gap-0.5 px-3 py-3">
          <p className="text-[0.65rem] text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
          <h3 className="text-sm font-bold text-balance text-treasure">{product.title}</h3>
          {weight ? <p className="text-[0.7rem] text-muted-foreground">{weight}</p> : null}
          {productPrice(product)}
        </div>
      </Link>
    </article>
  );
}

/** ویترین خانه: دسته‌های دایره‌ای، قطعهٔ شاخص، اسلایدر peek، دکمهٔ کاتالوگ. */
export function HomeProductsSection({
  products,
  categories,
}: {
  products: ProductListItem[];
  categories: Category[];
}) {
  const [featured, ...rest] = products;

  return (
    <section className="relative bg-background px-5 pt-2 pb-8 text-foreground">
      <div className="grid gap-5">
        {categories.length > 0 ? (
          <>
            <SectionHead
              headingId="home-categories-heading"
              kicker={copy.homeCategories.kicker}
            />
            <CategoryExplorer categories={categories} labelledBy="home-categories-heading" />
          </>
        ) : null}

        <SectionHead
          headingId="home-vitrine-heading"
          kicker={copy.vitrine.kicker}
          title={<span className="font-extrabold">{copy.vitrine.title}</span>}
          description={
            <span className="text-xs leading-loose">{copy.vitrine.body}</span>
          }
        />

        {featured ? <FeaturedProduct product={featured} /> : null}

        {rest.length > 0 ? (
          <SnapSlideTrack
            labelledBy="home-vitrine-heading"
            slideClassName="w-[78cqi] shrink-0 snap-start"
            slideKind="قطعه"
          >
            {rest.map((product) => (
              <PeekProduct key={product.id} product={product} />
            ))}
          </SnapSlideTrack>
        ) : !featured ? (
          <EmptyState
            icon={<PackageSearchIcon />}
            title={copy.vitrine.emptyTitle}
            description={copy.vitrine.emptyDescription}
          />
        ) : null}

        <Button asChild variant="gold" size="lg" className="w-full">
          <Link href="/products">{cta.shop}</Link>
        </Button>
      </div>
    </section>
  );
}
