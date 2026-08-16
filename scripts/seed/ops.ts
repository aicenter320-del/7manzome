import * as schema from "@/server/db/schema";

import type { SeedContext, SeedPeople } from "./types";

const DAY = 86_400_000;

/** پیامک و گزارش حسابرسی نمونه برای پنل ادمین. */
export async function seedOps(ctx: SeedContext, people: SeedPeople): Promise<void> {
  const demoParent = people.parents[0];
  const sentAt = ctx.now - 2 * DAY;

  await ctx.db.insert(schema.smsMessages).values([
    {
      phone: demoParent?.phone ?? "09121111111",
      template: "otp",
      body: "کد ورود هفت منظومه: ۱۲۳۴۵۶",
      provider: "console",
      providerMessageId: "seed-sms-otp-1",
      status: "sent",
      sentAt,
      createdAt: sentAt,
    },
    {
      phone: demoParent?.phone ?? "09121111111",
      template: "orderPlaced",
      body: "سفارش شما ثبت شد. پس از تایید پرداخت، آماده‌سازی آغاز می‌شود.",
      provider: "console",
      providerMessageId: "seed-sms-order-1",
      status: "sent",
      sentAt: ctx.now - DAY,
      createdAt: ctx.now - DAY,
    },
    {
      phone: "09120000001",
      template: "paymentReviewNeeded",
      body: "رسید کارت‌به‌کارت جدید در صف تایید است.",
      provider: "console",
      providerMessageId: "seed-sms-review-1",
      status: "queued",
      createdAt: ctx.now - 3_600_000,
    },
    {
      phone: "09121111119",
      template: "otp",
      body: "کد ورود هفت منظومه ارسال نشد.",
      provider: "console",
      status: "failed",
      errorMessage: "نمونه خطای ارسال برای پنل پیامک",
      createdAt: ctx.now - 4 * DAY,
    },
  ]);

  await ctx.db.insert(schema.auditLogs).values([
    {
      actorUserId: ctx.adminId,
      actorRole: "super_admin",
      action: "gold_price.set",
      entityType: "gold_price",
      entityId: null,
      summary: "ثبت قیمت اولیه طلا در داده نمونه",
      meta: { karat: 18, pricePerGramRial: ctx.goldPrice18 },
      createdAt: ctx.now - 20 * DAY,
    },
    {
      actorUserId: people.finance.id,
      actorRole: "finance",
      action: "payment.confirmed",
      entityType: "payment",
      entityId: null,
      summary: "تایید پرداخت نمونه در seed",
      meta: { source: "seed" },
      createdAt: ctx.now - 3 * DAY,
    },
    {
      actorUserId: ctx.adminId,
      actorRole: "super_admin",
      action: "role.granted",
      entityType: "user",
      entityId: people.finance.id,
      summary: "اعطای نقش مالی به نگار",
      createdAt: ctx.now - 40 * DAY,
    },
    {
      actorUserId: ctx.adminId,
      actorRole: "super_admin",
      action: "gold_cover.recorded",
      entityType: "gold_cover",
      entityId: null,
      summary: "ثبت خرید پوشش طلای بازار در داده نمونه",
      createdAt: ctx.now - 12 * DAY,
    },
  ]);
}
