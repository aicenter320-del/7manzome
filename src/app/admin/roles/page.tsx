import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listStaffRoles } from "@/modules/identity";
import { requirePermission } from "@/server/auth/guards";
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
        columns={["نقش", "نوع", "کاربران"]}
        isEmpty={roles.length === 0}
        emptyTitle="نقشی نیست"
        align="center"
      >
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="text-center">
              <Link href={`/admin/roles/${role.id}`} className="font-medium hover:underline">
                {role.title}
              </Link>
            </TableCell>
            <TableCell className="text-center">{role.isSystem ? "سیستمی" : "سفارشی"}</TableCell>
            <TableCell className="text-center">
              {role.members.length === 0 ? (
                <span className="text-muted-foreground">بدون کاربر</span>
              ) : (
                <span className="inline-flex flex-wrap justify-center gap-x-1 gap-y-1">
                  {role.members.map((member, index) => (
                    <span key={member.id}>
                      <Link href={`/admin/users/${member.id}`} className="hover:underline">
                        {member.displayName}
                      </Link>
                      {index < role.members.length - 1 ? "،" : null}
                    </span>
                  ))}
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
