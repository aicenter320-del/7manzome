import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ContributionForm,
  getGiftLinkByToken,
  GiftProgress,
  KeepsakeList,
} from "@/modules/gifting";
import { site } from "@/shared/config/site";

import { isGiftViewAccepting } from "./is-accepting";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const view = await getGiftLinkByToken(token);
  if (!view) return { title: "لینک هدیه", robots: { index: false, follow: false } };

  return {
    title: `گنجینه ${view.childFirstName}`,
    description: `هدیه طلا برای ${view.childFirstName}`,
    robots: { index: false, follow: false },
  };
}

export default async function GiftLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const view = await getGiftLinkByToken(token);
  if (!view) notFound();

  const accepting = isGiftViewAccepting(view);

  return (
    <main className="grid gap-8">
      <GiftProgress
        childFirstName={view.childFirstName}
        childAgeLabel={view.childAgeLabel}
        balanceMg={view.balanceMg}
        goalTargetMg={view.goalTargetMg}
        progressPercent={view.progressPercent}
      />

      {view.message ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">پیام خانواده</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">{view.message}</p>
        </section>
      ) : null}

      {accepting ? (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">مشارکت در گنجینه {view.childFirstName}</h2>
          <ContributionForm
            token={view.token}
            suggestedAmountsRial={view.suggestedAmountsRial}
            childFirstName={view.childFirstName}
          />
        </section>
      ) : (
        <p className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          این لینک هدیه در حال حاضر مشارکت نمی‌پذیرد. اگر کارت هدیه دارید، از صفحه هدیه سایت استفاده
          کنید یا با خانواده کودک هماهنگ شوید.
        </p>
      )}

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">پیام‌های یادگاری</h2>
        <KeepsakeList keepsakes={view.keepsakes} />
      </section>

      <p className="text-center text-sm text-muted-foreground">{site.slogan}</p>
    </main>
  );
}
