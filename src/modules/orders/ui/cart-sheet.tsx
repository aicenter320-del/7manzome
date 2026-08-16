"use client";

import { XIcon } from "lucide-react";

import { copy, cta } from "@/shared/config/copy";
import {
  GlassSheet,
  GlassSheetClose,
  GlassSheetContent,
  GlassSheetDescription,
  GlassSheetTitle,
} from "@/shared/ui/glass-sheet";

import type { Cart } from "../domain/types";
import { CartPanel } from "./cart-panel";
import { useCartSheet } from "./cart-sheet-provider";

/** شیت سبد خرید؛ از هدر و پس از افزودن به سبد باز می‌شود. */
export function CartSheet({ cart, signedIn }: { cart: Cart; signedIn: boolean }) {
  const { open, setOpen, closeCart } = useCartSheet();
  const checkoutHref = signedIn ? "/checkout" : "/login?returnTo=/checkout";
  const checkoutLabel = signedIn ? cta.continueOrder : cta.loginToBuy;

  return (
    <GlassSheet open={open} onOpenChange={setOpen}>
      <GlassSheetContent side="bottom" className="app-column-sheet">
        <div className="flex items-start justify-between gap-3">
          <div>
            <GlassSheetTitle>{copy.cart.title}</GlassSheetTitle>
            <GlassSheetDescription>{copy.cart.description}</GlassSheetDescription>
          </div>
          <GlassSheetClose aria-label="بستن" className="rounded-full p-2 hover:bg-gold-soft/50">
            <XIcon className="size-5 text-gold-deep" />
          </GlassSheetClose>
        </div>

        <div className="mt-6">
          <CartPanel
            cart={cart}
            checkoutHref={checkoutHref}
            checkoutLabel={checkoutLabel}
            onCheckout={closeCart}
          />
        </div>
      </GlassSheetContent>
    </GlassSheet>
  );
}
