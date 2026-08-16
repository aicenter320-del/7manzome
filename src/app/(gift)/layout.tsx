import Link from "next/link";
import type { ReactNode } from "react";

import { copy } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import { GoldGlow } from "@/shared/ui/gold-glow";

/** مهمان تب فروشگاه نمی‌بیند؛ همان ستون اپ سفید روی کاغذ کرم. */
export default function GiftLayout({ children }: { children: ReactNode }) {
  return (
    <div className="customer-shell relative">
      <GoldGlow className="h-[min(28rem,70vh)]" />
      <header className="relative shrink-0 px-4 py-4 text-center">
        <Link href="/" className="font-semibold text-treasure">
          {site.name}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{copy.gift.layoutKicker}</p>
      </header>
      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-6">{children}</div>
    </div>
  );
}
