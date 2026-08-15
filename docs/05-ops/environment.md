# متغیرهای محیطی

نمونه کامل در [`../../.env.example`](../../.env.example). فایل کاری محلی: `.env.local` (در گیت نیست).

اعتبارسنجی در `src/shared/config/env.ts` انجام می‌شود. اگر متغیر اجباری غایب باشد،
برنامه در همان لحظه بوت با پیام فارسی خطا می‌دهد — عمداً، تا خطای مبهم زمان اجرا نداشته باشیم.

## فهرست متغیرها

| متغیر | اجباری | پیش‌فرض | توضیح |
| --- | --- | --- | --- |
| `APP_URL` | خیر | `http://localhost:3000` | آدرس پایه؛ برای ساخت لینک هدیه و QR |
| `DATABASE_URL` | خیر | `file:./data/haft.db` | مسیر SQLite؛ پیشوند `file:` الزامی |
| `DATABASE_AUTH_TOKEN` | خیر | — | فقط برای دیتابیس ریموت (Turso) |
| `SESSION_SECRET` | **بله در production** | مقدار توسعه | کلید امضای سشن، حداقل ۳۲ کاراکتر |
| `STORAGE_DIR` | خیر | `./storage` | مسیر فایل‌های آپلودی |
| `SMS_PROVIDER` | خیر | `console` | `console` یا `kavenegar` |
| `KAVENEGAR_API_KEY` | مشروط | — | اگر `SMS_PROVIDER=kavenegar` |
| `KAVENEGAR_SENDER` | خیر | — | شماره فرستنده |
| `KAVENEGAR_OTP_TEMPLATE` | خیر | — | نام الگوی تاییدشده |
| `GOLD_PRICE_PROVIDER` | خیر | `external` (در تست `manual`) | `external` واکشی طلا دات آی‌آر؛ `manual` فقط قیمت دستی |
| `GOLD_PRICE_API_URL` | خیر | `https://www.tala.ir/ajax/price` | نشانی JSON قیمت زنده |
| `GOLD_PRICE_API_KEY` | خیر | — | کلید اختیاری سرویس قیمت |
| `ADMIN_BOOTSTRAP_PHONE` | خیر | `09120000000` | شماره اولین سوپرادمین در seed |
| `ALLOW_DEMO_SEED` | خیر | در توسعه `true`، در production `false` | اگر `true` باشد والدین و سفارش نمونه ریخته می‌شود. در سرور واقعی خاموش بماند |
| `DEV_EXPOSE_OTP` | خیر | `false` | نمایش کد یک‌بارمصرف در پاسخ؛ **هرگز در production** |

## تولید کلید سشن

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## هشدارهای امنیتی

- `.env.local` و `.env.production` هرگز کامیت نمی‌شوند (`.gitignore` این را پوشش می‌دهد).
- `DEV_EXPOSE_OTP=true` در production یعنی هر کسی می‌تواند به هر حسابی وارد شود.
- `STORAGE_DIR` باید **بیرون از `public/`** باشد؛ رسیدهای پرداخت داده حساس‌اند.
- تغییر `SESSION_SECRET` تمام سشن‌های فعال را باطل می‌کند.

## افزودن متغیر جدید

سه جا باید همزمان به‌روز شود:

1. اسکیمای Zod در `src/shared/config/env.ts`
2. فایل `.env.example`
3. جدول همین سند
