"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GemIcon, GiftIcon, HomeIcon, UserIcon } from "lucide-react";
import type { ReactNode } from "react";

import { customerTabs, isActiveHref } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";

const TAB_ICONS: Record<(typeof customerTabs)[number]["id"], ReactNode> = {
  home: <HomeIcon />,
  shop: <GemIcon />,
  gift: <GiftIcon />,
  account: <UserIcon />,
};

function tabHref(id: (typeof customerTabs)[number]["id"], href: string, signedIn: boolean) {
  if (id === "account") return signedIn ? "/dashboard" : "/login";
  return href;
}

function tabActive(pathname: string, id: (typeof customerTabs)[number]["id"], href: string) {
  if (id === "account") {
    return pathname.startsWith("/dashboard") || pathname.startsWith("/login");
  }
  return isActiveHref(pathname, href);
}

export function hidesCustomerTabBar(pathname: string) {
  return pathname.startsWith("/checkout") || pathname.startsWith("/pay");
}

export function customerTabClass(active: boolean) {
  return cn(
    "flex h-full min-h-11 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
    active ? "text-gold-deep" : "text-muted-foreground",
  );
}

/** نوار پایین اپ مشتری: آیکون و برچسب، زمینه سفید. */
export function AppTabBar({
  signedIn,
  endActions,
}: {
  signedIn: boolean;
  endActions?: ReactNode;
}) {
  const pathname = usePathname();
  const hideTabs = hidesCustomerTabBar(pathname);

  if (hideTabs && !endActions) return null;

  return (
    <nav
      aria-label="مسیرهای اصلی"
      className="app-tab-bar shrink-0 border-t border-border bg-card"
    >
      <ul
        className={cn(
          "grid h-(--app-tab-bar-height) min-w-0",
          hideTabs ? "grid-cols-2" : "grid-cols-6",
        )}
      >
        {hideTabs
          ? null
          : customerTabs.map((tab) => {
              const href = tabHref(tab.id, tab.href, signedIn);
              const active = tabActive(pathname, tab.id, href);
              return (
                <li key={tab.id}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={customerTabClass(active)}
                  >
                    <span className="[&_svg]:size-5" aria-hidden>
                      {TAB_ICONS[tab.id]}
                    </span>
                    {tab.title}
                  </Link>
                </li>
              );
            })}
        {endActions}
      </ul>
    </nav>
  );
}
