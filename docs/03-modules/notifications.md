# ماژول: اعلان‌ها (`notifications`)

**وضعیت:** ✅ کامل

## مسئولیت

اعلان درون‌سیستمی و ارسال پیامک از طریق آداپتور قابل‌تعویض.

## API عمومی

```ts
export { notify, notifyAdmins } from "./service/notification.service";
export { sendSms, sendOtpSms } from "./service/sms.service";
export { markAsRead, markAllAsRead } from "./actions/...";
export { renderTemplate, SMS_TEMPLATES } from "./domain/templates";
export type { Notification, NotificationKind, SmsResult } from "./domain/types";
```

## جدول‌های دیتابیس

`notifications`، `sms_messages`

## وابستگی‌ها

هیچ ماژول دیگری. این ماژول باید در پایین‌ترین سطح بماند تا همه بتوانند از آن استفاده کنند
بدون ایجاد دور در گراف وابستگی.

## آداپتور پیامک

```ts
interface SmsProvider {
  readonly key: "console" | "kavenegar";
  send(input: { to: string; body: string; template?: string }): Promise<SmsResult>;
}
```

| پیاده‌سازی | کاربرد |
| --- | --- |
| `ConsoleSmsProvider` | محیط توسعه؛ متن پیام در ترمینال چاپ می‌شود |
| `KavenegarSmsProvider` | ارسال واقعی؛ با تنظیم `SMS_PROVIDER=kavenegar` فعال می‌شود |

## قوانین دامنه

- **هر پیامک ارسالی در `sms_messages` ثبت می‌شود**، حتی در حالت `console`.
  بدون این تاریخچه، عیب‌یابی شکایت «پیامک نرسید» غیرممکن است.
- شکست ارسال پیامک **نباید** عملیات اصلی را برگرداند. پیامک عملیات جانبی است:
  اگر پرداخت تایید شد ولی پیامک نرفت، پرداخت همچنان تایید است.
- متن پیامک از قالب ساخته می‌شود، نه رشته‌های پراکنده در کد.
- محدودیت نرخ برای پیامک کد یک‌بارمصرف در ماژول `identity` اعمال می‌شود.

## رویدادهایی که اعلان می‌سازند

| رویداد | به مشتری | به ادمین |
| --- | --- | --- |
| ثبت سفارش | ✔ | ✔ |
| تایید پرداخت | ✔ | — |
| رد پرداخت | ✔ | — |
| رسید جدید در صف تایید | — | ✔ |
| دریافت هدیه در گنجینه | ✔ (والد) | — |
| رسیدن به نقطه عطف | ✔ (والد) | — |
| ارسال مرسوله | ✔ | — |

## نقاط باز

- اعلان مرورگر (Web Push): فاز بعد.
- ایمیل: فعلاً لازم نیست؛ بازار ایران پیامک‌محور است.
