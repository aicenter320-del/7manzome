/**
 * ماژول اعلان‌ها — API عمومی.
 *
 * مسئول: اعلان درون‌سیستمی و ارسال پیامک از طریق آداپتور قابل‌تعویض.
 * این ماژول عمداً به هیچ ماژول دیگری وابسته نیست تا همه بتوانند از آن
 * استفاده کنند بدون ایجاد دور در گراف وابستگی.
 *
 * مستندات: docs/03-modules/notifications.md
 */

export { SMS_TEMPLATES, NOTIFICATION_TITLES, type SmsTemplateKey } from "./domain/templates";
export type { SmsProvider, SmsResult, SmsSendInput } from "./domain/types";

export { sendSms, sendTemplatedSms, sendOtpSms } from "./service/sms.service";

export {
  notify,
  notifyRoles,
  listNotifications,
  countUnread,
  markRead,
  markAllRead,
} from "./service/notification.service";

export {
  markNotificationRead,
  markAllNotificationsRead,
} from "./actions/notification.actions";
