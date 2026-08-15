import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug, ProductGallery } from "@/modules/catalog";
import { AddToCartPanel } from "@/modules/orders";
import { Badge } from "@/shared/ui/badge";
import { PRODUCT_KIND_LABELS } from "@/shared/types/enums";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "محصول پیدا نشد" };

  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.subtitle ?? product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 sm:px-6">
      <div className="grid gap-4">
        <ProductGallery title={product.title} heroFileId={product.heroFileId} media={product.media} />
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">{PRODUCT_KIND_LABELS[product.kind]}</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">{product.title}</h1>
          {product.subtitle ? (
            <p className="text-muted-foreground">{product.subtitle}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {product.isPersonalizable ? <Badge variant="gold">قابل شخصی‌سازی</Badge> : null}
            {product.occasions.map((occasion) => (
              <Badge key={occasion.id} variant="secondary" asChild>
                <Link href={`/occasions/${occasion.slug}`}>{occasion.title}</Link>
              </Badge>
            ))}
          </div>
        </div>

        {product.description ? (
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        {product.highlights.length > 0 ? (
          <ul className="grid gap-1.5 text-sm">
            {product.highlights.map((item) => (
              <li key={item} className="text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <AddToCartPanel variants={product.variants} isPersonalizable={product.isPersonalizable} />
      </div>
    </main>
  );
}
