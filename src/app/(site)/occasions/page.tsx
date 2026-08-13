import { CalendarHeartIcon } from "lucide-react";

import { listOccasions, OccasionCard } from "@/modules/catalog";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function OccasionsPage() {
  const occasions = await listOccasions();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="مناسبت‌های زندگی کودک"
        description="هر مناسبت فرصتی است برای افزودن یک قدم طلا به گنجینه او."
      />

      {occasions.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<CalendarHeartIcon />}
          title="مناسبتی ثبت نشده"
          description="به‌زودی مناسبت‌های تولد، دندان درآوردن و جشن‌ها اینجا می‌آیند."
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
