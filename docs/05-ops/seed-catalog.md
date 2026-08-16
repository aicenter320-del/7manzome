# کاتالوگ دادهٔ نمونه

منبع حقیقت فنی: [`scripts/seed/registry.ts`](../../scripts/seed/registry.ts).
اگر جدول جدیدی به اسکیما اضافه شود و اینجا یا در رجیستری نباشد، `npm run check:arch` شکست می‌خورد.

## رفتار اجرا

```bash
npm run db:seed       # فقط seed
npm run db:bootstrap  # مایگریشن + seed (استقرار و شروع کانتینر)
npm run db:reset      # فقط غیرproduction: حذف فایل، مایگریشن، seed
```

- اگر جدول `users` **خالی نباشد** هیچ ردیفی نوشته نمی‌شود. دادهٔ واقعی بازنویسی نمی‌شود.
- اگر پایگاه خالی باشد **دموی کامل** ریخته می‌شود: مدیران، مشتریان، کاتالوگ، گنجینه، سفارش، پرداخت، کارت هدیه، پوشش طلا، اعلان و حسابرسی.
- شروع کانتینر Docker: `db:bootstrap` سپس `start`. بیلد ایمیج دیتابیس نمونه نمی‌سازد.
- پوشهٔ `./data` باید روی سرور ماندگار بماند. بدون آن استارت بعدی دوباره دمو می‌سازد چون فایل خالی است.

ورود نمونه پس از seed: سوپرادمین `09120000000`، مالی `09120000001`، والد `09121111111`.

## چک‌لیست جدول جدید

1. اسکیما در `src/server/db/schema/` و مایگریشن
2. ردیف در `docs/02-domain/data-model.md` و `erd.md`
3. ردیف در [`scripts/seed/registry.ts`](../../scripts/seed/registry.ts): `seeded` یا `runtime_empty`
4. اگر `seeded` است، INSERT در seeder مربوطه
5. ردیف در جدول همین سند با نام جدول داخل \`backtick\`
6. `npm run verify`

## سیاست‌ها

| سیاست | معنی |
| --- | --- |
| `seeded` | seed باید حداقل یک ردیف بسازد |
| `runtime_empty` | عمداً خالی؛ نشست، رمز یک‌بارمصرف، محدودیت نرخ |

## هویت

| جدول | سیاست | seeder |
| --- | --- | --- |
| `users` | seeded | `db-seed.ts` / `seed/people.ts` |
| `user_roles` | seeded | `db-seed.ts` / `seed/people.ts` |
| `staff_roles` | seeded | `seed/staff-roles.ts` |
| `staff_role_grants` | seeded | `seed/staff-roles.ts` |
| `otp_codes` | runtime_empty | ورود واقعی کد می‌سازد |
| `sessions` | runtime_empty | فقط پس از ورود |
| `rate_limits` | runtime_empty | سطل محدودیت نرخ در زمان اجرا |
| `audit_logs` | seeded | `seed/ops.ts` |

## کودک و گنجینه

| جدول | سیاست | seeder |
| --- | --- | --- |
| `children` | seeded | `seed/people.ts` |
| `guardianships` | seeded | `seed/people.ts` |
| `child_timeline_events` | seeded | `seed/people.ts` |
| `treasures` | seeded | `seed/treasury.ts` |
| `gold_ledger_entries` | seeded | `seed/treasury.ts` / `seed/commerce.ts` |
| `treasure_goals` | seeded | `seed/treasury.ts` |
| `treasure_milestones` | seeded | `seed/treasury.ts` |
| `gold_cover_entries` | seeded | `seed/treasury.ts` |

## هدیه

| جدول | سیاست | seeder |
| --- | --- | --- |
| `gift_links` | seeded | `seed/treasury.ts` |
| `contributions` | seeded | `seed/treasury.ts` |
| `gift_cards` | seeded | `seed/content.ts` |

## کاتالوگ و قیمت

| جدول | سیاست | seeder |
| --- | --- | --- |
| `categories` | seeded | `seed/catalog.ts` |
| `occasions` | seeded | `seed/catalog.ts` |
| `products` | seeded | `seed/catalog.ts` |
| `product_variants` | seeded | `seed/catalog.ts` |
| `product_media` | seeded | `seed/catalog.ts` |
| `product_occasions` | seeded | `seed/catalog.ts` |
| `personalizations` | seeded | `seed/commerce.ts` |
| `media_files` | seeded | `seed/media.ts` |
| `gold_prices` | seeded | `db-seed.ts` |

## سفارش و پرداخت

| جدول | سیاست | seeder |
| --- | --- | --- |
| `carts` | seeded | `seed/commerce.ts` |
| `cart_items` | seeded | `seed/commerce.ts` |
| `orders` | seeded | `seed/commerce.ts` |
| `order_items` | seeded | `seed/commerce.ts` |
| `order_status_history` | seeded | `seed/commerce.ts` |
| `shipments` | seeded | `seed/commerce.ts` |
| `bank_accounts` | seeded | `db-seed.ts` |
| `payments` | seeded | `seed/commerce.ts` |
| `card_transfer_receipts` | seeded | `seed/commerce.ts` |

## پشتیبان

| جدول | سیاست | seeder |
| --- | --- | --- |
| `notifications` | seeded | `seed/content.ts` |
| `sms_messages` | seeded | `seed/ops.ts` |
| `settings` | seeded | `db-seed.ts` |
| `content_pages` | seeded | `seed/content.ts` |
| `faqs` | seeded | `seed/content.ts` |
