"use server";

import { z } from "zod";

import { createAction } from "@/server/actions/action-kit";
import { idSchema } from "@/shared/lib/validators";

import { markAllRead, markRead } from "../service/notification.service";

export const markNotificationRead = createAction({
  name: "notifications.markRead",
  schema: z.object({ notificationId: idSchema }),
  auth: "required",
  handler: async ({ input, user }) => {
    await markRead(user.id, input.notificationId);
    return { ok: true };
  },
});

export const markAllNotificationsRead = createAction({
  name: "notifications.markAllRead",
  schema: z.object({}),
  auth: "required",
  handler: async ({ user }) => {
    await markAllRead(user.id);
    return { ok: true };
  },
});
