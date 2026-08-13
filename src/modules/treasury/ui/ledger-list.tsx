import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatMg } from "@/shared/lib/gold";
import { LEDGER_SOURCE_LABELS } from "@/shared/types/enums";
import { EmptyState } from "@/shared/ui/empty-state";
import { JalaliDate } from "@/shared/ui/jalali-date";
import { Money } from "@/shared/ui/money";

import type { LedgerEntry } from "../domain/types";

/**
 * فهرست قلم‌های دفتر کل.
 *
 * این صفحه پاسخ سؤال «چرا موجودی من این‌قدر است؟» است. هر قلم با منشأ،
 * زمان و قیمت لحظه ثبت نشان داده می‌شود؛ همان چیزی که اعتماد می‌سازد.
 */
export function LedgerList({
  entries,
  className,
}: {
  entries: readonly LedgerEntry[];
  className?: string;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="هنوز هیچ طلایی به این گنجینه اضافه نشده است"
        description="با خرید محصول یا دعوت خانواده از طریق لینک هدیه، اولین قدم را بردارید."
      />
    );
  }

  return (
    <ul className={cn("grid gap-2", className)}>
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5"
        >
          <span
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
              entry.direction === "in"
                ? "bg-success/12 text-success"
                : "bg-destructive/12 text-destructive",
            )}
            aria-hidden
          >
            {entry.direction === "in" ? (
              <ArrowDownLeftIcon className="size-4" />
            ) : (
              <ArrowUpRightIcon className="size-4" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="font-medium">
                {entry.direction === "in" ? "+" : "−"}
                {formatMg(entry.amountMg)}
              </p>
              <p className="text-xs text-muted-foreground">
                <JalaliDate at={entry.occurredAt} variant="date" />
              </p>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {LEDGER_SOURCE_LABELS[entry.source]}
              {entry.note ? ` — ${entry.note}` : ""}
            </p>

            <p className="mt-1 text-xs text-muted-foreground/80">
              ارزش در زمان ثبت: <Money rial={entry.valueRial} />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
