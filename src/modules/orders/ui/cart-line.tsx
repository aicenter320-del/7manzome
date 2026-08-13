"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";

import { removeCartItemAction, updateCartItemAction } from "../actions/cart.actions";
import type { CartItem } from "../domain/types";

/** یک ردیف سبد خرید با کنترل تعداد و حذف. */
export function CartLine({ item }: { item: CartItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeQty = (quantity: number) => {
    if (quantity < 1) return;

    startTransition(async () => {
      const result = await updateCartItemAction({ itemId: item.id, quantity });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  const remove = () => {
    startTransition(async () => {
      const result = await removeCartItemAction({ itemId: item.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("از سبد حذف شد.");
      router.refresh();
    });
  };

  return (
    <article className="flex flex-wrap items-start justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium leading-snug">{item.productTitle}</h3>
        {item.variantTitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{item.variantTitle}</p>
        ) : null}
        <p className="mt-1 text-sm text-muted-foreground">
          <GoldWeight mg={item.weightMg} karat={item.karat} size="sm" />
        </p>
      </div>

      <div className="flex flex-col items-end gap-3">
        {item.lineTotalRial === null ? (
          <p className="text-sm text-muted-foreground">قیمت نامشخص</p>
        ) : (
          <p className="font-semibold text-gold-deep">
            <Money rial={item.lineTotalRial} />
          </p>
        )}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="کاهش تعداد"
            disabled={isPending || item.quantity <= 1}
            onClick={() => changeQty(item.quantity - 1)}
          >
            <MinusIcon />
          </Button>
          <span className="min-w-8 text-center tabular-nums text-sm">
            {toPersianDigits(item.quantity)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="افزایش تعداد"
            disabled={isPending || item.quantity >= item.stockQty}
            onClick={() => changeQty(item.quantity + 1)}
          >
            <PlusIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="حذف از سبد"
            disabled={isPending}
            onClick={remove}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>
    </article>
  );
}
