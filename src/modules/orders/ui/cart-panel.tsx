"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";

import type { Cart } from "../domain/types";
import { CartLine } from "./cart-line";

/** محتوای مشترک سبد؛ شیت و صفحهٔ مستقیم هر دو از اینجا می‌خوانند. */
export function CartPanel({
  cart,
  checkoutHref,
  checkoutLabel,
  onCheckout,
}: {
  cart: Cart;
  checkoutHref: string;
  checkoutLabel: string;
  onCheckout?: () => void;
}) {
  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBagIcon />}
        title={copy.cart.emptyTitle}
        description={copy.cart.emptyDescription}
        action={
          <Button asChild>
            <Link href="/products">{cta.shop}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        {cart.items.map((item) => (
          <CartLine key={item.id} item={item} />
        ))}
      </div>

      <div className="rounded-lg bg-card p-5 shadow-product">
        <p className="text-sm text-muted-foreground">
          {copy.cart.goldTotal}: <GoldWeight mg={cart.goldTotalMg} size="sm" />
        </p>
        {cart.totalRial === null || !cart.priceAvailable ? (
          <p className="mt-2 text-sm text-warning">{copy.cart.priceUnavailable}</p>
        ) : (
          <p className="mt-2 text-lg font-semibold text-gold-deep">
            {copy.cart.payable}: <Money rial={cart.totalRial} />
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{copy.cart.sheetHint}</p>
      </div>

      <Button asChild size="lg" variant="gold" disabled={!cart.priceAvailable}>
        <Link href={checkoutHref} onClick={onCheckout}>
          {checkoutLabel}
        </Link>
      </Button>
    </div>
  );
}
