import Link from "next/link";
import type { ReactNode } from "react";

import { adminNav } from "@/modules/admin";
import { requireStaff } from "@/server/auth/guards";
import { hasPermission, type Permission } from "@/server/auth/rbac";

import { LogoutButton } from "../(site)/logout-button";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireStaff();

  const items = adminNav.filter((item) => {
    const permission = item.requiredPermission as Permission | null;
    return permission === null || hasPermission(user.roles, permission);
  });

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-border bg-card lg:w-64 lg:border-e lg:border-b-0">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <Link href="/admin" className="font-semibold text-treasure">
            مدیریت
          </Link>
          <LogoutButton />
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-4 lg:flex-col">
          {items.map((item) => (
            <Link
              key={item.href}
              href={`/admin${item.href === "/" ? "" : item.href}`}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            سایت
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
