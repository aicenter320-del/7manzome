import Link from "next/link";
import type { ReactNode } from "react";

import {
  listCategories,
  listOccasions,
  listProducts,
  OccasionLabel,
  ProductGrid,
} from "@/modules/catalog";
import { cn } from "@/shared/lib/cn";
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

  const [categories, occasions, products] = await Promise.all([
    listCategories(),
    listOccasions(),
    listProducts({
      ...(categorySlug ? { categorySlug } : {}),
      ...(occasionSlug ? { occasionSlug } : {}),
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="طلا برای کودک"
        description="قطعه‌ای که امروز هدیه می‌شود، می‌تواند بخشی از گنجینه فردای او باشد."
      />

      <div className="mt-8 grid gap-6">
        <div className="flex flex-wrap gap-2">
          <FilterChip href="/products" active={!categorySlug && !occasionSlug}>
            همه
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              href={`/products?category=${category.slug}`}
              active={categorySlug === category.slug}
            >
              {category.title}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {occasions.map((occasion) => (
            <FilterChip
              key={occasion.id}
              href={`/products?occasion=${occasion.slug}`}
              active={occasionSlug === occasion.slug}
            >
              <OccasionLabel
                slug={occasion.slug}
                title={occasion.title}
                emoji={occasion.emoji}
                variant="plain"
              />
            </FilterChip>
          ))}
        </div>

        <ProductGrid products={products} />
      </div>
    </main>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-gold bg-gold-soft text-gold-deep shadow-glow"
          : "glass text-muted-foreground hover:text-gold-deep",
      )}
    >
      {children}
    </Link>
  );
}
