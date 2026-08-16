"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/persian";

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "خلاصه" },
  { href: "/dashboard/children", label: "کودکان" },
  { href: "/dashboard/treasures", label: "گنجینه‌ها" },
  { href: "/dashboard/orders", label: "سفارش‌ها" },
  { href: "/dashboard/profile", label: "پروفایل" },
  { href: "/dashboard/notifications", label: "اعلان‌ها" },
] as const;

function isDashActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSubnav({ unread }: { unread: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="بخش‌های حساب" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex w-max gap-2 pb-1">
        {DASHBOARD_NAV.map((item) => {
          const active = isDashActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-4 text-sm whitespace-nowrap",
                  active
                    ? "bg-gold-soft font-medium text-gold-deep"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item.label}
                {item.href === "/dashboard/notifications" && unread > 0 ? (
                  <span className="ms-1.5 text-xs">{toPersianDigits(unread)}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
