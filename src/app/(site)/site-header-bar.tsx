import Link from "next/link";

import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";

/** نوار بالای اپ مشتری: نام برند وسط؛ ورود مهمان در پایان. */
export function SiteHeaderBar({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="site-nav-bar shrink-0 pt-[env(safe-area-inset-top,0px)]">
      <div className="grid h-(--site-header-height) grid-cols-[1fr_auto_1fr] items-center px-4">
        <div />
        <Link
          href="/"
          aria-label={`${site.name}، صفحه اصلی`}
          className="text-base font-bold text-gold-200"
        >
          {site.name}
        </Link>
        <div className="flex items-center justify-end">
          {signedIn ? null : (
            <Button asChild variant="gold" size="sm" className="rounded-2xl">
              <Link href="/login">ورود</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
