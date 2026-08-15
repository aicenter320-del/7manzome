import Link from "next/link";

import { getPublicTreasures } from "@/modules/treasury";
import { copy, cta } from "@/shared/config/copy";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { PageHeader } from "@/shared/ui/page-header";
import { Progress } from "@/shared/ui/progress";

export default async function PublicTreasuresPage() {
  const treasures = await getPublicTreasures(12);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title={copy.treasuresPublic.title}
        description={copy.treasuresPublic.description}
      />

      {treasures.length === 0 ? (
        <EmptyState
          className="mt-8"
          title={copy.treasuresPublic.emptyTitle}
          description={copy.treasuresPublic.emptyDescription}
          action={
            <Button asChild variant="gold">
              <Link href="/login?returnTo=/dashboard/treasures/new">{cta.startTreasure}</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {treasures.map((summary) => (
            <Card key={summary.treasure.id}>
              <CardContent className="grid gap-3 p-5">
                <p className="font-semibold">گنجینه {summary.child.firstName}</p>
                <p className="text-xs text-muted-foreground">{summary.child.ageLabel}</p>
                <GoldWeight mg={summary.balance.balanceMg} className="text-treasure" />
                {summary.goal ? (
                  <div className="grid gap-2">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground">پیشرفت</span>
                      <span className="text-gold-deep">
                        {toPersianDigits(summary.progressPercent)}٪
                      </span>
                    </div>
                    <Progress value={summary.progressPercent} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.treasuresPublic.noGoal}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
