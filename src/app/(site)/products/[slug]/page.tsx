import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  EditableProductOccasions,
  getProductBySlug,
  getProductBySlugForStaff,
  listOccasions,
  listRelatedProducts,
  ProductDetailHeading,
  ProductEditBar,
  ProductEditProvider,
  ProductGrid,
  ProductStory,
} from "@/modules/catalog";
import { ProductBuySection } from "@/modules/orders";
import { optionalUser } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { copy } from "@/shared/config/copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const user = await optionalUser();
  const canEdit = user ? hasPermission(user.roles, "catalog:write") : false;
  const product = canEdit ? await getProductBySlugForStaff(slug) : await getProductBySlug(slug);
  if (!product) return { title: "محصول پیدا نشد" };

  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.subtitle ?? product.description,
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const user = await optionalUser();
  const canEdit = user ? hasPermission(user.roles, "catalog:write") : false;
  const product = canEdit ? await getProductBySlugForStaff(slug) : await getProductBySlug(slug);

  if (!product) notFound();

  const editFlag = Array.isArray(query.edit) ? query.edit[0] : query.edit;
  const initialEditing = canEdit && editFlag === "1";

  const [related, occasions] = await Promise.all([
    listRelatedProducts(product.id, {
      ...(product.occasions[0]
        ? { occasionSlug: product.occasions[0].slug }
        : { kind: product.kind }),
      limit: 4,
    }),
    canEdit ? listOccasions() : Promise.resolve([]),
  ]);

  return (
    <ProductEditProvider canEdit={canEdit} initialEditing={initialEditing}>
      <main className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-10 sm:px-6 sm:py-14">
        {canEdit ? <ProductEditBar product={product} /> : null}

        {canEdit && product.status !== "active" ? (
          <p className="rounded-lg bg-warning/15 px-4 py-3 text-sm text-warning">
            {copy.productDetail.draftBanner}
          </p>
        ) : null}

        <ProductBuySection
          product={product}
          heading={
            <>
              <ProductDetailHeading product={product} />
              {canEdit ? (
                <EditableProductOccasions
                  productId={product.id}
                  attached={product.occasions}
                  allOccasions={occasions}
                />
              ) : null}
            </>
          }
        />

        <ProductStory
          productId={product.id}
          description={product.description}
          highlights={product.highlights}
        />

        {related.length > 0 ? (
          <section className="grid gap-6 border-t border-gold/15 pt-12">
            <header className="grid gap-2">
              <p className="flex items-center gap-3 text-xs font-medium tracking-wide text-gold-deep">
                <span className="h-px w-8 shrink-0 bg-gold" aria-hidden />
                {copy.productDetail.relatedKicker}
              </p>
              <h2 className="text-xl font-semibold text-treasure sm:text-2xl">
                {copy.productDetail.relatedTitle}
              </h2>
            </header>
            <ProductGrid products={related} />
          </section>
        ) : null}
      </main>
    </ProductEditProvider>
  );
}
