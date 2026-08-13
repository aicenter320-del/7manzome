# ماژول: هدیه (`gifting`)

**وضعیت:** ✅ کامل

**این موتور رشد پروژه است.** کیفیت تجربه این ماژول تعیین‌کننده حلقه ویروسی است.

## مسئولیت

لینک هدیه، مشارکت مهمان‌ها، پیام یادگاری، و کارت هدیه فیزیکی با QR.

مسئول **نیست** برای: ثبت طلا در دفتر کل (آن در `treasury` است) و دریافت پول (آن در `payments` است).
صفحات مسیر `app/(gift)/g/[token]` روی API عمومی این ماژول ساخته شده‌اند.

## API عمومی

```ts
export { createGiftLinkAction, pauseGiftLinkAction, startContributionAction } from "./actions/gifting.actions";
export { getGiftLinkByToken, getGiftLinksForTreasure } from "./service/gifting.service";
export { confirmContribution, startContribution, getContributionsForTreasure } from "./service/contribution.service";
export { isGiftTokenFormat, validateContributionAmount, buildGiftUrl } from "./domain/gift-link";
export type { GiftLinkPublicView, Contribution, GiftLink, GiftCard } from "./domain/types";
export { ContributionForm, GiftProgress, KeepsakeList, GiftShareBar } from "./ui/...";
```

`confirmContribution` را **payments صدا نمی‌زند** تا دور وابستگی ساخته نشود.
تسویه پس از تایید پرداخت از سمت ادمین فراخوانی می‌شود.

توکن لینک در سرویس با `generateToken(16)` ساخته می‌شود، نه در domain.

## جدول‌های دیتابیس

`gift_links`، `contributions`، `gift_cards`

## وابستگی‌ها

- `treasury` — مقصد مشارکت و ثبت طلا
- `payments` — دریافت وجه مشارکت (`createPayment`)
- `pricing` — قیمت لحظه تایید برای تبدیل ریال به طلا
- `notifications` — اعلان و پیامک `giftReceived`
- `content` — حداقل مبلغ و مبالغ پیشنهادی
- `children` — نام کوچک و سن برای صفحه عمومی

## قوانین دامنه

- **صفحه هدیه باید بدون احراز هویت کار کند.** این یک الزام محصول است، نه یک ترجیح.
  هیچ‌جای مسیر هدیه‌دهنده نباید نیاز به ورود یا ساخت حساب باشد.
- `token` با تولیدکننده تصادفی امن ساخته می‌شود و حداقل ۱۶ کاراکتر است.
- صفحه عمومی هدیه فقط این‌ها را نشان می‌دهد: نام کوچک کودک، سن، پیشرفت گنجینه و پیام والد.
  **هرگز** شماره تلفن، نام خانوادگی، آدرس یا شناسه‌های داخلی نمایش داده نمی‌شود.
- حداقل مبلغ مشارکت در تنظیمات تعریف می‌شود (پیش‌فرض ۱۰۰ هزار تومان).
- پیام یادگاری قبل از نمایش پاک‌سازی می‌شود (بدون HTML، با محدودیت طول).
- مشارکت‌کننده ناشناس (`is_anonymous`) نامش به مهمان‌های دیگر نشان داده نمی‌شود
  اما برای دارنده حساب قابل مشاهده است.
- `gold_mg` مشارکت فقط پس از تایید پرداخت پر می‌شود، با قیمت لحظه تایید.

## مسیرها

- `app/(gift)/g/[token]` — صفحه عمومی هدیه (بدون ورود)
- `app/(gift)/g/[token]/pay` — ثبت رسید کارت‌به‌کارت
- `app/(gift)/g/[token]/thanks` — تشکر و ثبت پیام یادگاری
- `app/api/qr/[token]` — تولید تصویر QR برای کارت هدیه

## نقاط باز

- پیام ویدیویی برای کودک: فاز دوم.
- چاپ دسته‌ای کارت هدیه فیزیکی: در MVP فقط تولید کد و QR.
- صفحات مسیر عمومی هدیه هنوز وصل نشده‌اند.
