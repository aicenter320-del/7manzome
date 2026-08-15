# ماژول: کودکان (`children`)

**وضعیت:** ✅ کامل

## مسئولیت

پروفایل کودک، رابطه سرپرستی بین کاربران و کودک، و تایم‌لاین رویدادهای زندگی کودک.

مسئول **نیست** برای: دارایی طلا (آن در `treasury` است).

## API عمومی

```ts
export { createChild, updateChild, archiveChild, addGuardian } from "./actions/...";
export { getChildrenForUser, getChildById } from "./service/child.service";
export { calculateAgeInMonths, formatChildAge, suggestOccasions } from "./domain/child-age";
export type { Child, Guardianship, GuardianRelation, AccessLevel } from "./domain/types";
```

## جدول‌های دیتابیس

`children`، `guardianships`، `child_timeline_events`

## وابستگی‌ها

`identity` — برای اعتبارسنجی کاربر سرپرست.

## قوانین دامنه

- `birth_date_at` اجباری است؛ کل موتور مناسبت و پیشنهاد هدیه به آن وابسته است.
- تاریخ تولد نمی‌تواند در آینده باشد و بیش از ۱۸ سال گذشته هم پذیرفته نمی‌شود
  (پروفایل برای کودک است).
- سن همیشه بر حسب **ماه** محاسبه و ذخیره‌نشده نگه داشته می‌شود، و فقط برای نمایش
  به «۳ سال و ۴ ماه» تبدیل می‌شود.
- تصویر کودک داده حساس است؛ فایل آن `private` و از مسیر کنترل‌شده سرو می‌شود.
- کودک هرگز فیزیکی حذف نمی‌شود؛ فقط `archived_at` پر می‌شود چون رکوردهای مالی به آن وصل‌اند.
- ادمین از صفحهٔ کاربر می‌تواند پروفایل کودک را ویرایش یا بایگانی کند.

## مسیرها

- `app/(dashboard)/dashboard/children`
- `app/(dashboard)/dashboard/children/[childId]`
- `app/admin/users/[userId]` — تب کودکان
- `app/admin/children` — فهرست عملیاتی (نام کوچک، سن، دارنده، تعداد گنجینه)

## نقاط باز

- دعوت سرپرست دوم (مثلاً پدر) با لینک؛ در MVP فقط دارنده حساب می‌تواند مدیریت کند.
