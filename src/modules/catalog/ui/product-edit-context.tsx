"use client";

import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

interface ProductEditContextValue {
  canEdit: boolean;
  editing: boolean;
  setEditing: (value: boolean) => void;
}

const ProductEditContext = createContext<ProductEditContextValue>({
  canEdit: false,
  editing: false,
  setEditing: () => undefined,
});

/** حالت ویرایش وردپرسی روی صفحهٔ محصول؛ فقط با catalog:write فعال است. */
export function ProductEditProvider({
  canEdit,
  initialEditing = false,
  children,
}: {
  canEdit: boolean;
  initialEditing?: boolean;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(canEdit && initialEditing);
  const value = useMemo(
    () => ({
      canEdit,
      editing: canEdit && editing,
      setEditing: (next: boolean) => setEditing(canEdit && next),
    }),
    [canEdit, editing],
  );

  return <ProductEditContext.Provider value={value}>{children}</ProductEditContext.Provider>;
}

export function useProductEdit(): ProductEditContextValue {
  return useContext(ProductEditContext);
}
