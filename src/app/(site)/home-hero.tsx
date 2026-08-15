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
          className="object-cover object-center opacity-70"
          aria-hidden
        />
        <div className="hero-veil absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl items-center px-6 pb-16 pt-[6.75rem] sm:px-16 sm:pb-20 lg:min-h-svh lg:px-10 lg:pb-28 lg:pt-40">
        <GlassSurface
          radius={16}
          tint={0.48}
          className="w-full"
          contentClassName="hero-card-in flex flex-col items-center gap-5 px-6 py-8 text-center sm:gap-6 sm:px-12 sm:py-14"
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
