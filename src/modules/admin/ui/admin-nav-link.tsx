"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppNavLink } from "@/shared/ui/app-nav-shell";

export function AdminNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <AppNavLink
      href={href}
      tone="tool"
      className={
        active
          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          : undefined
      }
    >
      {children}
    </AppNavLink>
  );
}
