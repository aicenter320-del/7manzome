import { CalendarHeartIcon } from "lucide-react";

import { listOccasions, OccasionCard } from "@/modules/catalog";
import { copy } from "@/shared/config/copy";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function OccasionsPage() {
  const occasions = await listOccasions();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title={copy.occasions.title} description={copy.occasions.description} />

      {occasions.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<CalendarHeartIcon />}
          title={copy.occasions.emptyTitle}
          description={copy.occasions.emptyDescription}
        />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((occasion) => (
            <OccasionCard key={occasion.id} occasion={occasion} />
          ))}
        </div>
      )}
    </main>
  );
}
