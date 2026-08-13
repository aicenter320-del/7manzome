# ماژول: شخصی‌سازی (`personalization`)

**وضعیت:** ✅ کامل

## مسئولیت

داده‌های شخصی‌سازی محصول (نام فارسی و لاتین، تاریخ تولد، پیام، تصویر، نماد) و پیش‌نمایش.

## API عمومی

```ts
export { createPersonalization, updatePersonalization } from "./actions/...";
export { getPersonalizationById } from "./service/personalization.service";
export { validateEngravingText, estimateEngravingFit } from "./domain/engraving";
export type { Personalization, PersonalizationInput } from "./domain/types";
```

## جدول‌های دیتابیس

`personalizations`

## وابستگی‌ها

`catalog` — برای دانستن اینکه گونه محصول چه ظرفیتی برای حکاکی دارد.

## قوانین دامنه

- محدودیت طول حکاکی به گونه محصول بستگی دارد، نه یک عدد ثابت.
- نام فارسی و لاتین جدا ذخیره می‌شوند چون حکاکی هرکدام متفاوت است.
- متن حکاکی پاک‌سازی می‌شود: بدون کاراکتر کنترلی، بدون ایموجی، فقط حروف مجاز.
- تصویر کودک `private` است و فقط برای تولید استفاده می‌شود.
- شخصی‌سازی پس از ورود سفارش به وضعیت `personalization` **قابل تغییر نیست**.
- محصول شخصی‌سازی‌شده قابل مرجوع کردن نیست؛ این باید در UI صریح گفته شود.

## مسیرها

بخشی از صفحه محصول در `app/(site)/products/[slug]` و صف تولید در `app/admin/personalizations`.

## نقاط باز

- پیش‌نمایش تصویری واقعی روی محصول: در MVP پیش‌نمایش تایپوگرافیک است، نه رندر سه‌بعدی.
