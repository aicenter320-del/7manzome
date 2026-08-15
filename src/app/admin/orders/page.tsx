import Link from "next/link";

import { DataTable, GlassFilterPills, TableCell, TableRow } from "@/modules/admin";
import {
  isClosedJourneyStatus,
  journeyStationOf,
  listOrdersForAdmin,
  ORDER_JOURNEY_CLOSED,
  ORDER_JOURNEY_STATIONS,
  OrderStatusBadge,
  parseJourneyStation,
} from "@/modules/orders";
import { requirePermission } from "@/server/auth/guards";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";
import { cn } from "@/shared/lib/cn";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

const STUCK_AFTER_MS = 3 * 86_400_000;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

async function readClockMs(): Promise<number> {
  return Date.now();
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ station?: string | string[]; view?: string | string[] }>;
}) {
  await requirePermission("order:read");
  const params = await searchParams;
  const station = parseJourneyStation(firstParam(params.station));
  const tableView = firstParam(params.view) === "table";

  const { orders } = await listOrdersForAdmin({ limit: 200 });
  const now = await readClockMs();

  const stations = [...ORDER_JOURNEY_STATIONS, ORDER_JOURNEY_CLOSED];
  const grouped = stations.map((item) => ({
    ...item,
    orders: orders.filter((order) => journeyStationOf(order.status) === item.key),
  }));

  const visible = station ? grouped.filter((item) => item.key === station) : grouped;
  const mapStations = station === "closed" ? visible : visible.filter((item) => item.key !== "closed");

  return (
    <div className="grid gap-6">
      <PageHeader
        title="سفارش‌ها"
        description="سفر مشتری از پرداخت تا تحویل."
        actions={
          <Link href={tableView ? "/admin/orders" : "/admin/orders?view=table"} className="text-sm text-primary">
            {tableView ? "نمایش نقشه" : "نمایش جدول"}
          </Link>
        }
      />

      <GlassFilterPills
        ariaLabel="ایستگاه سفر سفارش"
        items={[
          { href: tableView ? "/admin/orders?view=table" : "/admin/orders", label: "نقشه", isActive: !station },
          ...ORDER_JOURNEY_STATIONS.map((item) => ({
            href: `/admin/orders?station=${item.key}${tableView ? "&view=table" : ""}`,
            label: item.label,
            isActive: station === item.key,
          })),
          {
            href: `/admin/orders?station=closed${tableView ? "&view=table" : ""}`,
            label: ORDER_JOURNEY_CLOSED.label,
            isActive: station === "closed",
          },
        ]}
      />

      {tableView ? (
        <DataTable
          columns={["شماره", "ایستگاه", "گیرنده", "مبلغ", "تاریخ"]}
          isEmpty={orders.length === 0}
          emptyTitle="سفارشی پیدا نشد"
        >
          {(station ? visible[0]?.orders ?? [] : orders).map((order) => (
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
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {mapStations.map((item) => (
            <section
              key={item.key}
              className="flex w-64 shrink-0 flex-col gap-2 rounded-2xl glass p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">{item.label}</h2>
                <span className="text-xs text-muted-foreground">{toPersianDigits(item.orders.length)}</span>
              </div>
              {item.orders.length === 0 ? (
                <p className="text-xs text-muted-foreground">سفارشی در این ایستگاه نیست.</p>
              ) : (
                <ul className="grid gap-2">
                  {item.orders.map((order) => {
                    const stuck =
                      now - order.updatedAt > STUCK_AFTER_MS && !isClosedJourneyStatus(order.status);
                    return (
                      <li key={order.id}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className={cn(
                            "grid gap-1 rounded-xl bg-card/70 p-3 text-sm hover:bg-card",
                            stuck && "ring-1 ring-warning/40",
                          )}
                        >
                          <p className="ltr-nums font-medium">{order.orderNumber}</p>
                          <p className="text-muted-foreground">{order.recipientName}</p>
                          <p>
                            <Money rial={order.totalRial} />
                          </p>
                          {stuck ? (
                            <p className="text-xs text-warning">بیش از سه روز مانده</p>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
