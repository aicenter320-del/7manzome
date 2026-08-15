# ماژول: گنجینه (`treasury`)

**وضعیت:** ✅ کامل

**این قلب محصول است.** حساس‌ترین ماژول از نظر صحت داده.

## مسئولیت

گنجینه کودک، دفتر کل طلا، محاسبه موجودی، اهداف، نقاط عطف، و پوشش طلای فروشگاه.

مسئول **نیست** برای: دریافت پول (آن در `payments` است) و لینک هدیه (آن در `gifting` است).
پوشش طلا بازخرید به کاربر نیست.

## API عمومی

```ts
export { createTreasure, setGoal, closeTreasure } from "./actions/...";
export { getTreasureSummary, getTreasuresForUser, getLedger } from "./service/treasure.service";
export { creditGold, debitGold } from "./service/gold-ledger.service";
export { computeBalance, computeProgress, detectMilestones } from "./domain/gold-ledger";
export type { TreasureSummary, LedgerEntry, GoldBalance } from "./domain/types";
```

## جدول‌های دیتابیس

`treasures`، `gold_ledger_entries`، `treasure_goals`، `treasure_milestones`، `gold_cover_entries`

## وابستگی‌ها

- `children` — گنجینه به کودک متصل است
- `pricing` — برای تبدیل ریال به میلی‌گرم طلا و ارزش‌گذاری روز

## قوانین دامنه

> این قوانین را قبل از هر تغییری در این ماژول بخوانید.

- **دفتر کل append-only است.** هیچ `UPDATE` یا `DELETE` روی `gold_ledger_entries` مجاز نیست.
- **موجودی هرگز ذخیره نمی‌شود**، همیشه از جمع قلم‌ها محاسبه می‌گردد.
- `amount_mg` همیشه مثبت است؛ جهت با `direction` مشخص می‌شود.
- هر قلم باید `reference_type` و `reference_id` داشته باشد. قلم بی‌منشأ ممنوع است.
- برای جمع‌زدن عیارهای مختلف از `pure_mg` استفاده می‌شود.
- اصلاح خطا = قلم جدید با `source = 'correction'`، نه دست‌کاری قلم قبلی.
- `debitGold` باید قبل از ثبت، کفایت موجودی را بررسی کند؛ موجودی منفی ممنوع است.
- درج قلم و به‌روزرسانی وضعیت مرتبط (مشارکت یا سفارش) در **یک تراکنش** انجام می‌شود.
- گنجینه `archived` قلم جدید نمی‌پذیرد.
- ادمین می‌تواند گنجینه را ببندد؛ حذف فیزیکی فقط وقتی دفتر کل و مشارکت خالی باشد.
- پوشش طلا جدول جدا و append-only است؛ با `adjustTreasureLedger` قاطی نمی‌شود.

## مسیرها

- `app/(dashboard)/dashboard/treasures`
- `app/(dashboard)/dashboard/treasures/[treasureId]`
- `app/(site)/treasures` — نمای عمومی (فقط گنجینه‌های با `visibility = link`)
- `app/admin/users/[userId]` — تب گنجینه‌های کاربر
- `app/admin/treasures` — فهرست عملیاتی، پوشش طلا و ثبت خرید
- `app/admin/treasures/[treasureId]` — مشارکت‌ها و لینک هدیه

## نقاط باز

- برداشت و تبدیل به طلای فیزیکی: خارج از دامنه MVP، اما `direction = 'out'`
  و `source = 'redemption'` از ابتدا در مدل داده پیش‌بینی شده است.
