import Link from "next/link";
import type { ReactNode } from "react";
import { Link2Icon, PenLineIcon, ScaleIcon } from "lucide-react";

import { copy, cta } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { SectionHead } from "@/shared/ui/section-head";
import { SnapSlideTrack } from "@/shared/ui/snap-slide-track";

function Step({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold bg-gold/10 text-xs font-extrabold text-gold-deep">
        {toPersianDigits(String(index).padStart(2, "0"))}
      </span>
      <div className="grid min-w-0 gap-1">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
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
    <article className="flex h-full gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold bg-gold/10 text-gold-deep">
        {icon}
      </span>
      <div className="grid min-w-0 gap-1">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}

/** مسیر ساخت گنجینه؛ همان کارهایی که در پنل والد انجام می‌شود. */
export function HomeHowItWorks() {
  return (
    <section className="bg-background px-5 py-8">
      <div className="grid gap-5">
        <SectionHead
          kicker={copy.how.kicker}
          title={copy.how.title}
          description={copy.how.body}
        />
        <ol className="grid gap-5">
          {copy.how.steps.map((step, index) => (
            <Step key={step.title} index={index + 1} title={step.title} body={step.body} />
          ))}
        </ol>
        <Button asChild variant="gold" size="lg" className="w-full">
          <Link href="/login?returnTo=/dashboard/treasures/new">{cta.startTreasure}</Link>
        </Button>
      </div>
    </section>
  );
}

/** دعوت به هدیه مهمان؛ کارت طلایی با دکمهٔ سفید. */
export function HomeGiftBand() {
  return (
    <section className="bg-background px-5 pb-8">
      <div className="hero-gold-band relative overflow-hidden rounded-[1.4rem] px-5 py-6">
        <h2 className="relative text-xl font-extrabold text-balance">{copy.giftBand.title}</h2>
        <p className="relative mt-2.5 text-xs leading-loose">{copy.giftBand.body}</p>
        <ul className="relative mt-4 grid gap-2.5 text-xs font-semibold">
          {copy.giftBand.bullets.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="gift-star" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <div className="relative mt-5 grid gap-2.5">
          <Button
            asChild
            size="lg"
            className="w-full rounded-2xl bg-card text-gold-deep shadow-none hover:bg-card/90"
          >
            <Link href="/gift">{cta.gift}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-2xl border-card/50 bg-card/25 text-inherit hover:bg-card/20"
          >
            <Link href="/treasures" className="flex items-center justify-center gap-2">
              <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
              {copy.giftBand.browseTreasures}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const TRUST_ICONS = [ScaleIcon, PenLineIcon, Link2Icon] as const;

/** اعتماد: کارت افقی با حلقهٔ طلایی. */
export function HomeTrustBand() {
  return (
    <section className="bg-background px-5 py-8">
      <div className="grid gap-5">
        <SectionHead
          headingId="home-trust-heading"
          title={copy.trust.title}
          description={copy.trust.body}
        />
        <SnapSlideTrack
          labelledBy="home-trust-heading"
          slideClassName="w-[86cqi] shrink-0 snap-start"
          slideKind="نکته اعتماد"
        >
          {copy.trust.cards.map((card, index) => {
            const Icon = TRUST_ICONS[index] ?? ScaleIcon;
            return (
              <TrustCard
                key={card.title}
                icon={<Icon className="size-4" aria-hidden />}
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

/** شعار برند؛ بلوک night با دو CTA. */
export function HomeSloganBand() {
  return (
    <section className="home-final-cta px-5 py-9 text-center">
      <p className="hero-eyebrow">{copy.slogan.kicker}</p>
      <p className="mt-3 mb-6 text-xl font-extrabold text-balance text-night-foreground">
        {site.slogan}
      </p>
      <div className="grid gap-2.5">
        <Button asChild variant="gold" size="lg" className="w-full">
          <Link href="/products">{cta.shop}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="btn-night-outline w-full rounded-2xl">
          <Link href="/login?returnTo=/dashboard">{cta.login}</Link>
        </Button>
      </div>
    </section>
  );
}
