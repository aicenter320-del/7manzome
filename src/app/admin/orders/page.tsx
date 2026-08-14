import Link from "next/link";

import { DataTable, GlassFilterPills, TableCell, TableRow } from "@/modules/admin";
import { listOrdersForAdmin, OrderStatusBadge } from "@/modules/orders";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type OrderStatus } from "@/shared/types/enums";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  await requirePermission("order:read");
  const params = await searchParams;
  const statusRaw = firstParam(params.status);
  const status = ORDER_STATUSES.includes(statusRaw as OrderStatus)
    ? (statusRaw as OrderStatus)
    : undefined;

  const { orders } = await listOrdersForAdmin({
    ...(status ? { status } : {}),
    limit: 50,
  });

  return (
    <div className="grid gap-6">
      <PageHeader title="سفارش‌ها" />

      <GlassFilterPills
        ariaLabel="فیلتر وضعیت سفارش"
        items={[
          { href: "/admin/orders", label: "همه", isActive: !status },
          ...ORDER_STATUSES.map((item) => ({
            href: `/admin/orders?status=${item}`,
            label: ORDER_STATUS_LABELS[item],
            isActive: status === item,
          })),
        ]}
      />

      <DataTable
        columns={["شماره", "وضعیت", "گیرنده", "مبلغ", "تاریخ"]}
        isEmpty={orders.length === 0}
        emptyTitle="سفارشی پیدا نشد"
      >
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link href={`/admin/orders/${order.id}`} className="ltr-nums hover:underline">
                {order.orderNumber}
              </Link>
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell>{order.recipientName}</TableCell>
            <TableCell>
              <Money rial={order.totalRial} />
            </TableCell>
            <TableCell>{formatJalaliDate(order.placedAt ?? order.createdAt)}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
