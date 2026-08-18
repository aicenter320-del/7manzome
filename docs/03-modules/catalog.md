# ماژول: کاتالوگ (`catalog`)

**وضعیت:** ✅ کامل

## مسئولیت

محصولات، گونه‌ها، دسته‌بندی، مناسبت‌ها، جست‌وجو و فیلتر.

مسئول **نیست** برای: محاسبه قیمت (آن در `pricing` است).

## API عمومی

```ts
export { listProducts, getProductBySlug, getProductBySlugForStaff, getProductForAdmin, listCategories, listOccasions, listRelatedProducts } from "./service/catalog.service";
export { createProduct, updateProduct, setProductStatus, createVariant, updateVariant, attachProductOccasion, detachProductOccasion, uploadProductImage, deleteProductMedia, setProductHero, reorderProductMedia } from "./actions/...";
export { hoverFileId, orderedGallery, MAX_PRODUCT_IMAGES } from "./domain/product-gallery";
export { ProductCard, ProductGrid, ProductSlider, ProductGallery, ProductDetailHeading, ProductStory, ProductGalleryManager, ProductEditProvider, ProductEditBar, StorefrontAddProduct, CategoryExplorer, ProductFilterSheet } from "./ui/...";
export type { ProductListItem, ProductDetail, ProductVariant, Occasion, Category } from "./domain/types";
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
- گالری در `product_media` است (حداکثر ۸ تصویر). `hero_file_id` تصویر اصلی کارت است؛
  اولین تصویر متفاوت گالری هنگام hover روی کارت ویترین نشان داده می‌شود.
- محصول `archived` هرگز حذف نمی‌شود چون به سفارش‌های قدیمی وصل است.
- بخش «چرا این محصول؟» بخشی از داده محصول است، نه متن ثابت قالب.
- مناسبت در رابط کاربری با آیکون Lucide (`OccasionIcon`) نشان داده می‌شود، نه ایموجی.
  روی کارت‌ها (`OccasionCard`) آیکون واترمارک بزرگ و کم‌رنگ در انتهای پس‌زمینه است.
  ستون `emoji` فقط برای نگاشت سازگار با دادهٔ قدیمی می‌ماند.
- دسته‌بندی در رابط کاربری با آیکون Lucide (`CategoryIcon` / `CategoryCircle`) نشان داده می‌شود. نوار خانه (`CategoryExplorer`) دایره‌ها را افقی با peek اسلاید بعدی نشان می‌دهد.
- اسلایدر مناسبت خانه (`OccasionSlider`) کارت فعال را وسط می‌گذارد و کارت‌های کناری از دو طرف با سایه دیده می‌شوند. اسلایدر محصول peek از لبه است. اگر ردیف سرریز داشته باشد، زیر آن نوار طلایی با شست تناسبی طول محتواست؛ اگر همه در عرض جا شوند نوار مخفی است. موتور مشترک: `SnapSlideTrack`. سربرگ با `SectionHead` بیرون از اسلایدر است.
- مدیر با مجوز `catalog:write` می‌تواند روی همان صفحهٔ محصول ویترین، عنوان و عکس و گونه را کلیک‌به‌کلیک ویرایش کند؛ خریدار این کنترل‌ها را نمی‌بیند. پیش‌نویس فقط برای همین نقش دیده می‌شود. افزودن قطعه از `/products` است.

## مسیرها

- `app/(site)/products` — فهرست محصول؛ فیلتر دسته و مناسبت در شیت پایین (`ProductFilterSheet`)؛ دکمهٔ افزودن قطعه برای `catalog:write`
- `app/(site)/products/[slug]` — جزئیات با گالری، حکاکی زیر عکس، سبد بالا، ریزقیمت در آکوردئون؛ ویرایش درون‌ویترینی برای مدیر
- `app/(site)/occasions` و `app/(site)/occasions/[slug]`
- `app/admin/products` — فهرست همه وضعیت‌ها
- `app/admin/products/[productId]` — ویرایش مشخصات، مناسبت، گونه، گالری

## نقاط باز

- جست‌وجوی متنی فارسی: در MVP جست‌وجوی ساده `LIKE`. اگر حجم زیاد شد، FTS5 سالایت.
