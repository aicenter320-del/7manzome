import Link from "next/link";

import { listOccasions, listProducts, ProductGrid } from "@/modules/catalog";
import { GoldPriceBadge, tryGetCurrentGoldPrice } from "@/modules/pricing";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default async function HomePage() {
  const [occasions, products, goldPrice] = await Promise.all([
    listOccasions(),
    listProducts({ limit: 8 }),
    tryGetCurrentGoldPrice(18),
  ]);

  return (
    <main>
      <section className="surface-warm px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="text-sm font-medium text-gold-deep">{site.name}</p>
          <h1 className="text-3xl font-bold sm:text-5xl">{site.tagline}</h1>
          <p className="max-w-xl text-muted-foreground">{site.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="gold">
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/gift">هدیه بده</Link>
            </Button>
          </div>
          <GoldPriceBadge price={goldPrice} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-xl font-semibold">مناسبت‌های زندگی او</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {occasions.map((occasion) => (
            <Link key={occasion.id} href={`/occasions/${occasion.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">
                    {occasion.emoji ? `${occasion.emoji} ` : ""}
                    {occasion.title}
                  </CardTitle>
                </CardHeader>
                {occasion.description ? (
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {occasion.description}
                    </p>
                  </CardContent>
                ) : null}
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">طلا برای کودک</h2>
          <Button asChild variant="link">
            <Link href="/products">همه محصولات</Link>
          </Button>
        </div>
        <ProductGrid products={products} />
      </section>

      <section className="border-t border-border bg-treasure-soft/40 px-4 py-16 sm:px-6">
        <p className="mx-auto max-w-2xl text-center text-2xl font-semibold text-treasure">
          {site.slogan}
        </p>
      </section>
    </main>
  );
}
