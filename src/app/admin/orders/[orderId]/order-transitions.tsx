"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { transitionOrderAction } from "@/modules/orders/actions/order.actions";
import { nextStatuses } from "@/modules/orders/domain/order-status";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/shared/types/enums";
import { Button } from "@/shared/ui/button";

export function OrderTransitions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const next = nextStatuses(status);

  if (next.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((to) => (
        <Button
          key={to}
          type="button"
          variant={to === "cancelled" ? "destructive" : "outline"}
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await transitionOrderAction({ orderId, to });
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success("وضعیت سفارش به‌روز شد.");
              router.refresh();
            });
          }}
        >
          {ORDER_STATUS_LABELS[to]}
        </Button>
      ))}
    </div>
  );
}
