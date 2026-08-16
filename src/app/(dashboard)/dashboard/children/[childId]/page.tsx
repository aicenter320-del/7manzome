import Link from "next/link";
import { notFound } from "next/navigation";

import { ChildAvatar, ChildForm, getChildById } from "@/modules/children";
import { getTreasuresForChild, TreasureCard } from "@/modules/treasury";
import { requireUser } from "@/server/auth/guards";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const user = await requireUser();
  const { childId } = await params;

  let child;
  try {
    child = await getChildById(childId, user.id);
  } catch {
    notFound();
  }
  if (!child) notFound();

  const treasures = await getTreasuresForChild(child.id, user.id);

  return (
    <div className="grid gap-10">
      <PageHeader
        title={child.displayName}
        description={child.ageLabel}
        actions={
          <div className="flex items-center gap-3">
            <ChildAvatar
              displayName={child.displayName}
              avatarFileId={child.avatarFileId}
              gender={child.gender}
              size="lg"
            />
            <Button asChild>
              <Link href={`/dashboard/treasures/new?childId=${child.id}`}>ساخت گنجینه</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">گنجینه‌ها</h2>
        {treasures.length === 0 ? (
          <EmptyState
            title="این کودک هنوز گنجینه‌ای ندارد"
            action={
              <Button asChild>
                <Link href={`/dashboard/treasures/new?childId=${child.id}`}>ساخت گنجینه</Link>
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
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">ویرایش پروفایل</h2>
        <ChildForm child={child} />
      </section>
    </div>
  );
}
