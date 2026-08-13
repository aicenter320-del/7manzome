import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { getCart } from "@/modules/orders";
import { optionalUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/rbac";
import { mainNav, site } from "@/shared/config/site";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";

import { LogoutButton } from "./logout-button";

export async function SiteHeader() {
  const user = await optionalUser();
  const cart = await getCart(user?.id ?? null);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="font-bold text-treasure">
          {site.name}
        </Link>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/cart" className="gap-1.5">
              <ShoppingBagIcon className="size-4" />
              سبد
              {cart.itemCount > 0 ? (
                <span className="rounded-full bg-gold-soft px-1.5 text-xs text-gold-deep">
                  {toPersianDigits(cart.itemCount)}
                </span>
              ) : null}
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">حساب من</Link>
              </Button>
              {isStaff(user.roles) ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">مدیریت</Link>
                </Button>
              ) : null}
              <LogoutButton />
            </>
          ) : (
            <Button asChild variant="gold" size="sm">
              <Link href="/login">ورود</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
