import Link from "next/link";

import { DataTable, TableCell, TableRow } from "@/modules/admin";
import { listPendingReviews, listPayments } from "@/modules/payments";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDateTime } from "@/shared/lib/jalali";
import { PAYMENT_STATUS_LABELS } from "@/shared/types/enums";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminPaymentsPage() {
  await requirePermission("payment:read");
  const [queue, recent] = await Promise.all([
    listPendingReviews(),
    listPayments({ limit: 30, offset: 0 }),
  ]);

  return (
    <div className="grid gap-10">
      <PageHeader title="پرداخت‌ها" description="صف تایید رسیدهای کارت‌به‌کارت." />

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">در انتظار بررسی</h2>
        <DataTable
          columns={["شماره", "مبلغ", "وضعیت", "زمان"]}
          isEmpty={queue.length === 0}
          emptyTitle="صف تایید خالی است"
        >
          {queue.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <Link href={`/admin/payments/${payment.id}`} className="ltr-nums hover:underline">
                  {payment.paymentNumber}
                </Link>
              </TableCell>
              <TableCell>
                <Money rial={payment.amountRial} />
              </TableCell>
              <TableCell>{PAYMENT_STATUS_LABELS[payment.status]}</TableCell>
              <TableCell>{formatJalaliDateTime(payment.createdAt)}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">همه پرداخت‌ها</h2>
        <DataTable
          columns={["شماره", "مبلغ", "وضعیت", "زمان"]}
          isEmpty={recent.length === 0}
          emptyTitle="پرداختی ثبت نشده"
        >
          {recent.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <Link href={`/admin/payments/${payment.id}`} className="ltr-nums hover:underline">
                  {payment.paymentNumber}
                </Link>
              </TableCell>
              <TableCell>
                <Money rial={payment.amountRial} />
              </TableCell>
              <TableCell>{PAYMENT_STATUS_LABELS[payment.status]}</TableCell>
              <TableCell>{formatJalaliDateTime(payment.createdAt)}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
