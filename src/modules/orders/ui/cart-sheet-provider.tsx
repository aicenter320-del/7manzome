"use client";

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

interface CartSheetContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartSheetContext = createContext<CartSheetContextValue | null>(null);

/** وضعیت باز بودن شیت سبد؛ در لایوت سایت می‌نشیند. */
export function CartSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, setOpen, openCart, closeCart }),
    [open, openCart, closeCart],
  );

  return <CartSheetContext.Provider value={value}>{children}</CartSheetContext.Provider>;
}

export function useCartSheet(): CartSheetContextValue {
  const context = useContext(CartSheetContext);
  if (!context) {
    return {
      open: false,
      setOpen: () => undefined,
      openCart: () => undefined,
      closeCart: () => undefined,
    };
  }
  return context;
}
