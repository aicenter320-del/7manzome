import type { ReactNode } from "react";

import { countUnread } from "@/modules/notifications";
import { requireUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/rbac";
import { toPersianDigits } from "@/shared/lib/persian";
import { AppNavLink, AppNavShell } from "@/shared/ui/app-nav-shell";

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
    <AppNavShell
      brandHref="/"
      brandLabel="هفت منظومه"
      actions={<LogoutButton />}
      footer={
        <p className="hidden pt-4 text-xs text-muted-foreground lg:block">{user.displayName}</p>
      }
      nav={
        <>
          {DASHBOARD_NAV.map((item) => (
            <AppNavLink key={item.href} href={item.href}>
              {item.label}
              {item.href === "/dashboard/notifications" && unread > 0 ? (
                <span className="ms-2 rounded-full bg-gold-soft px-1.5 text-xs text-gold-deep">
                  {toPersianDigits(unread)}
                </span>
              ) : null}
            </AppNavLink>
          ))}
          <AppNavLink href="/">بازگشت به سایت</AppNavLink>
          {isStaff(user.roles) ? <AppNavLink href="/admin">پنل مدیریت</AppNavLink> : null}
        </>
      }
    >
      {children}
    </AppNavShell>
  );
}
