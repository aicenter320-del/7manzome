# ماژول: مدیریت (`admin`)

**وضعیت:** ✅ کامل

## مسئولیت

داشبورد مدیریت، گزارش‌های تجمعی و ابزارهای عملیاتی.

مسئول **نیست** برای: منطق کسب‌وکار. هر عملیات ادمین باید سرویس ماژول صاحب آن را صدا بزند.
اگر منطقی فقط در پنل ادمین وجود دارد، جای آن اشتباه است.

جدول اختصاصی ندارد. اکشن‌های کاتالوگ، هویت و محتوا را تکرار نمی‌کند؛ صفحات پنل همان اکشن‌ها را از ماژول صاحب می‌گیرند.

## API عمومی

```ts
export type { DashboardStats, SalesReport, SalesReportRow, TreasuryReport } from "./domain/types";
export type { MediaFolder } from "./domain/media-access";
export { foldersForRoles, canDeleteMediaFolder } from "./domain/media-access";
export { getDashboardStats, getSalesReport, getTreasuryReport } from "./service/report.service";
export {
  reviewAndSettlePayment,
  expireStalePaymentsAction,
  softDeleteMediaFileAction,
} from "./actions/admin.actions";
export { StatCard } from "./ui/stat-card";
export { DataTable } from "./ui/data-table";
export { adminNav, type AdminNavItem } from "./ui/admin-nav";
```

## جدول‌های دیتابیس

مالک جدول اختصاصی نیست؛ از ماژول‌های دیگر می‌خواند و تنظیمات را از `content` می‌گیرد.

## وابستگی‌ها

`orders`، `payments`، `treasury`، `catalog`، `identity`، `pricing`، `gifting`، `children`، `content`، `notifications`، `personalization`

## قوانین دامنه

- هر مسیر ادمین با نقش محافظت می‌شود؛ بررسی دسترسی **هم در لایوت و هم در اکشن** انجام می‌شود.
  محافظت فقط در لایوت کافی نیست، چون Server Action مستقیم قابل فراخوانی است.
- هر عملیات حساس در `audit_logs` ثبت می‌شود.
- عدد «فروش امروز» بر مبنای پرداخت‌های **تاییدشده** است، نه سفارش‌های ثبت‌شده.
- گزارش‌ها روی epoch محاسبه می‌شوند و مرز روز بر اساس منطقه زمانی تهران تعیین می‌گردد.
- `reviewAndSettlePayment` پس از `applyReviewDecision` تسویه را صدا می‌زند. تسویه باید idempotent باشد تا اگر پرداخت تایید شد و تسویه شکست خورد، تکرار اکشن فقط تسویه را دوباره اجرا کند.

## داشبورد

فروش امروز، طلای فروخته‌شده (گرم)، تعداد سفارش‌ها، گنجینه‌های فعال، هدیه‌های امروز،
و صف تایید پرداخت.

## بخش‌های پنل

سفارش‌ها، پرداخت‌ها و صف تایید، کاربران، کودکان، گنجینه‌ها، محصولات و گونه‌ها،
کتابخانه فایل، دسته‌بندی و مناسبت‌ها، قیمت طلا، حساب‌های بانکی، لینک‌های هدیه،
کارت‌های هدیه، شخصی‌سازی‌ها، ارسال‌ها، پیامک‌ها، محتوا، گزارش‌ها، تنظیمات.

صفحات `app/admin` روی همین API و ناوبری مجوز‌محور ساخته شده‌اند.

## کتابخانه فایل

مسیر `/admin/files` رکوردهای `media_files` را نشان می‌دهد. بایت فایل روی دیسک است.
پوشه از پیشوند `storage_key` خوانده می‌شود و بر اساس نقش فیلتر می‌گردد:
محصول (`catalog:read`)، کودک (`child:read`)، رسید (`payment:read`).
حذف نرم است؛ رسید را فقط نقش با `payment:review` و عکس کودک را فقط مدیر ارشد
می‌تواند حذف کند. آپلود از همین صفحه نیست؛ از فرم محصول، کودک یا پرداخت است.

## نقاط باز

- خروجی Excel گزارش‌ها: فاز بعد.
