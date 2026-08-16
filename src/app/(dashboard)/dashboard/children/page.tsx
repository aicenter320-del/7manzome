import Link from "next/link";

import { ChildAvatar, getChildrenForUser } from "@/modules/children";
import { requireUser } from "@/server/auth/guards";
import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function ChildrenListPage() {
  const user = await requireUser("/dashboard/children");
  const children = await getChildrenForUser(user.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title={copy.dashboard.children}
        description={copy.dashboard.childrenPageDescription}
        actions={
          <Button asChild className="rounded-full">
            <Link href="/dashboard/children/new">{cta.addChild}</Link>
          </Button>
        }
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
        <ul className="grid gap-3">
          {children.map((child) => (
            <li key={child.id}>
              <Link
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
                  <p className="text-sm text-muted-foreground">{child.ageLabel}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
