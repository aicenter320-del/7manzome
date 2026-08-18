import { listCategories, listOccasions, listProducts, OccasionSlider } from "@/modules/catalog";
import { tryGetCurrentGoldPrice } from "@/modules/pricing";
import { copy } from "@/shared/config/copy";
import { SectionHead } from "@/shared/ui/section-head";

import { HomeHero } from "./home-hero";
import { HomeProductsSection } from "./home-products";
import {
  HomeGiftBand,
  HomeHowItWorks,
  HomeSloganBand,
} from "./home-story";

export default async function HomePage() {
  const [occasions, products, categories, goldPrice] = await Promise.all([
    listOccasions(),
    listProducts(),
    listCategories(),
    tryGetCurrentGoldPrice(18),
  ]);

  return (
    <main className="relative">
      <HomeHero goldPrice={goldPrice} />
      <HomeProductsSection products={products} categories={categories} />
      <HomeGiftBand />

      <HomeHowItWorks />

      <section className="bg-background px-5 py-8">
        <div className="grid gap-5">
          <SectionHead
            headingId="home-occasions-heading"
            kicker={copy.homeOccasions.heading}
          />
          <OccasionSlider occasions={occasions} labelledBy="home-occasions-heading" />
        </div>
      </section>

      <HomeSloganBand />
    </main>
  );
}
