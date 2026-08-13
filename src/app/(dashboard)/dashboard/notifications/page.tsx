import Link from "next/link";

import { listNotifications } from "@/modules/notifications";
import { requireUser } from "@/server/auth/guards";
import { formatJalaliDateTime } from "@/shared/lib/jalali";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

import { MarkAllReadButton, MarkNotificationReadButton } from "./mark-read-buttons";

export default async function NotificationsPage() {
  const user = await requireUser("/dashboard/notifications");
  const items = await listNotifications(user.id, { limit: 50 });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="اعلان‌ها"
        actions={items.some((item) => item.readAt === null) ? <MarkAllReadButton /> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState title="اعلانی ندارید" description="وقتی رویدادی برای حسابتان رخ دهد اینجا می‌آید." />
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className={item.readAt ? "font-medium" : "font-semibold"}>{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatJalaliDateTime(item.createdAt)}
                </p>
                {item.link ? (
                  <Link href={item.link} className="mt-2 inline-block text-sm text-gold-deep">
                    مشاهده
                  </Link>
                ) : null}
              </div>
              {item.readAt === null ? <MarkNotificationReadButton notificationId={item.id} /> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
