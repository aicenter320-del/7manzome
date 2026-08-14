# ماژول: قیمت‌گذاری (`pricing`)

**وضعیت:** ✅ کامل

## مسئولیت

نگهداری قیمت مرجع طلا و محاسبه شفاف قیمت نهایی محصول.

## API عمومی

```ts
export { getCurrentGoldPrice, tryGetCurrentGoldPrice, getAllCurrentGoldPrices } from "./service/gold-price.service";
export { setManualGoldPrice, refreshExternalGoldPrice } from "./actions/gold-price.actions";
export { calculateVariantPrice } from "./domain/pricing-engine";
export type { GoldPrice, GoldPriceView, PriceBreakdown, PricingParams } from "./domain/types";
```

## جدول‌های دیتابیس

`gold_prices` (append-only)، و کلیدهای قیمت‌گذاری در `settings`.

## وابستگی‌ها

`content` — خواندن تنظیمات سن قیمت و درصد افزوده روی قیمت زنده.

## قوانین دامنه

- قیمت جاری برای نمایش و فروش ابتدا از طلا دات آی‌آر خوانده می‌شود (کش ۶۰ ثانیه)،
  تومان به ریال تبدیل می‌گردد و درصد افزودهٔ تنظیمات (`pricing.live_markup_bp`) به آن اضافه می‌شود.
  ([ADR-0013](../06-decisions/0013-live-gold-price-tala.md))
- اگر واکشی شکست بخورد، آخرین ردیف دستی `gold_prices` استفاده می‌شود؛ حاشیه روی دستی نیست.
- `gold_prices` append-only است. هر تیک زنده آنجا نوشته نمی‌شود.
- **قیمت هرگز hard-coded نمی‌شود.** همه پارامترها از گونه محصول یا `settings` می‌آیند.
- محاسبه فقط با عدد صحیح و از طریق `mulDiv`.
- مالیات بر ارزش افزوده روی **اجرت و سود** اعمال می‌شود، نه ارزش طلای خام.
- خروجی موتور قیمت همیشه یک `PriceBreakdown` کامل است، نه یک عدد.
  همان شیء هم به کاربر نشان داده می‌شود و هم در `order_items` ذخیره می‌گردد.
- اگر نه قیمت زنده و نه قیمت دستی باشد، فروش باید **متوقف** شود.
- سن قیمت به کاربر نمایش داده می‌شود. قیمت دستی کهنه‌تر از حد تنظیم‌شده هشدار می‌دهد.

## آداپتور منبع قیمت

اینترفیس `GoldPriceProvider` با دو پیاده‌سازی:

| پیاده‌سازی | کاربرد |
| --- | --- |
| `ExternalGoldPriceProvider` | پیش‌فرض: طلا دات آی‌آر، کش یک دقیقه؛ حاشیه جدا از تنظیمات اعمال می‌شود |
| `ManualGoldPriceProvider` | فقط دیتابیس؛ برای تست و آفلاین (`GOLD_PRICE_PROVIDER=manual`) |

ورود دستی در پنل پشتیبان است، نه منبع اول.

## مسیرها

- `app/admin/gold-price`
- درصد افزوده روی داشبورد `/admin` و `/admin/settings`

## نقاط باز

- طلا دات آی‌آر منبع بازار است نه اعلامیهٔ رسمی اتحادیه.
