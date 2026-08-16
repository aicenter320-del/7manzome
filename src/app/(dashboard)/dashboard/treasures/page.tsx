import Link from "next/link";

import { getTreasuresForUser, TreasureCard } from "@/modules/treasury";
import { requireUser } from "@/server/auth/guards";
import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function TreasuresListPage() {
  const user = await requireUser("/dashboard/treasures");
  const treasures = await getTreasuresForUser(user.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title={copy.dashboard.treasures}
        description={copy.dashboard.treasuresPageDescription}
        actions={
          <Button asChild className="rounded-full">
            <Link href="/dashboard/treasures/new">{cta.createTreasure}</Link>
          </Button>
        }
      />

      {treasures.length === 0 ? (
        <EmptyState
          title={copy.dashboard.emptyTreasureTitle}
          description={copy.dashboard.emptyTreasureDescription}
          action={
            <Button asChild className="rounded-full">
              <Link href="/dashboard/treasures/new">{cta.createTreasure}</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {treasures.map((summary) => (
            <TreasureCard key={summary.treasure.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}
