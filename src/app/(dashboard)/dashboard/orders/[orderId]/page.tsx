import Link from "next/link";
import { notFound } from "next/navigation";

import { canCustomerCancel, getOrderForUser, OrderStatusBadge } from "@/modules/orders";
import { requireUser } from "@/server/auth/guards";
import { formatJalaliDateTime } from "@/shared/lib/jalali";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { CancelOrderButton } from "./cancel-order-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireUser();
  const { orderId } = await params;

  let order;
  try {
    order = await getOrderForUser(orderId, user.id);
  } catch {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title={`سفارش ${order.orderNumber}`}
        description={order.recipientName}
        actions={
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {canCustomerCancel(order.status) ? <CancelOrderButton orderId={order.id} /> : null}
          </div>
        }
      />

      <div className="grid gap-2 text-sm text-muted-foreground">
        <p>
          مبلغ کل:{" "}
          <span className="font-semibold text-gold-deep">
            <Money rial={order.totalRial} />
          </span>
        </p>
        <p>
          طلا: <GoldWeight mg={order.goldTotalMg} size="sm" />
        </p>
        {order.placedAt ? <p>ثبت: {formatJalaliDateTime(order.placedAt)}</p> : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>محصول</TableHead>
            <TableHead>تعداد</TableHead>
            <TableHead>وزن</TableHead>
            <TableHead>مبلغ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <p>{item.productTitle}</p>
                <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <GoldWeight mg={item.weightMg} karat={item.karat} size="sm" />
              </TableCell>
              <TableCell>
                <Money rial={item.lineTotalRial} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {order.status === "payment_pending" || order.status === "created" ? (
        <Link href={`/dashboard/orders/${order.id}`} className="text-sm text-gold-deep">
          اگر پرداخت ناتمام مانده، از پیامک یا صفحه پرداخت پیگیری کنید.
        </Link>
      ) : null}
    </div>
  );
}
