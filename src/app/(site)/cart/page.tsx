import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { CartLine, getCart } from "@/modules/orders";
import { optionalUser } from "@/server/auth/guards";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

export default async function CartPage() {
  const user = await optionalUser();
  const cart = await getCart(user?.id ?? null);
  const checkoutHref = user ? "/checkout" : "/login?returnTo=/checkout";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="سبد خرید" description="قیمت سبد زنده است و تا لحظه ثبت سفارش ممکن است تغییر کند." />

      {cart.items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<ShoppingBagIcon />}
          title="سبد خرید خالی است"
          description="محصولی انتخاب کنید تا اولین قدم گنجینه او را بردارید."
          action={
            <Button asChild>
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-8 grid gap-6">
          <div>
            {cart.items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </div>

          <div className="glass grid gap-2 rounded-3xl p-5">
            <p className="text-sm text-muted-foreground">
              جمع طلا: <GoldWeight mg={cart.goldTotalMg} size="sm" />
            </p>
            {cart.totalRial === null || !cart.priceAvailable ? (
              <p className="text-sm text-warning">
                قیمت طلا در دسترس نیست؛ فعلاً نمی‌توانید سفارش را نهایی کنید.
              </p>
            ) : (
              <p className="text-lg font-semibold text-gold-deep">
                مبلغ قابل پرداخت: <Money rial={cart.totalRial} />
              </p>
            )}
          </div>

          <Button asChild size="lg" disabled={!cart.priceAvailable}>
            <Link href={checkoutHref}>{user ? "ادامه به ثبت سفارش" : "ورود و ادامه خرید"}</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
