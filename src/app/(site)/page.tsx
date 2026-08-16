import { listOccasions, listProducts, OccasionSlider } from "@/modules/catalog";
import { tryGetCurrentGoldPrice } from "@/modules/pricing";
import { copy, cta } from "@/shared/config/copy";
import { SectionHead } from "@/shared/ui/section-head";

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

      <section className="bg-background px-4 py-10">
        <div className="grid gap-6">
          <SectionHead
            headingId="home-occasions-heading"
            title={copy.homeOccasions.heading}
            actionHref="/occasions"
            actionLabel={cta.viewAll}
          />
          <OccasionSlider occasions={occasions} labelledBy="home-occasions-heading" />
        </div>
      </section>

      <HomeHowItWorks />
      <HomeGiftBand />
      <HomeSloganBand />
    </main>
  );
}
