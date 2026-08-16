import type { ReactNode } from "react";

import { getCart } from "@/modules/orders";
import { CartSheet } from "@/modules/orders/ui/cart-sheet";
import { CartSheetProvider } from "@/modules/orders/ui/cart-sheet-provider";
import { optionalUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/rbac";

import { CustomerFrame } from "./customer-frame";
import { SiteHeaderBar } from "./(site)/site-header-bar";

/** کروم مشترک ویترین، ورود و داشبورد والد. */
export async function CustomerShell({ children }: { children: ReactNode }) {
  const user = await optionalUser();
  const cart = await getCart(user?.id ?? null);
  const signedIn = Boolean(user);
  const isStaffUser = user ? isStaff(user.roles) : false;

  return (
    <div className="customer-shell">
      <CartSheetProvider>
        <CustomerFrame
          signedIn={signedIn}
          isStaffUser={isStaffUser}
          cartCount={cart.itemCount}
          header={
            <>
              <SiteHeaderBar signedIn={signedIn} />
              <CartSheet cart={cart} signedIn={signedIn} />
            </>
          }
        >
          {children}
        </CustomerFrame>
      </CartSheetProvider>
    </div>
  );
}
