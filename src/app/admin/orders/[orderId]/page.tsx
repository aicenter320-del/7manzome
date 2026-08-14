import { notFound } from "next/navigation";

import { getOrderById, OrderStatusBadge } from "@/modules/orders";
import { requirePermission } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { formatJalaliDateTime } from "@/shared/lib/jalali";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { OrderTransitions } from "./order-transitions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requirePermission("order:read");
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();
  const canChangeStatus = hasPermission(user.roles, "order:transition");

  return (
    <div className="grid gap-8">
      <PageHeader
        title={order.orderNumber}
        description={order.recipientName}
        actions={<OrderStatusBadge status={order.status} />}
      />

      {canChangeStatus ? (
        <OrderTransitions orderId={order.id} status={order.status} />
      ) : null}

      <div className="grid gap-1 text-sm text-muted-foreground">
        <p>
          مبلغ: <Money rial={order.totalRial} />
        </p>
        <p>
          طلا: <GoldWeight mg={order.goldTotalMg} size="sm" />
        </p>
        <p className="ltr-nums" dir="ltr">
          {order.recipientPhone}
        </p>
        {order.placedAt ? <p>{formatJalaliDateTime(order.placedAt)}</p> : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>محصول</TableHead>
            <TableHead>تعداد</TableHead>
            <TableHead>مبلغ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.productTitle}
                <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <Money rial={item.lineTotalRial} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
