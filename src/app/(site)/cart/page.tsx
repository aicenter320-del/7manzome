import { OpenCartOnMount } from "./open-cart-on-mount";
import { CartPanel, getCart } from "@/modules/orders";
import { optionalUser } from "@/server/auth/guards";
import { copy, cta } from "@/shared/config/copy";
import { PageHeader } from "@/shared/ui/page-header";

export default async function CartPage() {
  const user = await optionalUser();
  const cart = await getCart(user?.id ?? null);
  const checkoutHref = user ? "/checkout" : "/login?returnTo=/checkout";
  const checkoutLabel = user ? cta.continueOrder : cta.loginToBuy;

  return (
    <main className="px-4 py-6">
      <OpenCartOnMount />
      <PageHeader title={copy.cart.title} description={copy.cart.description} />
      <div className="mt-8">
        <CartPanel cart={cart} checkoutHref={checkoutHref} checkoutLabel={checkoutLabel} />
      </div>
    </main>
  );
}
