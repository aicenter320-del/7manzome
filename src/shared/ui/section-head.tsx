import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/shared/ui/button";

/** سربرگ بخش: kicker وسط‌چین با خط دو طرف؛ عنوان در شروع. */
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
  title?: ReactNode;
  description?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  const KickerTag = title ? "p" : "h2";

  return (
    <header className="grid gap-3">
      {kicker ? (
        <KickerTag
          id={title ? undefined : headingId}
          className="flex items-center gap-2 text-xs font-bold tracking-wide text-gold-deep"
        >
          <span className="h-px min-w-8 flex-1 bg-border" aria-hidden />
          <span className="shrink-0">{kicker}</span>
          <span className="h-px min-w-8 flex-1 bg-border" aria-hidden />
        </KickerTag>
      ) : null}
      {title ? (
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
      ) : null}
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
