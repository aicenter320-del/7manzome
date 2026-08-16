import Image from "next/image";
import Link from "next/link";

import babyGoldHeroNatural from "@/assets/images/baby-gold-hero-natural.jpg";
import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";

/** کارت هیرو: عکس با عنوان روی آن، نوار طلایی و دکمهٔ سفید. */
export function HomeHero() {
  return (
    <section className="px-4 pt-4">
      <article className="hero-card-in overflow-hidden rounded-3xl shadow-product">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
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
          <div className="hero-overlay pointer-events-none absolute inset-0" aria-hidden />
          <div className="hero-overlay-fg absolute inset-x-0 bottom-0 grid gap-2 p-5">
            <p className="text-xs font-medium">{copy.hero.badge}</p>
            <h1 className="text-3xl font-bold text-balance">{copy.hero.tagline}</h1>
          </div>
        </div>

        <div className="hero-gold-band grid justify-items-center gap-4 px-5 py-6 text-center">
          <p className="text-sm leading-relaxed">{copy.hero.description}</p>
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-card text-foreground shadow-none hover:bg-card/90"
          >
            <Link href="/products">{cta.shop}</Link>
          </Button>
        </div>
      </article>
    </section>
  );
}
