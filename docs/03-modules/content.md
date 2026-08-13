# ماژول: محتوا (`content`)

**وضعیت:** ✅ کامل

## مسئولیت

صفحات محتوایی ایستا، پرسش‌های متداول و تنظیمات متنی سایت.

## API عمومی

```ts
export { getPageBySlug, listFaqs, getSetting, getSettings } from "./service/content.service";
export { upsertPage, upsertFaq } from "./actions/...";
export type { ContentPage, Faq } from "./domain/types";
```

## جدول‌های دیتابیس

`content_pages`، `faqs`، `settings`

## قوانین دامنه

- `settings` جدول کلید/مقدار است و مقادیر با Zod اعتبارسنجی می‌شوند.
  **هیچ‌جا `JSON.parse` بدون اعتبارسنجی انجام نمی‌شود.**
- کلیدهای تنظیمات در یک فایل متمرکز با تایپ مشخص تعریف می‌شوند تا کلید اشتباه
  در زمان کامپایل کشف شود، نه در زمان اجرا.
- محتوای Markdown پیش از رندر پاک‌سازی می‌شود.
- تنظیمات با کش کوتاه خوانده می‌شوند تا هر درخواست به دیتابیس نزند.

## کلیدهای مهم تنظیمات

| کلید | توضیح |
| --- | --- |
| `pricing.vat_bp` | نرخ مالیات بر ارزش افزوده (صدم درصد) |
| `pricing.default_profit_bp` | درصد پیش‌فرض سود |
| `pricing.max_price_age_minutes` | حداکثر عمر مجاز قیمت طلا |
| `payment.card_transfer_deadline_hours` | مهلت پرداخت کارت‌به‌کارت |
| `gifting.min_contribution_rial` | حداقل مبلغ مشارکت |
| `gifting.suggested_amounts_rial` | مبالغ پیشنهادی پیش‌فرض |
| `shipping.flat_rate_rial` | هزینه ثابت ارسال |
| `treasury.milestones_mg` | آستانه‌های نقاط عطف |
