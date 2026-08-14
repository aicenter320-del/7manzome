"use client";

import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { GlassIconButton } from "@/shared/ui/glass-icon-button";
import { GlassSurface } from "@/shared/ui/glass";
import {
  GlassSheet,
  GlassSheetClose,
  GlassSheetContent,
  GlassSheetTitle,
} from "@/shared/ui/glass-sheet";

export type AppNavTone = "brand" | "tool";

export function AppNavShell({
  brandHref,
  brandLabel,
  actions,
  nav,
  footer,
  children,
  tone = "brand",
}: {
  brandHref: string;
  brandLabel: string;
  actions?: ReactNode;
  nav: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** brand = ویترین طلایی؛ tool = پنل بدون لهجه طلایی. */
  tone?: AppNavTone;
}) {
  const [open, setOpen] = useState(false);
  const isTool = tone === "tool";

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="hidden p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-72 lg:flex-col">
        <GlassSurface
          radius={28}
          tint={0.5}
          className="h-full"
          contentClassName="flex h-full flex-col p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <Link
              href={brandHref}
              className={cn("font-semibold", isTool ? "text-foreground" : "text-treasure")}
            >
              {brandLabel}
            </Link>
            {actions}
          </div>
          <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-auto">{nav}</nav>
          {footer}
        </GlassSurface>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between gap-2 px-3 py-3 lg:hidden">
        <GlassSurface
          radius={999}
          tint={0.5}
          className="w-full"
          contentClassName="flex items-center justify-between gap-2 px-3 py-2"
        >
          <Link
            href={brandHref}
            className={cn("font-semibold", isTool ? "text-foreground" : "text-treasure")}
          >
            {brandLabel}
          </Link>
          <div className="flex items-center gap-1">
            <GlassSheet open={open} onOpenChange={setOpen}>
              <GlassIconButton aria-label="منو" onClick={() => setOpen(true)}>
                <MenuIcon />
              </GlassIconButton>
              <GlassSheetContent side="end">
                <div className="flex items-start justify-between gap-3">
                  <GlassSheetTitle>{brandLabel}</GlassSheetTitle>
                  <GlassSheetClose
                    aria-label="بستن"
                    className={cn(
                      "rounded-full p-2",
                      isTool ? "hover:bg-muted" : "hover:bg-gold-soft/50",
                    )}
                  >
                    <XIcon
                      className={cn("size-5", isTool ? "text-foreground" : "text-gold-deep")}
                    />
                  </GlassSheetClose>
                </div>
                <nav className="mt-6 grid gap-1" onClick={() => setOpen(false)}>
                  {nav}
                </nav>
                {actions ? <div className="mt-6">{actions}</div> : null}
              </GlassSheetContent>
            </GlassSheet>
          </div>
        </GlassSurface>
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "mx-auto w-full px-4 py-6 sm:px-6 sm:py-8",
            isTool ? "max-w-7xl" : "max-w-6xl",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function AppNavLink({
  href,
  children,
  className,
  tone = "brand",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: AppNavTone;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        tone === "tool" ? "hover:bg-muted" : "hover:bg-gold-soft/40",
        className,
      )}
    >
      {children}
    </Link>
  );
}
