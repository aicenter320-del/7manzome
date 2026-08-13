import { getActiveTreasureCount } from "@/modules/treasury";
import { requirePermission } from "@/server/auth/guards";
import { toPersianDigits } from "@/shared/lib/persian";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminTreasuresPage() {
  await requirePermission("treasury:read");
  const count = await getActiveTreasureCount();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="گنجینه‌ها"
        description={`${toPersianDigits(count)} گنجینه فعال.`}
      />
      <EmptyState
        title="فهرست جزئی گنجینه‌ها به‌زودی"
        description="شمارش گنجینه‌های فعال اینجاست. جزئیات هر گنجینه از مسیر دارنده حساب قابل مشاهده است."
      />
    </div>
  );
}
