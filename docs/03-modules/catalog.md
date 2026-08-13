# ماژول: کاتالوگ (`catalog`)

**وضعیت:** ✅ کامل

## مسئولیت

محصولات، گونه‌ها، دسته‌بندی، مناسبت‌ها، جست‌وجو و فیلتر.

مسئول **نیست** برای: محاسبه قیمت (آن در `pricing` است).

## API عمومی

```ts
export { listProducts, getProductBySlug, listCategories, listOccasions } from "./service/catalog.service";
export { upsertProduct, upsertVariant, setProductStatus } from "./actions/...";
export { filterVariantsForAge, buildProductFilters } from "./domain/product-filter";
export { OccasionIcon, OccasionLabel } from "./ui/occasion-icon";
export { OccasionCard } from "./ui/occasion-card";
export type { ProductListItem, ProductDetail, ProductVariant, Occasion } from "./domain/types";
```

## جدول‌های دیتابیس

`products`، `product_variants`، `product_media`، `categories`، `occasions`، `product_occasions`، `media_files`

## وابستگی‌ها

`pricing` — برای محاسبه قیمت نمایشی هر گونه.
`children` — فقط لایه دامنه (`matchesAgeRange`) برای فیلتر مناسبت و محصول بر اساس سن.

## قوانین دامنه

- **مرور محصول دو محور دارد: دسته‌بندی و مناسبت.** محور مناسبت مهم‌تر است، چون کاربر
  نمی‌داند «چه طلایی بخرد» ولی می‌داند «برای تولد یک‌سالگی چیزی می‌خواهد».
- موجودی و قیمت روی **گونه** است نه محصول. محصول بدون گونه فعال، در سایت نمایش داده نمی‌شود.
- قیمت هرگز در جدول محصول ذخیره نمی‌شود؛ همیشه در زمان اجرا از موتور قیمت‌گذاری می‌آید.
- هر محصول باید حداقل یک تصویر داشته باشد تا وضعیتش `active` شود.
- محصول `archived` هرگز حذف نمی‌شود چون به سفارش‌های قدیمی وصل است.
- بخش «چرا این محصول؟» بخشی از داده محصول است، نه متن ثابت قالب.
- مناسبت در رابط کاربری با آیکون Lucide (`OccasionIcon`) نشان داده می‌شود، نه ایموجی.
  روی کارت‌ها (`OccasionCard`) آیکون واترمارک بزرگ و کم‌رنگ در انتهای پس‌زمینه است.
  ستون `emoji` فقط برای نگاشت سازگار با دادهٔ قدیمی می‌ماند.

## مسیرها

- `app/(site)/products` — فهرست با فیلتر
- `app/(site)/products/[slug]` — جزئیات با ریزمحاسبات شفاف قیمت
- `app/(site)/occasions` و `app/(site)/occasions/[slug]`
- `app/admin/products`

## نقاط باز

- جست‌وجوی متنی فارسی: در MVP جست‌وجوی ساده `LIKE`. اگر حجم زیاد شد، FTS5 سالایت.
