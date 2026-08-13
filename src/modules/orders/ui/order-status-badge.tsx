import { ORDER_STATUS_LABELS, type OrderStatus } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";

const STATUS_VARIANT: Record<
  OrderStatus,
  "success" | "warning" | "destructive" | "info" | "muted" | "gold"
> = {
  created: "muted",
  payment_pending: "warning",
  paid: "success",
  processing: "info",
  personalization: "gold",
  quality_check: "info",
  packed: "muted",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
  refund_pending: "warning",
  refunded: "muted",
};

/** نشان وضعیت سفارش با برچسب فارسی. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
