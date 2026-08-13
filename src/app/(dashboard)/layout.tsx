import type { ReactNode } from "react";
import Link from "next/link";

import { countUnread } from "@/modules/notifications";
import { requireUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/rbac";
import { toPersianDigits } from "@/shared/lib/persian";

import { LogoutButton } from "../(site)/logout-button";

const DASHBOARD_NAV = [
  { href: "/dashboard", label: "خلاصه" },
  { href: "/dashboard/children", label: "کودکان" },
  { href: "/dashboard/treasures", label: "گنجینه‌ها" },
  { href: "/dashboard/orders", label: "سفارش‌ها" },
  { href: "/dashboard/profile", label: "پروفایل" },
  { href: "/dashboard/notifications", label: "اعلان‌ها" },
] as const;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/dashboard");
  const unread = await countUnread(user.id);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-border bg-card lg:w-64 lg:border-e lg:border-b-0">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <Link href="/" className="font-semibold text-treasure">
            هفت منظومه
          </Link>
          <LogoutButton />
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-4 lg:flex-col">
          {DASHBOARD_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
              {item.href === "/dashboard/notifications" && unread > 0 ? (
                <span className="ms-2 rounded-full bg-gold-soft px-1.5 text-xs text-gold-deep">
                  {toPersianDigits(unread)}
                </span>
              ) : null}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            بازگشت به سایت
          </Link>
          {isStaff(user.roles) ? (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              پنل مدیریت
            </Link>
          ) : null}
        </nav>
        <p className="hidden px-4 pb-4 text-xs text-muted-foreground lg:block">{user.displayName}</p>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
