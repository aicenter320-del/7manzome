import { listOccasions, listProducts, OccasionSlider } from "@/modules/catalog";
import { tryGetCurrentGoldPrice } from "@/modules/pricing";
import { copy } from "@/shared/config/copy";

import { HomeHero } from "./home-hero";
import { HomeProductsSection } from "./home-products";
import {
  HomeGiftBand,
  HomeHowItWorks,
  HomeSloganBand,
  HomeTrustBand,
} from "./home-story";

export default async function HomePage() {
  const [occasions, products, goldPrice] = await Promise.all([
    listOccasions(),
    listProducts(),
    tryGetCurrentGoldPrice(18),
  ]);

  return (
    <main className="relative">
      <HomeHero goldPrice={goldPrice} />
      <HomeProductsSection products={products} />
      <HomeTrustBand />

      <section className="bg-background px-5 py-8">
        <div className="grid gap-5">
          <h2 id="home-occasions-heading" className="hero-eyebrow hero-eyebrow-light">
            {copy.homeOccasions.heading}
          </h2>
          <OccasionSlider occasions={occasions} labelledBy="home-occasions-heading" />
        </div>
      </section>

      <HomeHowItWorks />
      <HomeGiftBand />
      <HomeSloganBand />
    </main>
  );
}
