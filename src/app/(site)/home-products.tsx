import Image from "next/image";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { ProductGrid, type ProductListItem } from "@/modules/catalog";
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

/** قطعهٔ شاخص ویترین؛ تصویر بزرگ کنار روایت و قیمت. */
function FeaturedProduct({ product }: { product: ProductListItem }) {
  const weight = weightLabel(product);

  return (
    <article className="product-card-wash grid overflow-hidden rounded-lg text-card-foreground md:grid-cols-2">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted md:aspect-auto md:min-h-96"
      >
        {product.heroFileId ? (
          <Image
            src={`/api/files/${product.heroFileId}`}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-6 transition-transform duration-700 motion-safe:hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            بدون تصویر
          </div>
        )}
      </Link>

      <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
        <div className="flex flex-wrap gap-2">
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

        <p className="text-sm text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
        <h3 className="text-2xl font-semibold text-balance sm:text-4xl">{product.title}</h3>
        {product.subtitle ? (
          <p className="text-muted-foreground leading-relaxed">{product.subtitle}</p>
        ) : null}
        {weight ? <p className="text-sm text-muted-foreground">وزن: {weight}</p> : null}

        {product.fromPriceRial === null ? (
          <p className="text-muted-foreground">قیمت به‌زودی</p>
        ) : (
          <p>
            <span className="text-sm text-muted-foreground">از </span>
            <span className="text-2xl font-semibold text-gold-deep">
              <Money rial={product.fromPriceRial} />
            </span>
          </p>
        )}

        <div>
          <Button asChild variant="gold" size="lg">
            <Link href={`/products/${product.slug}`}>مشاهده این قطعه</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** ویترین سفید خانه؛ هالهٔ طلایی و قطعهٔ شاخص روی زمینه روشن. */
export function HomeProductsSection({ products }: { products: ProductListItem[] }) {
  const [featured, ...rest] = products;

  return (
    <section className="product-vitrine relative overflow-hidden px-4 py-20 text-foreground sm:px-6 sm:py-28">
      <GoldGlow className="z-0 h-[min(28rem,70vh)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid max-w-xl gap-3">
            <p className="w-fit rounded-full border border-gold/35 bg-gold-soft px-3 py-1 text-xs font-medium text-gold-deep">
              ویترین هفت منظومه
            </p>
            <h2 className="text-gold-gradient text-2xl font-semibold sm:text-4xl">طلا برای کودک</h2>
            <p className="text-muted-foreground leading-relaxed">
              زیور، سکه و شمش؛ هر قطعه می‌تواند شروع گنجینه او باشد.
            </p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link href="/products">همه محصولات</Link>
          </Button>
        </header>

        {featured ? <FeaturedProduct product={featured} /> : null}

        {rest.length > 0 || !featured ? (
          <ProductGrid
            products={rest}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            emptyTitle="هنوز محصولی در فروشگاه نیست"
            emptyDescription="پس از افزودن محصول از پنل مدیریت، اینجا نمایش داده می‌شود."
          />
        ) : null}
      </div>
    </section>
  );
}
