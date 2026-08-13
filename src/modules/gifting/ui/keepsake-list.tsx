import { MessageCircleHeartIcon } from "lucide-react";

import { EmptyState } from "@/shared/ui/empty-state";

import type { PublicKeepsake } from "../domain/types";

/** فهرست پیام‌های یادگاری تاییدشده برای صفحه عمومی هدیه. */
export function KeepsakeList({ keepsakes }: { keepsakes: PublicKeepsake[] }) {
  if (keepsakes.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircleHeartIcon />}
        title="هنوز پیام یادگاری ثبت نشده"
        description="اولین نفری باشید که برای این گنجینه پیام می‌گذارد."
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {keepsakes.map((item, index) => (
        <li
          key={`${item.contributorDisplayName}-${index}`}
          className="glass rounded-3xl p-4"
        >
          <p className="text-sm font-medium text-foreground">{item.contributorDisplayName}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.message}</p>
        </li>
      ))}
    </ul>
  );
}
