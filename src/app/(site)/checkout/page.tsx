import Link from "next/link";

import { CheckoutForm, getCart } from "@/modules/orders";
import { requireUser } from "@/server/auth/guards";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const cart = await getCart(user.id);

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <PageHeader title="ثبت سفارش" />
        <EmptyState
          className="mt-8"
          title="سبد خرید خالی است"
          description="ابتدا محصولی به سبد اضافه کنید."
          action={
            <Button asChild>
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
          }
        />
      </main>
    );
  }

  const recipientName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-10 sm:px-6">
      <PageHeader
        title="ثبت سفارش"
        description="پس از ثبت، قیمت برای شما قفل می‌شود و به صفحه پرداخت می‌روید."
      />

      <div className="glass rounded-3xl p-5 text-sm">
        <p>
          {cart.itemCount} قلم — <GoldWeight mg={cart.goldTotalMg} size="sm" />
        </p>
        {cart.totalRial !== null ? (
          <p className="mt-1 font-semibold text-gold-deep">
            مبلغ کل: <Money rial={cart.totalRial} />
          </p>
        ) : (
          <p className="mt-1 text-warning">قیمت طلا در دسترس نیست.</p>
        )}
      </div>

      {cart.priceAvailable ? (
        <CheckoutForm
          {...(recipientName ? { defaultRecipientName: recipientName } : {})}
          defaultRecipientPhone={user.phone}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          تا ثبت قیمت روز طلا، امکان نهایی‌کردن سفارش وجود ندارد.
        </p>
      )}
    </main>
  );
}
