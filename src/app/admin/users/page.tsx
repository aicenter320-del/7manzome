import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { getUserCount, listUsers } from "@/modules/identity";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { formatPhoneFa, toPersianDigits } from "@/shared/lib/persian";
import { KYC_STATUS_LABELS, USER_ROLE_LABELS } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminUsersPage() {
  await requirePermission("user:read");
  const [users, count] = await Promise.all([listUsers({ limit: 50 }), getUserCount()]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="کاربران"
        description={`${toPersianDigits(count)} کاربر ثبت‌شده.`}
      />

      <DataTable
        columns={["نام", "موبایل", "احراز هویت", "نقش", "عضویت"]}
        isEmpty={users.length === 0}
        emptyTitle="کاربری پیدا نشد"
      >
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.displayName}</TableCell>
            <TableCell className="ltr-nums">{formatPhoneFa(user.phone)}</TableCell>
            <TableCell>
              <Badge variant="muted">{KYC_STATUS_LABELS[user.kycStatus]}</Badge>
            </TableCell>
            <TableCell>
              {user.roles.length > 0
                ? user.roles.map((role) => USER_ROLE_LABELS[role]).join("، ")
                : "مشتری"}
            </TableCell>
            <TableCell>{formatJalaliDate(user.createdAt)}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
