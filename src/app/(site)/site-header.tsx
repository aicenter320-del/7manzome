import { getCart } from "@/modules/orders";
import { CartSheet } from "@/modules/orders/ui/cart-sheet";
import { optionalUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/rbac";

import { SiteHeaderBar } from "./site-header-bar";

export async function SiteHeader() {
  const user = await optionalUser();
  const cart = await getCart(user?.id ?? null);

  return (
    <>
      <SiteHeaderBar
        signedIn={Boolean(user)}
        isStaffUser={user ? isStaff(user.roles) : false}
        cartCount={cart.itemCount}
      />
      <CartSheet cart={cart} signedIn={Boolean(user)} />
    </>
  );
}
