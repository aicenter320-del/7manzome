import { notFound } from "next/navigation";

import { DeleteStaffRoleButton, StaffRoleForm, getStaffRole } from "@/modules/identity";
import { requirePermission } from "@/server/auth/guards";
import { ACCESS_SECTIONS } from "@/shared/types/enums";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminEditRolePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  await requirePermission("role:write");
  const { roleId } = await params;
  const role = await getStaffRole(roleId);
  if (!role) notFound();

  const grants = ACCESS_SECTIONS.map((section) => ({
    section,
    level: role.grants[section],
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        title={role.title}
        description={
          role.isLocked
            ? "این نقش همیشه همه دسترسی‌ها را دارد و ویرایش نمی‌شود."
            : role.description
        }
      />

      {role.isLocked ? (
        <p className="text-sm text-muted-foreground">
          مدیر ارشد قفل است. نمی‌توان سطح دسترسی یا عنوان آن را عوض کرد.
        </p>
      ) : (
        <StaffRoleForm
          roleId={role.id}
          initialTitle={role.title}
          initialDescription={role.description}
          initialGrants={grants}
        />
      )}

      {role.isLocked ? null : (
        <DeleteStaffRoleButton
          roleId={role.id}
          title={role.title}
          disabledReason={
            role.isSystem
              ? "نقش سیستمی حذف نمی‌شود."
              : role.userCount > 0
                ? "نقشی که به کاربری داده شده حذف نمی‌شود."
                : undefined
          }
        />
      )}
    </div>
  );
}
