"use client";

import Link from "next/link";
import { MenuIcon, ShoppingBagIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { mainNav, site } from "@/shared/config/site";
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

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
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
            <GlassSheetContent side="bottom">
              <div className="flex items-start justify-between gap-3">
                <GlassSheetTitle>منو</GlassSheetTitle>
                <GlassSheetClose aria-label="بستن" className="rounded-full p-2 hover:bg-gold-soft/50">
                  <XIcon className="size-5 text-gold-deep" />
                </GlassSheetClose>
              </div>
              <nav className="mt-6 grid gap-1">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl px-3 py-3 text-start text-base hover:bg-gold-soft/40"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 grid gap-2 sm:hidden">
                {signedIn ? (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                        حساب من
                      </Link>
                    </Button>
                    {isStaffUser ? (
                      <Button asChild variant="outline">
                        <Link href="/admin" onClick={() => setMenuOpen(false)}>
                          مدیریت
                        </Link>
                      </Button>
                    ) : null}
                    <LogoutButton />
                  </>
                ) : (
                  <Button asChild variant="gold">
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      ورود
                    </Link>
                  </Button>
                )}
              </div>
            </GlassSheetContent>
          </GlassSheet>
        </div>
      </GlassSurface>
    </header>
  );
}
