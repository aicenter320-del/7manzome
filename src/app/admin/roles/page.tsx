import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listStaffRoles } from "@/modules/identity";
import { requirePermission } from "@/server/auth/guards";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminRolesPage() {
  await requirePermission("role:write");
  const roles = await listStaffRoles();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="نقش‌ها"
        description="برای هر نقش سطح دسترسی بخش‌های پنل را تعیین کنید."
        actions={
          <Button asChild>
            <Link href="/admin/roles/new">نقش جدید</Link>
          </Button>
        }
      />

      <DataTable
        columns={["عنوان", "شناسه", "نوع", "کاربران"]}
        isEmpty={roles.length === 0}
        emptyTitle="نقشی نیست"
      >
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell>
              <Link href={`/admin/roles/${role.id}`} className="font-medium hover:underline">
                {role.title}
              </Link>
            </TableCell>
            <TableCell className="ltr-nums">{role.slug}</TableCell>
            <TableCell>{role.isSystem ? "سیستمی" : "سفارشی"}</TableCell>
            <TableCell>{toPersianDigits(role.userCount)}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
