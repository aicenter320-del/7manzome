# ماشین‌های حالت

هر گذار وضعیت فقط از طریق تابع مخصوص خودش در `domain/` انجام می‌شود.
**هیچ‌جا `UPDATE ... SET status = ?` مستقیم نوشته نمی‌شود.**
هر گذار در جدول تاریخچه ثبت می‌گردد.

## سفارش

```mermaid
stateDiagram-v2
    [*] --> created: ثبت سفارش
    created --> payment_pending: انتخاب روش پرداخت
    payment_pending --> paid: تایید پرداخت
    payment_pending --> cancelled: انصراف یا انقضای مهلت
    paid --> processing: شروع آماده‌سازی
    processing --> paid: اصلاح اشتباه
    processing --> personalization: اگر محصول شخصی‌سازی دارد
    processing --> quality_check: اگر شخصی‌سازی ندارد
    personalization --> processing: اصلاح اشتباه
    personalization --> quality_check: پایان حکاکی
    quality_check --> packed: تایید کیفیت
    quality_check --> processing: نیاز به اصلاح
    quality_check --> personalization: اصلاح حکاکی
    packed --> shipped: تحویل به پست
    packed --> quality_check: اصلاح اشتباه
    shipped --> delivered: تحویل به مشتری
    shipped --> packed: اصلاح اشتباه
    delivered --> shipped: اصلاح اشتباه
    paid --> refund_pending: درخواست بازگشت وجه
    processing --> refund_pending: درخواست بازگشت وجه
    refund_pending --> refunded: تسویه
    cancelled --> [*]
    refunded --> [*]
```

گذارهای مجاز به‌صورت داده در `modules/orders/domain/order-status.ts` تعریف می‌شوند
تا هم قابل تست باشند و هم در UI برای ساخت دکمه‌های مجاز استفاده شوند.

کارمند می‌تواند در مسیر آماده‌سازی تا پس از تحویل یک مرحله برگردد تا کلیک اشتباه
اصلاح شود. بازگشت به `payment_pending` مجاز نیست چون طلا وارد دفتر کل شده است.
از `cancelled` و `refunded` خروجی نیست. تغییر وضعیت در پنل با پاپ‌آپ تایید انجام می‌شود.

## پرداخت کارت‌به‌کارت

```mermaid
stateDiagram-v2
    [*] --> awaiting_transfer: ساخت پرداخت و نمایش شماره کارت
    awaiting_transfer --> receipt_submitted: آپلود رسید توسط کاربر
    awaiting_transfer --> expired: پایان مهلت
    receipt_submitted --> under_review: ورود به صف تایید
    under_review --> confirmed: تطبیق مبلغ و شماره پیگیری
    under_review --> rejected: عدم تطابق، با ثبت دلیل
    rejected --> receipt_submitted: ارسال مجدد رسید
    expired --> [*]
    confirmed --> [*]
```

قوانین:

- `reference_number` در کل سیستم یکتاست تا یک رسید دو بار پذیرفته نشود.
- مبلغ اعلامی کاربر باید با مبلغ پرداخت بخواند؛ اختلاف در صف تایید هشدار می‌دهد.
- مهلت پیش‌فرض پرداخت ۷۲ ساعت است (قابل تنظیم).
- تایید و رد، هر دو در `audit_logs` ثبت می‌شوند.
- طلا **فقط** در گذار به `confirmed` وارد دفتر کل می‌شود.

## مشارکت در گنجینه

```mermaid
stateDiagram-v2
    [*] --> draft: مهمان فرم را باز می‌کند
    draft --> awaiting_payment: انتخاب مبلغ و ثبت
    awaiting_payment --> confirmed: پرداخت تایید شد
    awaiting_payment --> cancelled: انصراف یا انقضا
    awaiting_payment --> rejected: پرداخت رد شد
    rejected --> awaiting_payment: تلاش مجدد
    confirmed --> [*]
```

## گنجینه

```mermaid
stateDiagram-v2
    [*] --> active: ساخت گنجینه
    active --> closed: هدف محقق شد یا والد بست
    closed --> active: بازگشایی توسط والد
    active --> archived: بایگانی
    closed --> archived: بایگانی
    archived --> [*]
```

گنجینه `archived` فقط خواندنی است؛ هیچ قلم جدیدی به دفتر کل آن اضافه نمی‌شود.

## لینک هدیه

```mermaid
stateDiagram-v2
    [*] --> active: ساخت لینک
    active --> paused: توقف موقت توسط والد
    paused --> active: ازسرگیری
    active --> expired: رسیدن به تاریخ انقضا
    active --> closed: بستن دستی
    expired --> [*]
    closed --> [*]
```

لینک غیرفعال همچنان قابل مشاهده است اما دکمه پرداخت ندارد و پیام مناسب نشان می‌دهد.

## احراز هویت کامل

```mermaid
stateDiagram-v2
    [*] --> none: ثبت‌نام
    none --> pending: ارسال کد ملی و تاریخ تولد
    none --> verified: تایید دستی ادمین
    pending --> verified: تایید
    pending --> rejected: عدم تطابق
    rejected --> pending: ارسال مجدد
    rejected --> verified: تایید دستی ادمین
    verified --> none: لغو دستی ادمین
```

توجه: `none` مانع ورود یا خرید عادی نیست. فقط عملیات مالی خاص به `verified` نیاز دارند.
ادمین می‌تواند از فهرست یا صفحه کاربر احراز هویت را دستی تایید کند (مراجعه حضوری)، درخواست در صف را تایید/رد کند، یا احراز هویت تاییدشده را با پاپ‌آپ به `none` برگرداند. کد ملی پاک نمی‌شود.
