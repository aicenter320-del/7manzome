# قراردادهای کدنویسی

## زبان

- **کد** (نام متغیر، تابع، جدول، فایل): انگلیسی
- **کامنت‌ها**: فارسی
- **متن رابط کاربری**: فارسی
- **پیام خطای کاربر**: فارسی و قابل‌فهم برای غیرفنی
- **پیام لاگ سرور**: انگلیسی (برای جست‌وجوپذیری)
- **پیام کامیت**: فارسی

## کامنت‌نویسی

کامنت فقط برای چیزی که کد نمی‌تواند بگوید: محدودیت، دلیل تصمیم، خطر پنهان.

```ts
// ❌ بی‌ارزش
// مقدار را در متغیر می‌ریزیم
const total = a + b;

// ✅ ارزشمند
// جمع باید روی میلی‌گرم انجام شود نه گرم؛ گرد کردن زودهنگام
// در سفارش‌های چند قلمی تا چند ده هزار ریال خطا ایجاد می‌کند.
const totalMg = items.reduce((sum, item) => sum + item.weightMg, 0);
```

## TypeScript

- `any` ممنوع. اگر تایپ نامعلوم است از `unknown` استفاده کنید و باریکش کنید.
- خروجی توابع عمومی (صادرشده از `index.ts`) صریحاً تایپ می‌شود.
- به‌جای `enum` از union رشته‌ای استفاده کنید (با SQLite و Zod بهتر کار می‌کند):

```ts
export const ORDER_STATUSES = ["created", "paid", "processing"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

- `as` فقط وقتی که واقعاً می‌دانید چه می‌کنید. `as unknown as X` تقریباً همیشه یعنی طراحی اشتباه است.

## Server Components و Client Components

پیش‌فرض **Server Component** است. `"use client"` فقط وقتی که یکی از این‌ها لازم باشد:
state، effect، رویداد مرورگر، یا API مرورگر.

`"use client"` را تا جای ممکن **پایین درخت** ببرید. یک صفحه کامل نباید کلاینت شود چون یک دکمه interactive دارد.

## Server Actions

هیچ Server Action خامی نمی‌نویسیم. همه از `action-kit` ساخته می‌شوند تا احراز هویت، مجوز،
اعتبارسنجی و مدیریت خطا یکدست باشد:

```ts
export const createTreasure = createAction({
  schema: createTreasureSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    return treasureService.create(user.id, input);
  },
});
```

## اعتبارسنجی

هر ورودی که از بیرون می‌آید (فرم، پارامتر URL، وبهوک) با Zod اعتبارسنجی می‌شود.
پیام‌های خطای Zod فارسی نوشته می‌شوند:

```ts
z.string().min(1, "نام کودک الزامی است");
```

## دیتابیس

- هر تغییر اسکیما ← `npm run db:generate` ← فایل مایگریشن در گیت کامیت می‌شود.
- **فایل مایگریشن قدیمی هرگز ویرایش نمی‌شود.** اصلاح = مایگریشن جدید.
- عملیات چندجدولی حتماً داخل تراکنش.
- دسترسی به دیتابیس فقط از `repo/`.

## نام‌گذاری فایل

| نوع | الگو | مثال |
| --- | --- | --- |
| کامپوننت | `kebab-case.tsx` | `treasure-card.tsx` |
| منطق دامنه | `kebab-case.ts` | `gold-ledger.ts` |
| ریپازیتوری | `<name>.repo.ts` | `treasure.repo.ts` |
| سرویس | `<name>.service.ts` | `treasure.service.ts` |
| اکشن‌ها | `<name>.actions.ts` | `treasure.actions.ts` |
| اسکیمای Zod | `<name>.schema.ts` | `treasure.schema.ts` |
| تست | `<name>.test.ts` | `gold-ledger.test.ts` |

## ترتیب import

۱. کتابخانه‌های خارجی → ۲. `@/shared/*` → ۳. `@/server/*` → ۴. `@/modules/*` → ۵. مسیرهای نسبی.

## قوانین رابط کاربری

- هیچ رنگ hard-coded. فقط توکن‌های دیزاین (`bg-card`، `text-muted-foreground`، `bg-gold`).
- هیچ کلاس جهت‌دار فیزیکی. به‌جای `ml-2` بنویسید `ms-2`؛ به‌جای `text-left` بنویسید `text-start`.
- تمام اعداد قابل‌مشاهده کاربر با ارقام فارسی نمایش داده می‌شوند (`toPersianDigits`).
- شناسه‌ها و شماره‌های فنی (شماره پیگیری، کد رهگیری) داخل `.ltr-nums` قرار می‌گیرند.

## تست

- هر تابع در `domain/` که محاسبه مالی دارد، **باید** تست داشته باشد.
- تست‌ها کنار خود فایل قرار می‌گیرند: `money.ts` و `money.test.ts`.
- تست‌های مسیر کامل کاربر در `e2e/`.

## گیت

قالب پیام کامیت:

```
<نوع>(<حوزه>): <توضیح کوتاه فارسی>
```

انواع مجاز: `feat`، `fix`، `refactor`، `docs`، `test`، `chore`، `perf`، `style`.

مثال: `feat(treasury): افزودن محاسبه پیشرفت گنجینه`
