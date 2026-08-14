import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import {
  AccountStatusBadge,
  KycDecisionSelect,
  KycStatusBadge,
  UserAccountStatusSelect,
  UserRoleSelect,
  assignedRoleFromRoles,
  getUserCount,
  labelForAssignedRole,
  listAssignableStaffRoles,
  listUsers,
} from "@/modules/identity";
import { getLatestOrderStatusByUserIds, OrderStatusBadge } from "@/modules/orders";
import { requirePermission } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { formatPhoneFa, toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminUsersPage() {
  const actor = await requirePermission("user:read");
  const canAssign = hasPermission(actor.roles, "role:write");
  const canReviewKyc = hasPermission(actor.roles, "user:write");
  const [users, count, staffRoles] = await Promise.all([
    listUsers({ limit: 50 }),
    getUserCount(),
    listAssignableStaffRoles(),
  ]);
  const orderStatusByUser = await getLatestOrderStatusByUserIds(users.map((user) => user.id));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="کاربران"
        description={`${toPersianDigits(count)} کاربر ثبت‌شده.`}
      />

      <DataTable
        columns={["نام", "موبایل", "حساب", "احراز هویت", "نقش", "وضعیت", "عضویت", "ویرایش"]}
        isEmpty={users.length === 0}
        emptyTitle="کاربری پیدا نشد"
      >
        {users.map((user) => {
          const role = assignedRoleFromRoles(user.roles);
          const orderStatus = orderStatusByUser.get(user.id) ?? null;
          return (
            <TableRow key={user.id}>
              <TableCell>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {user.displayName}
                </Link>
              </TableCell>
              <TableCell className="ltr-nums">{formatPhoneFa(user.phone)}</TableCell>
              <TableCell>
                {canReviewKyc ? (
                  <UserAccountStatusSelect
                    userId={user.id}
                    displayName={user.displayName}
                    status={user.status}
                    isSelf={user.id === actor.id}
                  />
                ) : (
                  <AccountStatusBadge status={user.status} />
                )}
              </TableCell>
              <TableCell>
                {canReviewKyc ? (
                  <KycDecisionSelect
                    userId={user.id}
                    displayName={user.displayName}
                    status={user.kycStatus}
                  />
                ) : (
                  <KycStatusBadge status={user.kycStatus} />
                )}
              </TableCell>
              <TableCell>
                {canAssign ? (
                  <UserRoleSelect userId={user.id} roles={user.roles} staffRoles={staffRoles} />
                ) : (
                  labelForAssignedRole(role, staffRoles)
                )}
              </TableCell>
              <TableCell>
                {orderStatus ? <OrderStatusBadge status={orderStatus} /> : "—"}
              </TableCell>
              <TableCell>{formatJalaliDate(user.createdAt)}</TableCell>
              <TableCell>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/users/${user.id}`}>ویرایش</Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>
    </div>
  );
}
