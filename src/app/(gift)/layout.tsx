import Link from "next/link";
import type { ReactNode } from "react";

import { site } from "@/shared/config/site";

export default function GiftLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-card px-4 py-4 text-center">
        <Link href="/" className="font-semibold text-treasure">
          {site.name}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">صفحه هدیه عمومی</p>
      </header>
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
