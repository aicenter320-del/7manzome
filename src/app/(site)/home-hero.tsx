import Image from "next/image";
import Link from "next/link";

import babyGoldHeroNatural from "@/assets/images/baby-gold-hero-natural.jpg";
import { GoldPriceBadge, type GoldPriceView } from "@/modules/pricing";
import { site } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { GlassSurface } from "@/shared/ui/glass";

function HeroCopy({
  goldPrice,
  align,
}: {
  goldPrice: GoldPriceView | null;
  align: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:gap-6",
        align === "center" ? "items-center text-center" : "items-start text-start",
      )}
    >
      <p className="w-fit rounded-full border border-gold/30 bg-gold-soft/50 px-4 py-1 text-xs font-medium text-gold-deep sm:text-sm">
        {site.name}
      </p>
      <h1 className="text-3xl font-bold text-balance sm:text-5xl lg:text-6xl">
        <span className="text-gold-gradient">{site.tagline}</span>
      </h1>
      <p className="max-w-xl text-muted-foreground">{site.description}</p>
      <div
        className={cn(
          "flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center",
          align === "center" ? "sm:justify-center" : "sm:justify-start",
        )}
      >
        <Button asChild size="lg" variant="gold">
          <Link href="/products">مشاهده محصولات</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/gift">هدیه بده</Link>
        </Button>
      </div>
      <GoldPriceBadge price={goldPrice} />
    </div>
  );
}

/** هیرو: عکس تمام‌عرض زیر کارت مات در موبایل؛ شیشه و ماسک در دسکتاپ. */
export function HomeHero({ goldPrice }: { goldPrice: GoldPriceView | null }) {
  return (
    <section className="relative flex min-h-[32rem] items-center justify-center overflow-hidden bg-background px-4 py-8 sm:min-h-[36rem] lg:min-h-[32rem] lg:justify-end lg:px-6 lg:py-24">
      <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
        <Image
          src={babyGoldHeroNatural}
          alt=""
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="object-cover object-[78%_center]"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 start-0 hidden h-full lg:flex"
        aria-hidden
      >
        <Image
          src={babyGoldHeroNatural}
          alt=""
          width={1024}
          height={571}
          priority
          unoptimized
          quality={100}
          sizes="70vw"
          className="hero-photo-mask h-full w-auto max-w-none object-contain object-right"
        />
      </div>

      <div className="relative z-10 w-full max-w-lg lg:hidden">
        <div className="hero-card-in rounded-lg bg-background px-6 py-8 text-center shadow-xl">
          <HeroCopy goldPrice={goldPrice} align="center" />
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-6xl justify-end lg:flex">
        <div className="w-5/12">
          <GlassSurface
            radius={16}
            tint={0.48}
            className="w-full"
            contentClassName="hero-card-in px-10 py-12"
          >
            <HeroCopy goldPrice={goldPrice} align="start" />
          </GlassSurface>
        </div>
      </div>
    </section>
  );
}
