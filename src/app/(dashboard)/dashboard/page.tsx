import Link from "next/link";

import { ChildAvatar, getChildrenForUser } from "@/modules/children";
import { getTreasuresForUser, TreasureCard } from "@/modules/treasury";
import { requireUser } from "@/server/auth/guards";
import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function DashboardHomePage() {
  const user = await requireUser("/dashboard");
  const [children, treasures] = await Promise.all([
    getChildrenForUser(user.id),
    getTreasuresForUser(user.id),
  ]);

  return (
    <div className="grid gap-10">
      <PageHeader
        title={copy.dashboard.greeting(user.firstName ?? user.displayName)}
        description={copy.dashboard.homeDescription}
        actions={
          <Button asChild variant="gold">
            <Link href="/dashboard/treasures/new">{cta.createTreasure}</Link>
          </Button>
        }
      />

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{copy.dashboard.children}</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/children">همه</Link>
          </Button>
        </div>
        {children.length === 0 ? (
          <EmptyState
            title={copy.dashboard.emptyChildTitle}
            description={copy.dashboard.emptyChildDescription}
            action={
              <Button asChild>
                <Link href="/dashboard/children/new">{cta.addChild}</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-wrap gap-4">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/dashboard/children/${child.id}`}
                className="glass flex items-center gap-3 rounded-3xl p-3"
              >
                <ChildAvatar
                  displayName={child.displayName}
                  avatarFileId={child.avatarFileId}
                  gender={child.gender}
                />
                <div>
                  <p className="font-medium">{child.displayName}</p>
                  <p className="text-xs text-muted-foreground">{child.ageLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{copy.dashboard.treasures}</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/treasures">همه</Link>
          </Button>
        </div>
        {treasures.length === 0 ? (
          <EmptyState
            title={copy.dashboard.emptyTreasureTitle}
            description={copy.dashboard.emptyTreasureDescription}
            action={
              <Button asChild>
                <Link href="/dashboard/treasures/new">{cta.createTreasure}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {treasures.slice(0, 4).map((summary) => (
              <TreasureCard key={summary.treasure.id} summary={summary} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
