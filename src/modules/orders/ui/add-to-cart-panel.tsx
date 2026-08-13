"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";

import type { PricedVariant } from "@/modules/catalog/domain/types";
import { VariantSelector } from "@/modules/catalog/ui/variant-selector";
import { EngravingPreview } from "@/modules/personalization/ui/engraving-preview";
import { PriceBreakdownTable } from "@/modules/pricing/ui/price-breakdown-table";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

import { addToCartAction } from "../actions/cart.actions";

function firstAvailableId(variants: readonly PricedVariant[]): string | null {
  const available = variants.find((item) => item.isActive && item.stockQty > 0);
  return available?.id ?? variants[0]?.id ?? null;
}

/** پنل انتخاب گونه، پیش‌نمایش حکاکی و افزودن به سبد. */
export function AddToCartPanel({
  variants,
  isPersonalizable,
}: {
  variants: readonly PricedVariant[];
  isPersonalizable: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(() => firstAvailableId(variants));
  const [qty, setQty] = useState(1);
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => variants.find((item) => item.id === selectedId) ?? null,
    [variants, selectedId],
  );

  const engravingMaxChars = selected?.engravingMaxChars ?? 0;
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
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6">
      <VariantSelector variants={variants} selectedId={selectedId} onSelect={setSelectedId} />

      {selected?.price ? <PriceBreakdownTable breakdown={selected.price} /> : null}

      {isPersonalizable ? (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">شخصی‌سازی حکاکی</p>
          <p className="text-xs text-muted-foreground">
            پیش‌نمایش را ببینید. جزئیات نهایی هنگام آماده‌سازی سفارش با شما هماهنگ می‌شود.
          </p>

          <FormField id="engravingNameFa" label="نام فارسی">
            <Input
              id="engravingNameFa"
              value={nameFa}
              onChange={(event) => setNameFa(event.target.value)}
              placeholder="آراد"
            />
          </FormField>

          <FormField id="engravingNameEn" label="نام لاتین">
            <Input
              id="engravingNameEn"
              dir="ltr"
              className="text-start"
              value={nameEn}
              onChange={(event) => setNameEn(event.target.value)}
              placeholder="ARAD"
            />
          </FormField>

          <FormField id="engravingMessage" label="پیام حکاکی">
            <Textarea
              id="engravingMessage"
              rows={3}
              maxLength={engravingMaxChars > 0 ? engravingMaxChars : undefined}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </FormField>

          <EngravingPreview
            nameFa={nameFa}
            nameEn={nameEn}
            message={message}
            maxChars={engravingMaxChars}
          />
        </div>
      ) : null}

      <FormField id="quantity" label="تعداد">
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" disabled={!canAdd || isPending} onClick={addToCart}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <ShoppingBagIcon />}
          افزودن به سبد
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">مشاهده سبد خرید</Link>
        </Button>
      </div>

      {!canAdd ? (
        <p className="text-sm text-muted-foreground">
          این گونه در حال حاضر قابل خرید نیست. گونه دیگری را انتخاب کنید یا بعداً سر بزنید.
        </p>
      ) : null}
    </div>
  );
}
