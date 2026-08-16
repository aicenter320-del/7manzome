import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/shared/ui/button";

/** سربرگ بخش: عنوان در شروع، دکمهٔ کپسولی «مشاهده همه» در پایان. */
export function SectionHead({
  headingId,
  kicker,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  headingId?: string;
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <header className="grid gap-3">
      {kicker ? (
        <p className="flex items-center gap-3 text-xs font-medium tracking-wide text-gold-deep">
          <span className="h-px w-8 shrink-0 bg-gold" aria-hidden />
          {kicker}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="min-w-0 text-xl font-semibold text-balance">
          {title}
        </h2>
        {actionHref && actionLabel ? (
          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </div>
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
