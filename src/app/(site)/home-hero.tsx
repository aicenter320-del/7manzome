import Image from "next/image";
import Link from "next/link";

import heroGoldProducts from "@/assets/images/hero-gold-products.jpg";
import { GoldPriceBadge, type GoldPriceView } from "@/modules/pricing";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { GlassSurface } from "@/shared/ui/glass";

/** هیرو تمام‌صفحه از بالای ویوپورت، پشت منوی شناور. */
export function HomeHero({ goldPrice }: { goldPrice: GoldPriceView | null }) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={heroGoldProducts}
          alt=""
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl items-center px-8 pb-12 pt-[5.25rem] sm:px-12 lg:min-h-svh lg:px-6 lg:pb-16 lg:pt-32">
        <GlassSurface
          radius={32}
          tint={0.48}
          className="w-full"
          contentClassName="hero-card-in flex flex-col items-center gap-4 px-5 py-6 text-center sm:gap-5 sm:px-10 sm:py-12"
        >
          <p className="rounded-full border border-gold/30 bg-gold-soft/50 px-4 py-1 text-xs font-medium text-gold-deep sm:text-sm">
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
        </GlassSurface>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent lg:h-24"
      />
    </section>
  );
}
