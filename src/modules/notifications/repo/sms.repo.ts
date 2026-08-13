import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { smsMessages } from "@/server/db/schema";
import type { SmsMessageRow } from "@/server/db/types";
import type { SmsProviderKey, SmsStatus } from "@/shared/types/enums";

export async function insertQueuedMessage(input: {
  phone: string;
  body: string;
  provider: SmsProviderKey;
  template?: string | null;
}): Promise<string | null> {
  const [row] = await db
    .insert(smsMessages)
    .values({
      phone: input.phone,
      template: input.template ?? null,
      body: input.body,
      provider: input.provider,
      status: "queued",
    })
    .returning({ id: smsMessages.id });

  return row?.id ?? null;
}

export async function updateMessageStatus(
  messageId: string,
  update: {
    status: SmsStatus;
    providerMessageId?: string | null;
    errorMessage?: string | null;
    sentAt?: number | null;
  },
): Promise<void> {
  await db
    .update(smsMessages)
    .set({
      status: update.status,
      providerMessageId: update.providerMessageId ?? null,
      errorMessage: update.errorMessage ?? null,
      sentAt: update.sentAt ?? null,
    })
    .where(eq(smsMessages.id, messageId));
}

export async function findRecentMessages(limit = 100): Promise<SmsMessageRow[]> {
  return db.select().from(smsMessages).orderBy(desc(smsMessages.createdAt)).limit(limit);
}

export async function findMessagesForPhone(
  phone: string,
  limit = 50,
): Promise<SmsMessageRow[]> {
  return db
    .select()
    .from(smsMessages)
    .where(eq(smsMessages.phone, phone))
    .orderBy(desc(smsMessages.createdAt))
    .limit(limit);
}
