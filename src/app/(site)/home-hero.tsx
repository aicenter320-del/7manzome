import Image from "next/image";
import Link from "next/link";
import { CircleIcon, CoinsIcon, GemIcon, SquareIcon, StarIcon } from "lucide-react";
import type { ReactNode } from "react";

import stickerPortrait from "@/assets/images/hero-stickers/portrait.png";
import { GoldPriceBadge, type GoldPriceView } from "@/modules/pricing";
import { copy, cta } from "@/shared/config/copy";
import { customerImageSizes } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";

const NODES = [
  { spot: "bracelet", label: "دستبند", icon: <CircleIcon className="size-4" aria-hidden /> },
  { spot: "necklace", label: "گردنبند", icon: <GemIcon className="size-4" aria-hidden /> },
  { spot: "plaque", label: "پلاک", icon: <StarIcon className="size-4" aria-hidden /> },
  { spot: "coin", label: "سکه", icon: <CoinsIcon className="size-4" aria-hidden /> },
  { spot: "bar", label: "شمش", icon: <SquareIcon className="size-4" aria-hidden /> },
] as const;

function HeroTitle() {
  const tagline = copy.hero.tagline;
  const accent = "می‌ماند";
  const index = tagline.lastIndexOf(accent);
  if (index < 0) return tagline;
  return (
    <>
      {tagline.slice(0, index)}
      <span className="text-gold-400">{tagline.slice(index, index + accent.length)}</span>
      {tagline.slice(index + accent.length)}
    </>
  );
}

function HeroNode({
  spot,
  label,
  icon,
}: {
  spot: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <div className="hero-node" data-spot={spot}>
      <span className="hero-node-dot">{icon}</span>
      <span className="hero-node-label">{label}</span>
    </div>
  );
}

/** هیرو صورت‌فلکی: متن روی night، استیکر پرتره در چاهک قوس‌دار. */
export function HomeHero({ goldPrice }: { goldPrice: GoldPriceView | null }) {
  return (
    <>
      <section className="home-hero hero-card-in">
        <div className="mb-5 flex flex-col items-center text-center">
          <p className="hero-eyebrow">{copy.hero.badge}</p>
          <h1 className="mb-2.5 max-w-[17rem] text-[1.45rem] leading-relaxed font-extrabold text-night-foreground">
            <HeroTitle />
          </h1>
          <p className="mb-4 max-w-[17.5rem] text-[0.8125rem] leading-loose text-night-muted">
            {copy.hero.description}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Button asChild size="lg" variant="gold">
              <Link href="/products">{cta.shop}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-night-outline rounded-2xl">
              <Link href="/login?returnTo=/dashboard/treasures/new">{cta.startTreasure}</Link>
            </Button>
          </div>
        </div>

        <div className="hero-stage">
          <svg className="hero-constellation" viewBox="0 0 390 340" preserveAspectRatio="none" aria-hidden>
            <circle className="star" cx="30" cy="40" r="1.4" />
            <circle className="star" cx="70" cy="90" r="1" />
            <circle className="star" cx="340" cy="60" r="1.4" />
            <circle className="star" cx="360" cy="130" r="1" />
            <circle className="star" cx="20" cy="180" r="1.2" />
            <circle className="star" cx="45" cy="240" r="1" />
            <circle className="star" cx="355" cy="220" r="1.3" />
            <circle className="star" cx="330" cy="280" r="1" />
            <circle className="star" cx="15" cy="300" r="1.3" />
            <path className="line" d="M60,70 C110,110 140,150 145,190" />
            <path className="line" d="M330,55 C280,100 260,140 245,180" />
            <path className="line" d="M60,240 C110,220 130,210 150,205" />
            <path className="line" d="M335,255 C290,235 265,225 240,215" />
            <path className="line" d="M195,18 C195,70 195,110 195,150" />
          </svg>

          <div className="hero-portrait-well">
            <Image
              src={stickerPortrait}
              alt="کودک با گردنبند ماه و دستبند ستاره"
              sizes={customerImageSizes.halfColumn}
              className="hero-portrait"
              priority
            />
          </div>

          {NODES.map((node) => (
            <HeroNode key={node.spot} {...node} />
          ))}
        </div>
      </section>
      <GoldPriceBadge price={goldPrice} variant="night" />
    </>
  );
}
