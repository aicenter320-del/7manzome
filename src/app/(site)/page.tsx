import Link from "next/link";

import { listOccasions, listProducts, ProductGrid } from "@/modules/catalog";
import { GoldPriceBadge, tryGetCurrentGoldPrice } from "@/modules/pricing";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { GoldGlow } from "@/shared/ui/gold-glow";

export default async function HomePage() {
  const [occasions, products, goldPrice] = await Promise.all([
    listOccasions(),
    listProducts({ limit: 8 }),
    tryGetCurrentGoldPrice(18),
  ]);

  return (
    <main className="relative">
      <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
        <GoldGlow />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <p className="glass rounded-full px-4 py-1 text-xs font-medium text-gold-deep sm:text-sm">
            {site.name}
          </p>
          <h1 className="text-3xl font-bold text-balance sm:text-5xl lg:text-6xl">
            <span className="text-gold-gradient">{site.tagline}</span>
          </h1>
          <p className="max-w-xl text-muted-foreground">{site.description}</p>
          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
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

      <section className="px-4 sm:px-6">
        <div className="glass-strong mx-auto w-full max-w-6xl rounded-[2rem] p-5 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold">مناسبت‌های زندگی او</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {occasions.map((occasion) => (
              <Link key={occasion.id} href={`/occasions/${occasion.slug}`}>
                <Card className="h-full transition-transform hover:-translate-y-0.5">
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
