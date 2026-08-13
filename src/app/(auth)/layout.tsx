import type { ReactNode } from "react";
import Link from "next/link";

import { site } from "@/shared/config/site";
import { GoldGlow } from "@/shared/ui/gold-glow";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <GoldGlow />
      <Link href="/" className="relative mb-8 text-sm text-gold-deep hover:underline">
        بازگشت به {site.name}
      </Link>
      <div className="glass-strong relative w-full max-w-md rounded-[2rem] p-6 sm:p-8">{children}</div>
    </div>
  );
}
