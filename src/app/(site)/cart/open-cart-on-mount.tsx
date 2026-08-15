"use client";

import { useEffect } from "react";

import { useCartSheet } from "@/modules/orders/ui/cart-sheet-provider";

/** لینک مستقیم /cart همان شیت سبد را باز می‌کند. */
export function OpenCartOnMount() {
  const { openCart } = useCartSheet();

  useEffect(() => {
    openCart();
  }, [openCart]);

  return null;
}
