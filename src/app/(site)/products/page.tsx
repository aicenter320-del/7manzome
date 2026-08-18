import {
  listCategories,
  listOccasions,
  listProducts,
  ProductFilterSheet,
  ProductGrid,
  StorefrontAddProduct,
} from "@/modules/catalog";
import { optionalUser } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { copy } from "@/shared/config/copy";
import { PageHeader } from "@/shared/ui/page-header";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; occasion?: string | string[] }>;
}) {
  const params = await searchParams;
  const categorySlug = firstParam(params.category);
  const occasionSlug = firstParam(params.occasion);

  const [categories, occasions, products, user] = await Promise.all([
    listCategories(),
    listOccasions(),
    listProducts({
      ...(categorySlug ? { categorySlug } : {}),
      ...(occasionSlug ? { occasionSlug } : {}),
    }),
    optionalUser(),
  ]);
  const canWrite = user ? hasPermission(user.roles, "catalog:write") : false;

  return (
    <main className="px-4 pt-6 pb-24">
      <PageHeader title={copy.products.title} description={copy.products.description} />
      {canWrite ? (
        <div className="mt-6">
          <StorefrontAddProduct />
        </div>
      ) : null}

      <div className="mt-8">
        <ProductGrid
          products={products}
          emptyTitle={copy.products.emptyTitle}
          emptyDescription={copy.products.emptyDescription}
        />
      </div>

      <ProductFilterSheet
        categories={categories}
        occasions={occasions}
        categorySlug={categorySlug}
        occasionSlug={occasionSlug}
      />
    </main>
  );
}
