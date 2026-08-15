"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarHeartIcon,
  GemIcon,
  GiftIcon,
  HomeIcon,
  InfoIcon,
  LandmarkIcon,
  LogInIcon,
  MenuIcon,
  ShieldIcon,
  ShoppingBagIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { useCartSheet } from "@/modules/orders/ui/cart-sheet-provider";
import { isActiveHref, mainNav, moreNav, site } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";
import { Button } from "@/shared/ui/button";
import { GlassIconButton } from "@/shared/ui/glass-icon-button";
import { GlassSurface } from "@/shared/ui/glass";
import {
  GlassSheet,
  GlassSheetClose,
  GlassSheetContent,
  GlassSheetTitle,
} from "@/shared/ui/glass-sheet";

import { LogoutButton } from "./logout-button";

const NAV_ICONS: Record<string, ReactNode> = {
  "/": <HomeIcon />,
  "/products": <GemIcon />,
  "/occasions": <CalendarHeartIcon />,
  "/gift": <GiftIcon />,
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
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep [&_svg]:size-4" aria-hidden>
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

export function SiteHeaderBar({
  signedIn,
  isStaffUser,
  cartCount,
}: {
  signedIn: boolean;
  isStaffUser: boolean;
  cartCount: number;
}) {
  const pathname = usePathname();
  const { openCart } = useCartSheet();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const cartLabel =
    cartCount > 0
      ? `سبد خرید، ${toPersianDigits(cartCount)} قطعه`
      : "سبد خرید";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <GlassSurface
        radius={999}
        tint={0.48}
        blur={12}
        className="site-nav-bar mx-auto w-full max-w-6xl"
        contentClassName="flex items-center gap-2 px-3 py-2 sm:px-5"
      >
        <Link
          href="/"
          aria-label={`${site.name}، صفحه اصلی`}
          className="shrink-0 text-base font-bold text-treasure sm:text-lg"
        >
          {site.name}
        </Link>

        <nav aria-label="مسیرهای اصلی" className="hidden min-w-0 flex-1 items-center justify-center gap-x-1 md:flex lg:gap-x-2">
          {mainNav.map((item) => {
            const active = isActiveHref(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.description}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors",
                  active
                    ? "font-medium text-gold-deep"
                    : "text-muted-foreground hover:text-gold-deep",
                )}
              >
                {item.title}
                {active ? (
                  <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gold" aria-hidden />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <span className="relative inline-flex">
            <GlassIconButton
              aria-label={cartLabel}
              className="text-gold-deep [&_svg]:size-5"
              onClick={openCart}
            >
              <ShoppingBagIcon />
            </GlassIconButton>
            {cartCount > 0 ? (
              <span className="pointer-events-none absolute -top-0.5 -end-0.5 min-w-4 rounded-full bg-gold px-1 text-center text-[10px] leading-4 text-accent-foreground">
                {toPersianDigits(cartCount)}
              </span>
            ) : null}
          </span>

          {signedIn ? (
            <>
              {isStaffUser ? (
                <Button asChild variant="gold" size="sm" className="hidden lg:inline-flex">
                  <Link href="/admin">مدیریت</Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/dashboard">حساب من</Link>
                </Button>
              )}
              {isStaffUser ? (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/dashboard">حساب من</Link>
                </Button>
              ) : null}
            </>
          ) : (
            <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">ورود</Link>
            </Button>
          )}

          <GlassSheet open={menuOpen} onOpenChange={setMenuOpen}>
            <GlassIconButton
              className="md:hidden"
              aria-label="منو"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </GlassIconButton>
            <GlassSheetContent side="end">
              <div className="flex items-start justify-between gap-3">
                <GlassSheetTitle>از کجا شروع می‌کنید؟</GlassSheetTitle>
                <GlassSheetClose aria-label="بستن" className="rounded-full p-2 hover:bg-gold-soft/50">
                  <XIcon className="size-5 text-gold-deep" />
                </GlassSheetClose>
              </div>

              <section className="mt-6 grid gap-1">
                <p className="px-3 text-xs font-medium text-gold-deep">خرید و هدیه</p>
                {mainNav.map((item) => (
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

              <section className="mt-6 grid gap-1">
                <p className="px-3 text-xs font-medium text-gold-deep">بیشتر بدانید</p>
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

              <section className="mt-6 grid gap-1">
                <p className="px-3 text-xs font-medium text-gold-deep">حساب</p>
                {signedIn ? (
                  <>
                    <MenuRow
                      href="/dashboard"
                      title="حساب من"
                      description="کودک، گنجینه و سفارش‌های شما"
                      icon={<UserIcon />}
                      active={isActiveHref(pathname, "/dashboard")}
                      onNavigate={closeMenu}
                    />
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
                  </>
                ) : (
                  <MenuRow
                    href="/login"
                    title="ورود"
                    description="با شماره موبایل؛ ساخت حساب جدا لازم نیست"
                    icon={<LogInIcon />}
                    active={isActiveHref(pathname, "/login")}
                    onNavigate={closeMenu}
                  />
                )}
              </section>
            </GlassSheetContent>
          </GlassSheet>
        </div>
      </GlassSurface>
    </header>
  );
}
