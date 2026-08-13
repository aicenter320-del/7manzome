import type { ReactNode } from "react";
import Link from "next/link";

import { site } from "@/shared/config/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 text-sm text-gold-deep hover:underline">
        بازگشت به {site.name}
      </Link>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xs">
        {children}
      </div>
    </div>
  );
}
