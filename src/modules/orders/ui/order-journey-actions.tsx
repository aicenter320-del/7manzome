"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { transitionOrderAction } from "@/modules/orders/actions/order.actions";
import { nextStatuses } from "@/modules/orders/domain/order-status";
import { preferredForwardStatus } from "@/modules/orders/domain/order-journey";
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

export function OrderJourneyActions({
  orderId,
  status,
  hasPersonalization,
}: {
  orderId: string;
  status: OrderStatus;
  hasPersonalization: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingTo, setPendingTo] = useState<OrderStatus | null>(null);
  const [selectKey, setSelectKey] = useState(0);
  const next = nextStatuses(status);
  const forward = preferredForwardStatus(status, hasPersonalization);
  const other = next.filter((item) => item !== forward);

  if (next.length === 0) {
    return null;
  }

  function closeDialog() {
    setPendingTo(null);
    setSelectKey((key) => key + 1);
  }

  function confirm() {
    if (!pendingTo) {
      return;
    }
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
    <div className="grid max-w-sm gap-3">
      {forward ? (
        <Button type="button" disabled={isPending} onClick={() => setPendingTo(forward)}>
          مرحله بعد: {ORDER_STATUS_LABELS[forward]}
        </Button>
      ) : null}

      {other.length > 0 ? (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">تغییر دیگر</p>
          <Select
            key={selectKey}
            disabled={isPending}
            onValueChange={(to) => setPendingTo(to as OrderStatus)}
          >
            <SelectTrigger aria-label="تغییر دیگر وضعیت سفارش">
              <SelectValue placeholder="بازگشت یا لغو" />
            </SelectTrigger>
            <SelectContent>
              {other.map((to) => (
                <SelectItem key={to} value={to}>
                  {ORDER_STATUS_LABELS[to]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Dialog
        open={pendingTo !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            closeDialog();
          }
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
            <Button type="button" variant="outline" disabled={isPending} onClick={closeDialog}>
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
