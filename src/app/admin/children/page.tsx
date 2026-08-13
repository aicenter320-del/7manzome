import { getChildCount } from "@/modules/children";
import { requirePermission } from "@/server/auth/guards";
import { toPersianDigits } from "@/shared/lib/persian";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminChildrenPage() {
  await requirePermission("child:read");
  const count = await getChildCount();

  return (
    <div className="grid gap-6">
      <PageHeader title="کودکان" description={`${toPersianDigits(count)} پروفایل کودک در سامانه.`} />
      <EmptyState
        title="فهرست کامل کودکان از روی کاربر قابل دسترسی است"
        description="برای حفظ حریم کودک، فهرست سراسری در این نسخه نمایش داده نمی‌شود. از صفحه کاربر وارد پروفایل مرتبط شوید."
      />
    </div>
  );
}
