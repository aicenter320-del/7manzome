import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getOccasionBySlug, listProducts, ProductGrid } from "@/modules/catalog";
import { PageHeader } from "@/shared/ui/page-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const occasion = await getOccasionBySlug(slug);
  if (!occasion) return { title: "مناسبت پیدا نشد" };
  return { title: occasion.title, description: occasion.description };
}

export default async function OccasionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const occasion = await getOccasionBySlug(slug);
  if (!occasion) notFound();

  const products = await listProducts({ occasionSlug: occasion.slug });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title={`${occasion.emoji ? `${occasion.emoji} ` : ""}${occasion.title}`}
        description={
          occasion.description ?? "برای این مناسبت، هدیه‌ای ماندگار از طلا انتخاب کنید."
        }
      />
      <div className="mt-8">
        <ProductGrid
          products={products}
          emptyTitle="هنوز محصولی برای این مناسبت نیست"
          emptyDescription="از صفحه محصولات دیدن کنید یا بعداً سر بزنید."
        />
      </div>
    </main>
  );
}
