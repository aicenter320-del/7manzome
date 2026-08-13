"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { cancelOrderAction } from "@/modules/orders/actions/order.actions";
import { Button } from "@/shared/ui/button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await cancelOrderAction({ orderId });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("سفارش لغو شد.");
          router.refresh();
        });
      }}
    >
      لغو سفارش
    </Button>
  );
}
