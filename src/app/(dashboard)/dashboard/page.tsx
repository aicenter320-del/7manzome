import Link from "next/link";

import { ChildAvatar, getChildrenForUser } from "@/modules/children";
import { getTreasuresForUser, TreasureCard } from "@/modules/treasury";
import { requireUser } from "@/server/auth/guards";
import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { SectionHead } from "@/shared/ui/section-head";

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
          <Button asChild variant="gold" className="rounded-full">
            <Link href="/dashboard/treasures/new">{cta.createTreasure}</Link>
          </Button>
        }
      />

      <section className="grid gap-4">
        <SectionHead
          title={copy.dashboard.children}
          actionHref="/dashboard/children"
          actionLabel={cta.viewAll}
        />
        {children.length === 0 ? (
          <EmptyState
            title={copy.dashboard.emptyChildTitle}
            description={copy.dashboard.emptyChildDescription}
            action={
              <Button asChild className="rounded-full">
                <Link href="/dashboard/children/new">{cta.addChild}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/dashboard/children/${child.id}`}
                className="glass flex items-center gap-3 rounded-3xl p-4"
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
        <SectionHead
          title={copy.dashboard.treasures}
          actionHref="/dashboard/treasures"
          actionLabel={cta.viewAll}
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
            {treasures.slice(0, 4).map((summary) => (
              <TreasureCard key={summary.treasure.id} summary={summary} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
