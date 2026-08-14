"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { transitionOrderAction } from "@/modules/orders/actions/order.actions";
import { nextStatuses } from "@/modules/orders/domain/order-status";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/shared/types/enums";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function OrderTransitions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingTo, setPendingTo] = useState<OrderStatus | null>(null);
  const [selectKey, setSelectKey] = useState(0);
  const next = nextStatuses(status);

  if (next.length === 0) return null;

  function closeDialog() {
    setPendingTo(null);
    setSelectKey((key) => key + 1);
  }

  function confirm() {
    if (!pendingTo) return;
    const to = pendingTo;
    startTransition(async () => {
      const result = await transitionOrderAction({
        orderId,
        to,
      });
      if (!result.ok) {
        toast.error(result.error);
        closeDialog();
        return;
      }
      toast.success("وضعیت سفارش به‌روز شد.");
      setPendingTo(null);
      router.refresh();
    });
  }

  const isDestructive = pendingTo === "cancelled" || pendingTo === "refunded";

  return (
    <div className="max-w-xs">
      <p className="mb-2 text-xs text-muted-foreground">تغییر وضعیت</p>
      <Select
        key={selectKey}
        disabled={isPending}
        onValueChange={(to) => setPendingTo(to as OrderStatus)}
      >
        <SelectTrigger aria-label="انتخاب وضعیت سفارش" className="glass">
          <SelectValue placeholder={ORDER_STATUS_LABELS[status]} />
        </SelectTrigger>
        <SelectContent>
          {next.map((to) => (
            <SelectItem key={to} value={to}>
              {ORDER_STATUS_LABELS[to]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={pendingTo !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) closeDialog();
        }}
      >
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>تغییر وضعیت سفارش</DialogTitle>
            <DialogDescription>
              {pendingTo
                ? `وضعیت از «${ORDER_STATUS_LABELS[status]}» به «${ORDER_STATUS_LABELS[pendingTo]}» تغییر می‌کند. ادامه می‌دهید؟`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant={isDestructive ? "destructive" : "default"}
              disabled={isPending}
              onClick={confirm}
            >
              تایید
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={closeDialog}
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
