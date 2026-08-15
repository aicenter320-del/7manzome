import Link from "next/link";
import type { ReactNode } from "react";
import { BabyIcon, GiftIcon, Link2Icon, PenLineIcon, ScaleIcon, SparklesIcon } from "lucide-react";

import { GoldPriceBadge, type GoldPriceView } from "@/modules/pricing";
import { copy, cta } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";

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
    <li className="grid gap-3 rounded-lg bg-card p-6 shadow-product">
      <span className="flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
        {icon}
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
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
    <article className="grid gap-3 rounded-lg bg-card p-6 shadow-product">
      <span className="flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
        {icon}
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

/** نوار اعتماد زیر هیرو: قیمت زنده و سه وعده کوتاه، قبل از ویترین. */
export function HomeProofBar({ goldPrice }: { goldPrice: GoldPriceView | null }) {
  return (
    <section className="border-y border-gold/20 bg-card px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-6">
        <GoldPriceBadge price={goldPrice} />
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {copy.proof.chips.map((chip) => (
            <li key={chip} className="flex items-center gap-2">
              <span className="size-1 shrink-0 rounded-full bg-gold" aria-hidden />
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** مسیر ساخت گنجینه؛ همان کارهایی که در پنل والد انجام می‌شود. */
export function HomeHowItWorks() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-12">
        <div className="max-w-2xl grid gap-3">
          <p className="flex items-center gap-3 text-xs font-medium tracking-wide text-gold-deep">
            <span className="h-px w-8 shrink-0 bg-gold" aria-hidden />
            {copy.how.kicker}
          </p>
          <h2 className="text-xl font-semibold sm:text-2xl">{copy.how.title}</h2>
          <p className="text-muted-foreground">{copy.how.body}</p>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3">
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
        <div>
          <Button asChild variant="gold" size="lg">
            <Link href="/login?returnTo=/dashboard/treasures/new">{cta.startTreasure}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/** دعوت به هدیه مهمان؛ مسیر واقعی /gift و لینک گنجینه. */
export function HomeGiftBand() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="glass-strong mx-auto grid w-full max-w-6xl gap-10 rounded-lg px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="grid gap-5">
          <h2 className="text-2xl font-semibold text-balance sm:text-3xl">
            {copy.giftBand.title}
          </h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">{copy.giftBand.body}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href="/gift">{cta.gift}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/treasures">{copy.giftBand.browseTreasures}</Link>
            </Button>
          </div>
        </div>
        <ul className="grid gap-3 text-sm">
          {copy.giftBand.bullets.map((item) => (
            <li key={item} className="rounded-lg bg-card px-5 py-4 shadow-product">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** اعتماد: شفافیت قیمت و شخصی‌سازی واقعی صفحه محصول. */
export function HomeTrustBand() {
  return (
    <section className="bg-background px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-12">
        <div className="max-w-2xl grid gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">{copy.trust.title}</h2>
          <p className="text-muted-foreground">{copy.trust.body}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <TrustCard
            icon={<ScaleIcon className="size-5" aria-hidden />}
            title={copy.trust.cards[0].title}
            body={copy.trust.cards[0].body}
          />
          <TrustCard
            icon={<PenLineIcon className="size-5" aria-hidden />}
            title={copy.trust.cards[1].title}
            body={copy.trust.cards[1].body}
          />
          <TrustCard
            icon={<Link2Icon className="size-5" aria-hidden />}
            title={copy.trust.cards[2].title}
            body={copy.trust.cards[2].body}
          />
        </div>
      </div>
    </section>
  );
}

/** شعار برند؛ سکشن پایانی روی کاغذ کرم، طلا فقط لهجه. */
export function HomeSloganBand() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid w-full max-w-3xl justify-items-center gap-8 text-center">
        <p className="text-2xl font-semibold text-balance text-treasure sm:text-4xl">
          {site.slogan}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href="/products">{cta.shop}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login?returnTo=/dashboard">{cta.login}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
