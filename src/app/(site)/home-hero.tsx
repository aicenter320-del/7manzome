import Image from "next/image";
import Link from "next/link";

import babyGoldHeroNatural from "@/assets/images/baby-gold-hero-natural.jpg";
import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";
import { GlassSurface } from "@/shared/ui/glass";

function HeroCopy() {
  return (
    <div className="flex w-full flex-col items-center gap-5 text-center sm:gap-6">
      <p className="w-fit rounded-full border border-gold/30 bg-gold-soft/50 px-4 py-1 text-xs font-medium text-gold-deep sm:text-sm">
        {copy.hero.badge}
      </p>
      <h1 className="text-3xl font-bold text-balance sm:text-4xl lg:text-5xl">
        <span className="text-gold-gradient">{copy.hero.tagline}</span>
      </h1>
      <p className="max-w-sm text-muted-foreground leading-relaxed">{copy.hero.description}</p>
      <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
        <Button asChild size="lg" variant="gold">
          <Link href="/products">{cta.shop}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/gift">{cta.gift}</Link>
        </Button>
      </div>
    </div>
  );
}

/** هیرو تمام‌صفحه: عکس تا لبهٔ پایین ویوپورت می‌رسد؛ کارت روی آن می‌نشیند. */
export function HomeHero() {
  return (
    <section className="home-hero relative flex items-center justify-center overflow-hidden bg-background px-4 lg:justify-end lg:px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={babyGoldHeroNatural}
          alt=""
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="hero-photo object-cover object-[78%_center]"
        />
      </div>

      <div className="relative z-10 w-full max-w-lg lg:hidden">
        <div className="hero-card-in hero-card-frost rounded-lg px-6 py-8 text-center shadow-xl">
          <HeroCopy />
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-6xl justify-end lg:flex">
        <div className="w-5/12">
          <GlassSurface
            radius={16}
            tint={0.48}
            className="w-full"
            contentClassName="hero-card-in flex flex-col items-center justify-center px-10 py-12 text-center"
          >
            <HeroCopy />
          </GlassSurface>
        </div>
      </div>
    </section>
  );
}
