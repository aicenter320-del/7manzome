import { listOccasions, listProducts, OccasionSlider } from "@/modules/catalog";
import { tryGetCurrentGoldPrice } from "@/modules/pricing";
import { copy } from "@/shared/config/copy";

import { HomeHero } from "./home-hero";
import { HomeProductsSection } from "./home-products";
import {
  HomeGiftBand,
  HomeHowItWorks,
  HomeProofBar,
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
      <HomeHero />
      <HomeProofBar goldPrice={goldPrice} />
      <HomeProductsSection products={products} />
      <HomeTrustBand />

      <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <OccasionSlider
            occasions={occasions}
            heading={copy.homeOccasions.heading}
            headingId="home-occasions-heading"
          />
        </div>
      </section>

      <HomeHowItWorks />
      <HomeGiftBand />
      <HomeSloganBand />
    </main>
  );
}
