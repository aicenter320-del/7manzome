import type { NotificationKind } from "@/shared/types/enums";

/**
 * قالب‌های پیامک و اعلان.
 *
 * متن پیام‌ها از قالب ساخته می‌شود، نه رشته‌های پراکنده در کد. دلیل: وقتی
 * لحن یا محتوای پیام باید عوض شود، باید یک جا عوض شود.
 */

export const SMS_TEMPLATES = {
  otp: {
    key: "otp",
    render: (data: { code: string }) =>
      `کد ورود شما به هفت منظومه: ${data.code}\nاین کد را در اختیار کسی قرار ندهید.`,
  },

  orderPlaced: {
    key: "order_placed",
    render: (data: { orderNumber: string }) =>
      `سفارش ${data.orderNumber} در هفت منظومه ثبت شد. پس از تایید پرداخت، آماده‌سازی آغاز می‌شود.`,
  },

  paymentConfirmed: {
    key: "payment_confirmed",
    render: (data: { paymentNumber: string }) =>
      `پرداخت ${data.paymentNumber} تایید شد. از اعتماد شما به هفت منظومه سپاسگزاریم.`,
  },

  paymentRejected: {
    key: "payment_rejected",
    render: (data: { paymentNumber: string; reason: string }) =>
      `پرداخت ${data.paymentNumber} تایید نشد.\nعلت: ${data.reason}\nمی‌توانید رسید را دوباره ارسال کنید.`,
  },

  giftReceived: {
    key: "gift_received",
    render: (data: { childName: string; contributorName: string; goldText: string }) =>
      `${data.contributorName} ${data.goldText} طلا به گنجینه ${data.childName} اضافه کرد.`,
  },

  milestoneReached: {
    key: "milestone_reached",
    render: (data: { childName: string; milestoneTitle: string }) =>
      `گنجینه ${data.childName} به «${data.milestoneTitle}» رسید. برای دیدن جزئیات به حساب خود سر بزنید.`,
  },

  orderShipped: {
    key: "order_shipped",
    render: (data: { orderNumber: string; trackingCode?: string }) =>
      data.trackingCode
        ? `سفارش ${data.orderNumber} ارسال شد.\nکد رهگیری: ${data.trackingCode}`
        : `سفارش ${data.orderNumber} ارسال شد.`,
  },

  newReceiptForReview: {
    key: "new_receipt_for_review",
    render: (data: { paymentNumber: string }) =>
      `رسید جدید برای پرداخت ${data.paymentNumber} در صف تایید قرار گرفت.`,
  },
} as const;

export type SmsTemplateKey = keyof typeof SMS_TEMPLATES;

/** عنوان و متن اعلان درون‌سیستمی برای هر رویداد. */
export const NOTIFICATION_TITLES: Record<NotificationKind, string> = {
  order_placed: "سفارش شما ثبت شد",
  payment_confirmed: "پرداخت شما تایید شد",
  payment_rejected: "پرداخت شما تایید نشد",
  payment_review_needed: "رسید جدید در صف تایید",
  gift_received: "هدیه جدید در گنجینه",
  milestone_reached: "نقطه عطف جدید",
  order_shipped: "سفارش شما ارسال شد",
  order_delivered: "سفارش شما تحویل شد",
  system: "اطلاع‌رسانی سیستم",
};
