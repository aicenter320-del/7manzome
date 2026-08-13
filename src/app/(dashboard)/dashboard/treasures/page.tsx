import Link from "next/link";

import { getTreasuresForUser, TreasureCard } from "@/modules/treasury";
import { requireUser } from "@/server/auth/guards";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function TreasuresListPage() {
  const user = await requireUser("/dashboard/treasures");
  const treasures = await getTreasuresForUser(user.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="گنجینه‌ها"
        description="وزن طلا معیار اصلی است؛ هر هدیه یک قدم به هدف نزدیک‌تر می‌کند."
        actions={
          <Button asChild>
            <Link href="/dashboard/treasures/new">گنجینه جدید</Link>
          </Button>
        }
      />

      {treasures.length === 0 ? (
        <EmptyState
          title="هنوز گنجینه‌ای نساخته‌اید"
          description="ابتدا پروفایل کودک را بسازید، سپس گنجینه را باز کنید."
          action={
            <Button asChild>
              <Link href="/dashboard/treasures/new">ساخت گنجینه</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {treasures.map((summary) => (
            <TreasureCard key={summary.treasure.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}
