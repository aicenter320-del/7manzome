import { StaffRoleForm } from "@/modules/identity";
import { requirePermission } from "@/server/auth/guards";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminNewRolePage() {
  await requirePermission("role:write");

  return (
    <div className="grid gap-6">
      <PageHeader title="نقش جدید" description="عنوان فارسی بگذارید؛ شناسه به‌صورت خودکار ساخته می‌شود." />
      <StaffRoleForm />
    </div>
  );
}
