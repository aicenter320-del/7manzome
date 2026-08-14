# نمودار موجودیت‌ها

نمودار برای خوانایی به چند بخش تقسیم شده است.

## هسته: کاربر، کودک، گنجینه

```mermaid
erDiagram
    users ||--o{ user_roles : "دارد"
    staff_roles ||--o{ staff_role_grants : "سطح بخش"
    staff_roles ||--o{ user_roles : "slug"
    users ||--o{ sessions : "دارد"
    users ||--o{ children : "دارنده حساب"
    users ||--o{ guardianships : "سرپرست"
    children ||--o{ guardianships : "سرپرستان"
    children ||--o{ treasures : "گنجینه‌ها"
    children ||--o{ child_timeline_events : "رویدادها"
    treasures ||--o{ gold_ledger_entries : "قلم‌های دفتر کل"
    treasures ||--o{ treasure_goals : "اهداف"
    treasures ||--o{ treasure_milestones : "نقاط عطف"
    treasures ||--o{ gift_links : "لینک‌های هدیه"
    users ||--o{ treasures : "مالک دارایی"
```

## هدیه و مشارکت

```mermaid
erDiagram
    gift_links ||--o{ contributions : "مشارکت‌ها"
    treasures ||--o{ contributions : "مقصد"
    contributions ||--o| payments : "پرداخت"
    contributions ||--o| gold_ledger_entries : "پس از تایید"
    gift_cards }o--o| treasures : "متصل به"
    gift_cards }o--o| contributions : "استفاده‌شده در"
```

## کاتالوگ و قیمت

```mermaid
erDiagram
    categories ||--o{ products : "دسته"
    categories ||--o{ categories : "والد"
    products ||--o{ product_variants : "گونه‌ها"
    products ||--o{ product_media : "تصاویر"
    products }o--o{ occasions : "مناسبت‌ها"
    media_files ||--o{ product_media : "فایل"
    gold_prices }o--|| product_variants : "مبنای قیمت"
```

## سفارش و پرداخت

```mermaid
erDiagram
    users ||--o{ carts : "سبد"
    carts ||--o{ cart_items : "اقلام"
    product_variants ||--o{ cart_items : "گونه"
    users ||--o{ orders : "سفارش‌ها"
    orders ||--o{ order_items : "اقلام"
    orders ||--o{ order_status_history : "تاریخچه"
    orders ||--o| shipments : "مرسوله"
    orders ||--o{ payments : "پرداخت‌ها"
    payments ||--o{ card_transfer_receipts : "رسیدها"
    product_variants ||--o{ order_items : "گونه"
    personalizations ||--o| order_items : "شخصی‌سازی"
    media_files ||--o{ card_transfer_receipts : "تصویر رسید"
```

## مسیر بحرانی: از پول تا طلا

این مهم‌ترین جریان داده پروژه است.

```mermaid
flowchart TD
    A["مهمان روی لینک هدیه کلیک می‌کند"] --> B["رکورد contribution با وضعیت awaiting_payment"]
    B --> C["رکورد payment با provider = card_transfer"]
    C --> D["کاربر رسید را آپلود می‌کند"]
    D --> E["card_transfer_receipt ثبت می‌شود"]
    E --> F["ادمین در صف تایید بررسی می‌کند"]
    F -->|"تایید"| G["payment.status = confirmed"]
    F -->|"رد"| H["payment.status = rejected با ثبت دلیل"]
    G --> I["خواندن قیمت جاری طلا"]
    I --> J["تبدیل ریال به میلی‌گرم"]
    J --> K["درج قلم در gold_ledger_entries"]
    K --> L["contribution.status = confirmed"]
    L --> M["بررسی رسیدن به مایل‌استون"]
    M --> N["ارسال اعلان و پیامک"]
    H --> O["اطلاع به کاربر برای ارسال مجدد رسید"]
```

> توجه: مرحله «خواندن قیمت جاری طلا» عمداً **بعد از** تایید ادمین است، نه هنگام ثبت مشارکت.
> دلیل در [`domain-rules.md`](domain-rules.md) بند ۷ آمده است.
