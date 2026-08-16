import Link from "next/link";

import { getOrdersForUser, OrderStatusBadge } from "@/modules/orders";
import { requireUser } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { EmptyState } from "@/shared/ui/empty-state";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

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
        <ul className="grid gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="glass grid gap-2 rounded-3xl p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="ltr-nums font-medium">{order.orderNumber}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <Money rial={order.totalRial} />
                  <GoldWeight mg={order.goldTotalMg} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatJalaliDate(order.placedAt ?? order.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
