import type { ReactNode } from "react";

import { ADMIN_NAV_GROUPS, AdminNavLink, adminNav } from "@/modules/admin";
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

  const groups = ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: items.filter((item) => item.group === group.id),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="admin-shell">
      <AppNavShell
        tone="tool"
        brandHref="/admin"
        brandLabel="مدیریت"
        actions={<LogoutButton />}
        nav={
          <>
            {groups.map((group) => (
              <div key={group.id} className="grid gap-1">
                {group.id === "today" ? null : (
                  <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">{group.label}</p>
                )}
                {group.items.map((item) => (
                  <AdminNavLink
                    key={item.href}
                    href={`/admin${item.href === "/" ? "" : item.href}`}
                  >
                    {item.label}
                  </AdminNavLink>
                ))}
              </div>
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
