import { listOccasions, listProducts, OccasionSlider } from "@/modules/catalog";
import { tryGetCurrentGoldPrice } from "@/modules/pricing";

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
    listProducts({ limit: 8 }),
    tryGetCurrentGoldPrice(18),
  ]);

  return (
    <main className="relative">
      <HomeHero goldPrice={goldPrice} />

      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16">
        <div className="glass-strong mx-auto w-full max-w-6xl rounded-[2rem] p-5 sm:p-8">
          <OccasionSlider
            occasions={occasions}
            heading="مناسبت‌های زندگی او"
            headingId="home-occasions-heading"
          />
        </div>
      </section>

      <HomeProductsSection products={products} />
      <HomeHowItWorks />
      <HomeGiftBand />
      <HomeTrustBand />
      <HomeSloganBand />
    </main>
  );
}
