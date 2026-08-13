"use client";

import { cn } from "@/shared/lib/cn";
import { formatKarat, formatMg } from "@/shared/lib/gold";
import { Money } from "@/shared/ui/money";

import { stockLabel } from "../domain/product-filter";
import type { PricedVariant } from "../domain/types";

/**
 * انتخابگر گونه محصول.
 *
 * کامپوننت کنترل‌شده و بدون هیچ دانشی از سبد خرید؛ افزودن به سبد مسئولیت
 * ماژول orders است. این تفکیک لازم است تا گراف وابستگی ماژول‌ها دور نگیرد.
 */
export function VariantSelector({
  variants,
  selectedId,
  onSelect,
  className,
}: {
  variants: readonly PricedVariant[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
  className?: string;
}) {
  if (variants.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        این محصول در حال حاضر موجود نیست.
      </p>
    );
  }

  return (
    <fieldset className={cn("grid gap-2", className)}>
      <legend className="mb-1 text-sm font-medium">انتخاب وزن و عیار</legend>

      {variants.map((variant) => {
        const stock = stockLabel(variant);
        const isSelected = variant.id === selectedId;
        const isAvailable = variant.isActive && variant.stockQty > 0;

        return (
          <label
            key={variant.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors",
              isSelected
                ? "border-gold bg-gold-soft/40"
                : "border-border bg-card hover:border-gold/50",
              !isAvailable && "cursor-not-allowed opacity-55",
            )}
          >
            <input
              type="radio"
              name="variant"
              value={variant.id}
              checked={isSelected}
              onChange={() => onSelect(variant.id)}
              disabled={!isAvailable}
              className="size-4 accent-[var(--gold-deep)]"
            />

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{formatMg(variant.weightMg)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatKarat(variant.karat)}
                </span>
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-xs",
                  stock.tone === "success" && "text-success",
                  stock.tone === "warning" && "text-warning",
                  stock.tone === "destructive" && "text-destructive",
                )}
              >
                {stock.label}
              </span>
            </span>

            <span className="shrink-0 text-sm font-semibold">
              {variant.price ? (
                <Money rial={variant.price.unitPriceRial} />
              ) : (
                <span className="text-muted-foreground">قیمت به‌زودی</span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
