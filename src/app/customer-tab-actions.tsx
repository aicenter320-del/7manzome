"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarHeartIcon,
  InfoIcon,
  LandmarkIcon,
  MenuIcon,
  ShieldIcon,
  ShoppingBagIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { useCartSheet } from "@/modules/orders/ui/cart-sheet-provider";
import { isActiveHref, moreNav } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { customerTabClass } from "@/shared/ui/app-tab-bar";
import {
  GlassSheet,
  GlassSheetClose,
  GlassSheetContent,
  GlassSheetTitle,
} from "@/shared/ui/glass-sheet";

import { LogoutButton } from "./(site)/logout-button";

const NAV_ICONS: Record<string, ReactNode> = {
  "/occasions": <CalendarHeartIcon />,
  "/treasures": <LandmarkIcon />,
  "/about": <InfoIcon />,
};

function MenuRow({
  href,
  title,
  description,
  icon,
  active,
  onNavigate,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 text-start transition-colors",
        active ? "bg-gold-soft/60" : "hover:bg-gold-soft/40",
      )}
      onClick={onNavigate}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep [&_svg]:size-4"
        aria-hidden
      >
        {icon}
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className={cn("font-medium", active ? "text-gold-deep" : "text-foreground")}>
          {title}
        </span>
        <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
}

function CartTab({ cartCount }: { cartCount: number }) {
  const pathname = usePathname();
  const { open, openCart } = useCartSheet();
  const cartLabel =
    cartCount > 0
      ? `سبد خرید، ${toPersianDigits(cartCount)} قطعه`
      : "سبد خرید";
  const active = open || pathname.startsWith("/cart");

  return (
    <li>
      <button type="button" aria-label={cartLabel} className={customerTabClass(active)} onClick={openCart}>
        <span className="relative [&_svg]:size-5" aria-hidden>
          <ShoppingBagIcon />
          {cartCount > 0 ? (
            <span className="absolute -top-1 -end-2.5 min-w-3.5 rounded-full bg-gold px-1 text-center text-[9px] leading-4 text-accent-foreground">
              {toPersianDigits(cartCount)}
            </span>
          ) : null}
        </span>
        سبد
        {active ? (
          <span className="absolute bottom-1 h-0.5 w-7 rounded-full bg-gold-400" aria-hidden />
        ) : null}
      </button>
    </li>
  );
}

function MoreTab({
  signedIn,
  isStaffUser,
}: {
  signedIn: boolean;
  isStaffUser: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const onMorePage = moreNav.some((item) => isActiveHref(pathname, item.href));

  return (
    <li>
      <GlassSheet open={menuOpen} onOpenChange={setMenuOpen}>
        <button
          type="button"
          aria-label="بیشتر"
          aria-expanded={menuOpen}
          className={customerTabClass(menuOpen || onMorePage)}
          onClick={() => setMenuOpen(true)}
        >
          <span className="[&_svg]:size-5" aria-hidden>
            <MenuIcon />
          </span>
          بیشتر
          {menuOpen || onMorePage ? (
            <span className="absolute bottom-1 h-0.5 w-7 rounded-full bg-gold-400" aria-hidden />
          ) : null}
        </button>
        <GlassSheetContent side="bottom" className="app-column-sheet">
          <div className="flex items-start justify-between gap-3">
            <GlassSheetTitle>بیشتر</GlassSheetTitle>
            <GlassSheetClose aria-label="بستن" className="rounded-full p-2 hover:bg-gold-soft/50">
              <XIcon className="size-5 text-gold-deep" />
            </GlassSheetClose>
          </div>

          <section className="mt-6 grid gap-1">
            {moreNav.map((item) => (
              <MenuRow
                key={item.href}
                href={item.href}
                title={item.title}
                description={item.description}
                icon={NAV_ICONS[item.href] ?? null}
                active={isActiveHref(pathname, item.href)}
                onNavigate={closeMenu}
              />
            ))}
          </section>

          {signedIn ? (
            <section className="mt-6 grid gap-1">
              {isStaffUser ? (
                <MenuRow
                  href="/admin"
                  title="مدیریت"
                  description="پنل کارکنان فروشگاه"
                  icon={<ShieldIcon />}
                  active={isActiveHref(pathname, "/admin")}
                  onNavigate={closeMenu}
                />
              ) : null}
              <div className="px-3 pt-2">
                <LogoutButton />
              </div>
            </section>
          ) : null}
        </GlassSheetContent>
      </GlassSheet>
    </li>
  );
}

/** سبد و شیت بیشتر؛ همان سبک تب‌های نوار پایین. */
export function CustomerTabActions({
  signedIn,
  isStaffUser,
  cartCount,
}: {
  signedIn: boolean;
  isStaffUser: boolean;
  cartCount: number;
}) {
  return (
    <>
      <CartTab cartCount={cartCount} />
      <MoreTab signedIn={signedIn} isStaffUser={isStaffUser} />
    </>
  );
}
