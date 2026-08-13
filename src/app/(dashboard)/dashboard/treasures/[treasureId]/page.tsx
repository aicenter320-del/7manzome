import { notFound } from "next/navigation";

import { getSetting } from "@/modules/content";
import { getGiftLinksForTreasure, GiftShareBar } from "@/modules/gifting";
import {
  getLedger,
  getTreasureSummary,
  LedgerList,
  MilestoneList,
  TreasureProgress,
} from "@/modules/treasury";
import { requireUser } from "@/server/auth/guards";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

import { CreateGiftLinkForm } from "./create-gift-link-form";

export default async function TreasureDetailPage({
  params,
}: {
  params: Promise<{ treasureId: string }>;
}) {
  const user = await requireUser();
  const { treasureId } = await params;

  let summary;
  try {
    summary = await getTreasureSummary(treasureId, user.id);
  } catch {
    notFound();
  }
  if (!summary) notFound();

  const [ledger, giftLinks, milestonesMg] = await Promise.all([
    getLedger(treasureId, user.id),
    getGiftLinksForTreasure(treasureId, user.id),
    getSetting("treasury.milestones_mg"),
  ]);

  return (
    <div className="grid gap-10">
      <PageHeader
        title={summary.treasure.title}
        description={`${summary.child.displayName} — ${summary.child.ageLabel}`}
      />

      <section className="glass grid gap-3 rounded-3xl p-6">
        <p className="text-xs text-muted-foreground">طلای ذخیره‌شده</p>
        <GoldWeight mg={summary.balance.balanceMg} size="hero" className="text-treasure" />
        {summary.currentValueRial !== null ? (
          <p className="text-sm text-muted-foreground">
            ارزش امروز: <Money rial={summary.currentValueRial} short />
          </p>
        ) : null}
        <TreasureProgress
          balanceMg={summary.balance.balanceMg}
          goal={summary.goal}
          progressPercent={summary.progressPercent}
        />
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">لینک هدیه</h2>
        {giftLinks.length > 0 ? (
          <div className="grid gap-3">
            {giftLinks.map((link) => (
              <div key={link.id} className="glass grid gap-2 rounded-3xl p-4">
                <p className="font-medium">{link.title}</p>
                <GiftShareBar url={link.url} />
              </div>
            ))}
          </div>
        ) : null}
        <CreateGiftLinkForm
          treasureId={summary.treasure.id}
          defaultTitle={`گنجینه ${summary.child.firstName}`}
        />
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">نقاط عطف</h2>
        <MilestoneList
          milestones={summary.milestones}
          thresholdsMg={milestonesMg}
          balanceMg={summary.balance.balanceMg}
        />
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">دفتر کل طلا</h2>
        <LedgerList entries={ledger} />
      </section>
    </div>
  );
}
