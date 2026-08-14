"use client";

import Link from "next/link";

import type { OrderStatus } from "@/shared/types/enums";
import type { PaymentStatus } from "@/shared/types/enums";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { PAYMENT_STATUS_LABELS } from "@/shared/types/enums";
import { EmptyState } from "@/shared/ui/empty-state";
import { Money } from "@/shared/ui/money";
import { OrderStatusBadge } from "@/modules/orders/ui/order-status-badge";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalRial: number;
  placedAt: number | null;
}

export interface AdminPaymentRow {
  id: string;
  paymentNumber: string;
  status: PaymentStatus;
  amountRial: number;
  createdAt: number;
}

export function AdminCommercePanel({
  orders,
  payments,
}: {
  orders: AdminOrderRow[];
  payments: AdminPaymentRow[];
}) {
  if (orders.length === 0 && payments.length === 0) {
    return <EmptyState title="سفارش یا پرداختی ثبت نشده" />;
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h3 className="font-medium">سفارش‌ها</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">سفارشی نیست.</p>
        ) : (
          <ul className="grid gap-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4"
              >
                <div className="grid gap-1">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                    {order.orderNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {order.placedAt ? formatJalaliDate(order.placedAt) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Money rial={order.totalRial} />
                  <OrderStatusBadge status={order.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h3 className="font-medium">پرداخت‌ها</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">پرداختی با این حساب ثبت نشده.</p>
        ) : (
          <ul className="grid gap-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4"
              >
                <div className="grid gap-1">
                  <Link
                    href={`/admin/payments/${payment.id}`}
                    className="font-medium hover:underline"
                  >
                    {payment.paymentNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatJalaliDate(payment.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Money rial={payment.amountRial} />
                  <span className="text-sm">{PAYMENT_STATUS_LABELS[payment.status]}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
