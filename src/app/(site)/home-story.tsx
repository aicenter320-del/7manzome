import Link from "next/link";
import type { ReactNode } from "react";
import { BabyIcon, GiftIcon, Link2Icon, PenLineIcon, ScaleIcon, SparklesIcon } from "lucide-react";

import { GoldPriceBadge, type GoldPriceView } from "@/modules/pricing";
import { copy, cta } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { SectionHead } from "@/shared/ui/section-head";
import { SnapSlideTrack } from "@/shared/ui/snap-slide-track";

function Step({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
        {icon}
      </span>
      <div className="grid min-w-0 gap-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}

function TrustCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="grid h-full gap-3 rounded-3xl bg-card p-5 shadow-product">
      <span className="flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
        {icon}
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

/** نوار اعتماد زیر هیرو: فقط قیمت زنده. */
export function HomeProofBar({ goldPrice }: { goldPrice: GoldPriceView | null }) {
  return (
    <section className="px-4 pt-4">
      <div className="flex justify-center">
        <GoldPriceBadge price={goldPrice} variant="gold" className="w-full justify-center" />
      </div>
    </section>
  );
}

/** مسیر ساخت گنجینه؛ همان کارهایی که در پنل والد انجام می‌شود. */
export function HomeHowItWorks() {
  return (
    <section className="bg-background px-4 py-10">
      <div className="grid gap-6">
        <SectionHead
          kicker={copy.how.kicker}
          title={copy.how.title}
          description={copy.how.body}
        />
        <article className="rounded-3xl bg-card p-5 shadow-product">
          <ol className="grid gap-5">
            <Step
              icon={<BabyIcon className="size-5" aria-hidden />}
              title={copy.how.steps[0].title}
              body={copy.how.steps[0].body}
            />
            <Step
              icon={<SparklesIcon className="size-5" aria-hidden />}
              title={copy.how.steps[1].title}
              body={copy.how.steps[1].body}
            />
            <Step
              icon={<GiftIcon className="size-5" aria-hidden />}
              title={copy.how.steps[2].title}
              body={copy.how.steps[2].body}
            />
          </ol>
        </article>
        <Button asChild variant="gold" size="lg" className="w-full rounded-full">
          <Link href="/login?returnTo=/dashboard/treasures/new">{cta.startTreasure}</Link>
        </Button>
      </div>
    </section>
  );
}

/** دعوت به هدیه مهمان؛ کارت طلایی با دکمهٔ سفید کپسولی. */
export function HomeGiftBand() {
  return (
    <section className="bg-background px-4 py-10">
      <div className="hero-gold-band grid gap-5 rounded-3xl px-5 py-8">
        <h2 className="text-xl font-semibold text-balance">{copy.giftBand.title}</h2>
        <p className="text-sm leading-relaxed">{copy.giftBand.body}</p>
        <ul className="grid gap-2 text-sm">
          {copy.giftBand.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="grid gap-3">
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-card text-foreground shadow-none hover:bg-card/90"
          >
            <Link href="/gift">{cta.gift}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-full border-card bg-transparent text-inherit hover:bg-card/15"
          >
            <Link href="/treasures">{copy.giftBand.browseTreasures}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const TRUST_ICONS = [ScaleIcon, PenLineIcon, Link2Icon] as const;

/** اعتماد: کارت‌ها با کشیدن افقی دیده می‌شوند. */
export function HomeTrustBand() {
  return (
    <section className="bg-background px-4 py-10">
      <div className="grid gap-6">
        <SectionHead
          headingId="home-trust-heading"
          title={copy.trust.title}
          description={copy.trust.body}
        />
        <SnapSlideTrack
          labelledBy="home-trust-heading"
          slideClassName="w-[78cqi] shrink-0 snap-start"
          slideKind="نکته اعتماد"
        >
          {copy.trust.cards.map((card, index) => {
            const Icon = TRUST_ICONS[index] ?? ScaleIcon;
            return (
              <TrustCard
                key={card.title}
                icon={<Icon className="size-5" aria-hidden />}
                title={card.title}
                body={card.body}
              />
            );
          })}
        </SnapSlideTrack>
      </div>
    </section>
  );
}

/** شعار برند؛ وسط‌چین با kicker کوتاه. */
export function HomeSloganBand() {
  return (
    <section className="bg-background px-4 py-12">
      <div className="grid justify-items-center gap-5 text-center">
        <p className="text-xs font-medium tracking-wide text-gold-deep">{copy.slogan.kicker}</p>
        <p className="text-xl font-semibold text-balance text-treasure">{site.slogan}</p>
        <div className="grid w-full gap-3">
          <Button asChild variant="gold" size="lg" className="w-full rounded-full">
            <Link href="/products">{cta.shop}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full rounded-full">
            <Link href="/login?returnTo=/dashboard">{cta.login}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
