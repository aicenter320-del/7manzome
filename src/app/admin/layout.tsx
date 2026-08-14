import type { ReactNode } from "react";

import { AdminNavLink, adminNav } from "@/modules/admin";
import { requireStaff } from "@/server/auth/guards";
import { hasPermission, type Permission } from "@/server/auth/rbac";
import { AppNavLink, AppNavShell } from "@/shared/ui/app-nav-shell";

import { LogoutButton } from "../(site)/logout-button";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireStaff();

  const items = adminNav.filter((item) => {
    const permission = item.requiredPermission as Permission | null;
    return permission === null || hasPermission(user.roles, permission);
  });

  return (
    <div className="admin-shell">
      <AppNavShell
        tone="tool"
        brandHref="/admin"
        brandLabel="مدیریت"
        actions={<LogoutButton />}
        nav={
          <>
            {items.map((item) => (
              <AdminNavLink
                key={item.href}
                href={`/admin${item.href === "/" ? "" : item.href}`}
              >
                {item.label}
              </AdminNavLink>
            ))}
            <AppNavLink href="/" tone="tool">
              سایت
            </AppNavLink>
          </>
        }
      >
        {children}
      </AppNavShell>
    </div>
  );
}
