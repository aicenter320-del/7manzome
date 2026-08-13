# ماژول: قیمت‌گذاری (`pricing`)

**وضعیت:** ✅ کامل

## مسئولیت

نگهداری قیمت مرجع طلا و محاسبه شفاف قیمت نهایی محصول.

## API عمومی

```ts
export { getCurrentGoldPrice, listGoldPriceHistory } from "./service/gold-price.service";
export { setManualGoldPrice, refreshExternalGoldPrice } from "./actions/...";
export { calculateVariantPrice, rialToGoldMg, goldMgToRial } from "./domain/pricing-engine";
export type { GoldPrice, PriceBreakdown, PricingParams } from "./domain/types";
```

## جدول‌های دیتابیس

`gold_prices` (append-only)، و کلیدهای قیمت‌گذاری در `settings`.

## وابستگی‌ها

هیچ ماژول دیگری. این ماژول در پایین‌ترین سطح دامنه است.

## قوانین دامنه

- `gold_prices` append-only است. قیمت جاری = آخرین ردیف برای آن عیار.
- **قیمت هرگز hard-coded نمی‌شود.** همه پارامترها از گونه محصول یا `settings` می‌آیند.
- محاسبه فقط با عدد صحیح و از طریق `mulDiv`.
- مالیات بر ارزش افزوده روی **اجرت و سود** اعمال می‌شود، نه ارزش طلای خام.
- خروجی موتور قیمت همیشه یک `PriceBreakdown` کامل است، نه یک عدد.
  همان شیء هم به کاربر نشان داده می‌شود و هم در `order_items` ذخیره می‌گردد.
- اگر قیمت جاری طلا موجود نباشد، فروش باید **متوقف** شود، نه اینکه با مقدار پیش‌فرض ادامه یابد.
- سن قیمت به کاربر نمایش داده می‌شود («آخرین به‌روزرسانی: ۱۲:۳۴»). قیمت کهنه‌تر از
  حد تنظیم‌شده هشدار می‌دهد.

## آداپتور منبع قیمت

اینترفیس `GoldPriceProvider` با دو پیاده‌سازی:

| پیاده‌سازی | کاربرد |
| --- | --- |
| `ManualGoldPriceProvider` | ادمین قیمت را از پنل وارد می‌کند (پیش‌فرض MVP) |
| `ExternalGoldPriceProvider` | دریافت از سرویس بیرونی؛ اسکلت آماده، منبع تعیین‌نشده |

## مسیرها

- `app/admin/gold-price`

## نقاط باز

- منبع رسمی و قابل استناد قیمت اتحادیه: تصمیم‌گیری‌نشده.
