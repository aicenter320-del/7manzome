import type { ReactNode } from "react";
import Link from "next/link";

import { mainNav, site } from "@/shared/config/site";
import { currentJalaliYear } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";

import { SiteHeader } from "./site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const year = toPersianDigits(currentJalaliYear());

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
          <div className="grid gap-2">
            <p className="font-semibold text-treasure">{site.name}</p>
            <p className="text-sm text-muted-foreground">{site.tagline}</p>
            <p className="text-sm text-muted-foreground">پشتیبانی: {site.supportPhone}</p>
          </div>

          <nav className="grid gap-2 text-sm">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground sm:text-end">
            © {year} {site.name}. همه حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </div>
  );
}
