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

import { mainNav, site } from "@/shared/config/site";
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
  children,
  icon,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-start text-base hover:bg-gold-soft/40"
      onClick={onNavigate}
    >
      <span>{children}</span>
      <span className="text-gold-deep [&_svg]:size-4" aria-hidden>
        {icon}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayHero = usePathname() === "/";

  return (
    <header
      className={cn(
        "z-40 px-3 pt-3 sm:px-6",
        overlayHero ? "fixed inset-x-0 top-0" : "sticky top-0",
      )}
    >
      <GlassSurface
        radius={999}
        tint={0.48}
        className="mx-auto w-full max-w-6xl"
        contentClassName="flex items-center gap-2 px-3 py-2 sm:px-5"
      >
        <Link href="/" className="shrink-0 font-bold text-treasure">
          {site.name}
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-x-5 text-sm lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-muted-foreground transition-colors hover:text-gold-deep"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <Link
            href="/cart"
            aria-label="سبد خرید"
            className="relative inline-flex size-12 items-center justify-center rounded-full glass text-gold-deep [&_svg]:size-5"
          >
            <ShoppingBagIcon />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -start-1 rounded-full bg-gold px-1.5 text-[10px] leading-4 text-accent-foreground">
                {toPersianDigits(cartCount)}
              </span>
            ) : null}
          </Link>

          {signedIn ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">حساب من</Link>
              </Button>
              {isStaffUser ? (
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link href="/admin">مدیریت</Link>
                </Button>
              ) : null}
              <LogoutButton className="hidden sm:inline-flex" />
            </>
          ) : (
            <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">ورود</Link>
            </Button>
          )}

          <GlassSheet open={menuOpen} onOpenChange={setMenuOpen}>
            <GlassIconButton
              className="lg:hidden"
              aria-label="منو"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </GlassIconButton>
            <GlassSheetContent side="end">
              <div className="flex items-start justify-between gap-3">
                <GlassSheetTitle>منو</GlassSheetTitle>
                <GlassSheetClose aria-label="بستن" className="rounded-full p-2 hover:bg-gold-soft/50">
                  <XIcon className="size-5 text-gold-deep" />
                </GlassSheetClose>
              </div>
              <nav className="mt-6 grid gap-1">
                {mainNav.map((item) => (
                  <MenuRow
                    key={item.href}
                    href={item.href}
                    icon={NAV_ICONS[item.href]}
                    onNavigate={() => setMenuOpen(false)}
                  >
                    {item.title}
                  </MenuRow>
                ))}
              </nav>
              <div className="mt-6 grid gap-1 sm:hidden">
                {signedIn ? (
                  <>
                    <MenuRow
                      href="/dashboard"
                      icon={<UserIcon />}
                      onNavigate={() => setMenuOpen(false)}
                    >
                      حساب من
                    </MenuRow>
                    {isStaffUser ? (
                      <MenuRow
                        href="/admin"
                        icon={<ShieldIcon />}
                        onNavigate={() => setMenuOpen(false)}
                      >
                        مدیریت
                      </MenuRow>
                    ) : null}
                    <LogoutButton />
                  </>
                ) : (
                  <MenuRow
                    href="/login"
                    icon={<LogInIcon />}
                    onNavigate={() => setMenuOpen(false)}
                  >
                    ورود
                  </MenuRow>
                )}
              </div>
            </GlassSheetContent>
          </GlassSheet>
        </div>
      </GlassSurface>
    </header>
  );
}
