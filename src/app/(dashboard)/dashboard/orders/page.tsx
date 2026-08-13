import Link from "next/link";

import { getOrdersForUser, OrderStatusBadge } from "@/modules/orders";
import { requireUser } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { EmptyState } from "@/shared/ui/empty-state";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export default async function OrdersListPage() {
  const user = await requireUser("/dashboard/orders");
  const { orders } = await getOrdersForUser(user.id);

  return (
    <div className="grid gap-6">
      <PageHeader title="سفارش‌ها" description="قیمت سفارش‌های قبلی هرگز با نرخ امروز بازمحاسبه نمی‌شود." />

      {orders.length === 0 ? (
        <EmptyState
          title="هنوز سفارشی ثبت نکرده‌اید"
          description="از فروشگاه طلای کودک شروع کنید."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>مبلغ</TableHead>
              <TableHead>طلا</TableHead>
              <TableHead>تاریخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/dashboard/orders/${order.id}`} className="ltr-nums underline-offset-4 hover:underline">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <Money rial={order.totalRial} />
                </TableCell>
                <TableCell>
                  <GoldWeight mg={order.goldTotalMg} size="sm" />
                </TableCell>
                <TableCell>{formatJalaliDate(order.placedAt ?? order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
