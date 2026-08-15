"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";

import type { PricedVariant } from "@/modules/catalog/domain/types";
import { VariantSelector } from "@/modules/catalog/ui/variant-selector";
import { PriceBreakdownTable } from "@/modules/pricing/ui/price-breakdown-table";
import { copy, cta } from "@/shared/config/copy";
import { toPersianDigits } from "@/shared/lib/persian";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Money } from "@/shared/ui/money";

import { addToCartAction } from "../actions/cart.actions";
import { useCartSheet } from "./cart-sheet-provider";

function firstAvailableId(variants: readonly PricedVariant[]): string | null {
  const available = variants.find((item) => item.isActive && item.stockQty > 0);
  return available?.id ?? variants[0]?.id ?? null;
}

/** پنل کوتاه خرید: قیمت، گونه، تعداد و افزودن به سبد. */
export function AddToCartPanel({
  variants,
  selectedId,
  onSelect,
}: {
  variants: readonly PricedVariant[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
}) {
  const router = useRouter();
  const { openCart } = useCartSheet();
  const [isPending, startTransition] = useTransition();
  const [qty, setQty] = useState(1);
  const selected = useMemo(
    () => variants.find((item) => item.id === selectedId) ?? null,
    [variants, selectedId],
  );

  const canAdd = Boolean(selected?.isActive && selected.stockQty > 0 && selected.price);

  const addToCart = () => {
    if (!selected) return;

    startTransition(async () => {
      const result = await addToCartAction({
        variantId: selected.id,
        quantity: qty,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("به سبد خرید اضافه شد.");
      openCart();
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6">
      {selected?.price ? (
        <div className="grid gap-1">
          <p>
            <span className="text-3xl font-semibold text-gold-deep">
              <Money rial={selected.price.unitPriceRial} />
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{copy.productDetail.livePriceHint}</p>
        </div>
      ) : (
        <p className="text-muted-foreground">قیمت به‌زودی</p>
      )}

      <VariantSelector variants={variants} selectedId={selectedId} onSelect={onSelect} />

      <div className="grid gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <FormField id="quantity" label={copy.productDetail.quantity} className="w-auto">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="کاهش تعداد"
                disabled={qty <= 1}
                onClick={() => setQty((value) => Math.max(1, value - 1))}
              >
                <MinusIcon />
              </Button>
              <span className="min-w-8 text-center tabular-nums">{toPersianDigits(qty)}</span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="افزایش تعداد"
                disabled={qty >= 20 || (selected !== null && qty >= selected.stockQty)}
                onClick={() => setQty((value) => Math.min(20, value + 1))}
              >
                <PlusIcon />
              </Button>
            </div>
          </FormField>

          <Button
            type="button"
            variant="gold"
            size="lg"
            className="min-w-[12rem] flex-1"
            disabled={!canAdd || isPending}
            onClick={addToCart}
          >
            {isPending ? <Loader2Icon className="animate-spin" /> : <ShoppingBagIcon />}
            {cta.addToCart}
          </Button>
        </div>
      </div>

      {selected?.price ? (
        <Accordion type="single" collapsible className="rounded-lg bg-card px-5 shadow-product">
          <AccordionItem value="price" className="border-b-0">
            <AccordionTrigger>{copy.productDetail.priceDetails}</AccordionTrigger>
            <AccordionContent className="text-foreground">
              <PriceBreakdownTable breakdown={selected.price} showHeading={false} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}

      {!canAdd ? (
        <p className="text-sm text-muted-foreground">
          این گونه در حال حاضر قابل خرید نیست. گونه دیگری را انتخاب کنید یا بعداً سر بزنید.
        </p>
      ) : null}
    </div>
  );
}

export function firstSellableVariantId(variants: readonly PricedVariant[]): string | null {
  return firstAvailableId(variants);
}
