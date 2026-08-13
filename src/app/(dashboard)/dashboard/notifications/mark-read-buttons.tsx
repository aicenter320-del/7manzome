"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/modules/notifications/actions/notification.actions";
import { Button } from "@/shared/ui/button";

export function MarkNotificationReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markNotificationRead({ notificationId });
          router.refresh();
        });
      }}
    >
      خواندم
    </Button>
  );
}

export function MarkAllReadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markAllNotificationsRead({});
          router.refresh();
        });
      }}
    >
      همه را خواندم
    </Button>
  );
}
