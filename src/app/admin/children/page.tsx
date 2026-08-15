import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listChildrenForAdmin } from "@/modules/children";
import { countTreasuresForChildren } from "@/modules/treasury";
import { requirePermission } from "@/server/auth/guards";
import { formatPhoneFa, toPersianDigits } from "@/shared/lib/persian";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminChildrenPage() {
  await requirePermission("child:read");
  const children = await listChildrenForAdmin();
  const treasureCounts = await countTreasuresForChildren(children.map((child) => child.id));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="کودکان"
        description={`${toPersianDigits(children.length)} پروفایل برای پشتیبانی. کد ملی و آدرس اینجا نیست.`}
      />

      <DataTable
        columns={["نام کوچک", "سن", "دارنده حساب", "موبایل", "گنجینه"]}
        isEmpty={children.length === 0}
        emptyTitle="کودکی ثبت نشده"
      >
        {children.map((child) => (
          <TableRow key={child.id}>
            <TableCell>
              <Link href={`/admin/users/${child.ownerUserId}`} className="text-primary">
                {child.firstName}
              </Link>
            </TableCell>
            <TableCell>{child.ageLabel}</TableCell>
            <TableCell>
              <Link href={`/admin/users/${child.ownerUserId}`} className="hover:underline">
                {child.ownerDisplayName}
              </Link>
            </TableCell>
            <TableCell className="ltr-nums">{formatPhoneFa(child.ownerPhone)}</TableCell>
            <TableCell>{toPersianDigits(treasureCounts.get(child.id) ?? 0)}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
