import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderById, ORDER_JOURNEY_STATIONS, journeyStationOf, OrderJourneyActions, OrderStatusBadge } from "@/modules/orders";
import { getPaymentsForOrder } from "@/modules/payments";
import { getPersonalizationById } from "@/modules/personalization";
import { requirePermission } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { formatJalaliDateTime } from "@/shared/lib/jalali";
import { PAYMENT_STATUS_LABELS } from "@/shared/types/enums";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { cn } from "@/shared/lib/cn";

import type { ShippingAddress } from "@/modules/orders";

function formatAddress(address: ShippingAddress): string {
  const parts = [address.province, address.city, address.addressLine];
  if (address.plate) {
    parts.push(`پلاک ${address.plate}`);
  }
  if (address.unit) {
    parts.push(`واحد ${address.unit}`);
  }
  if (address.postalCode) {
    parts.push(address.postalCode);
  }
  return parts.filter(Boolean).join("، ");
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requirePermission("order:read");
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) {
    notFound();
  }
  const canChangeStatus = hasPermission(user.roles, "order:transition");
  const currentStation = journeyStationOf(order.status);
  const hasPersonalization = order.items.some((item) => item.personalizationId);
  const payments = await getPaymentsForOrder(order.id);

  const personalizationIds = [
    ...new Set(
      order.items
        .map((item) => item.personalizationId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const personalizations = await Promise.all(
    personalizationIds.map((id) => getPersonalizationById(id)),
  );
  const engravingById = new Map(
    personalizations.flatMap((item) => (item ? [[item.id, item] as const] : [])),
  );

  return (
    <div className="grid gap-8">
      <PageHeader
        title={order.orderNumber}
        description={order.recipientName}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <ol className="flex flex-wrap gap-2">
        {ORDER_JOURNEY_STATIONS.map((station, index) => {
          const active = station.key === currentStation;
          return (
            <li
              key={station.key}
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}. {station.label}
            </li>
          );
        })}
      </ol>

      {canChangeStatus ? (
        <OrderJourneyActions
          orderId={order.id}
          status={order.status}
          hasPersonalization={hasPersonalization}
        />
      ) : null}

      <section className="grid gap-2 rounded-2xl glass p-4 text-sm">
        <h2 className="font-medium">پرداخت</h2>
        {payments.length === 0 ? (
          <p className="text-muted-foreground">پرداختی ثبت نشده.</p>
        ) : (
          <ul className="grid gap-2">
            {payments.map((payment) => (
              <li key={payment.id}>
                <Link href={`/admin/payments/${payment.id}`} className="ltr-nums hover:underline">
                  {payment.paymentNumber}
                </Link>
                <span className="ms-2 text-muted-foreground">
                  {PAYMENT_STATUS_LABELS[payment.status]} — <Money rial={payment.amountRial} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-2 rounded-2xl glass p-4 text-sm">
        <h2 className="font-medium">گیرنده و ارسال</h2>
        <p>
          مبلغ: <Money rial={order.totalRial} />
        </p>
        <p>
          طلا: <GoldWeight mg={order.goldTotalMg} size="sm" />
        </p>
        <p className="ltr-nums" dir="ltr">
          {order.recipientPhone}
        </p>
        {order.shippingAddress ? <p>{formatAddress(order.shippingAddress)}</p> : null}
        {order.customerNote ? <p>یادداشت مشتری: {order.customerNote}</p> : null}
        {order.placedAt ? <p>{formatJalaliDateTime(order.placedAt)}</p> : null}
        {order.shipment?.trackingCode ? (
          <p className="ltr-nums">کد پیگیری ارسال: {order.shipment.trackingCode}</p>
        ) : null}
      </section>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>محصول</TableHead>
            <TableHead>حکاکی</TableHead>
            <TableHead>تعداد</TableHead>
            <TableHead>مبلغ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => {
            const engraving = item.personalizationId
              ? engravingById.get(item.personalizationId)
              : null;
            return (
              <TableRow key={item.id}>
                <TableCell>
                  {item.productTitle}
                  <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    <GoldWeight mg={item.weightMg} size="sm" />
                  </p>
                </TableCell>
                <TableCell>
                  {engraving?.message ?? engraving?.childNameFa ?? "—"}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Money rial={item.lineTotalRial} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
