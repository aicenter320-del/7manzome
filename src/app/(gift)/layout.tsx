import Link from "next/link";
import type { ReactNode } from "react";

import { copy } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import { GoldGlow } from "@/shared/ui/gold-glow";

export default function GiftLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <GoldGlow className="h-[min(28rem,70vh)]" />
      <header className="relative px-4 py-4 text-center">
        <Link href="/" className="font-semibold text-treasure">
          {site.name}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{copy.gift.layoutKicker}</p>
      </header>
      <div className="relative mx-auto w-full max-w-xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
