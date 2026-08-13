import Link from "next/link";

import { listOccasions, listProducts, OccasionCard, ProductGrid } from "@/modules/catalog";
import { tryGetCurrentGoldPrice } from "@/modules/pricing";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";

import { HomeHero } from "./home-hero";

export default async function HomePage() {
  const [occasions, products, goldPrice] = await Promise.all([
    listOccasions(),
    listProducts({ limit: 8 }),
    tryGetCurrentGoldPrice(18),
  ]);

  return (
    <main className="relative">
      <HomeHero goldPrice={goldPrice} />

      <section className="px-4 sm:px-6">
        <div className="glass-strong mx-auto w-full max-w-6xl rounded-[2rem] p-5 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold">مناسبت‌های زندگی او</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {occasions.map((occasion) => (
              <OccasionCard key={occasion.id} occasion={occasion} />
            ))}
          </div>

          <div className="mt-10 mb-6 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">طلا برای کودک</h2>
            <Button asChild variant="link">
              <Link href="/products">همه محصولات</Link>
            </Button>
          </div>
          <ProductGrid products={products} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <p className="mx-auto max-w-2xl text-center text-2xl font-semibold text-treasure text-balance">
          {site.slogan}
        </p>
      </section>
    </main>
  );
}
