# استقرار

## پیش‌نیازها

- Node.js نسخه ۲۰.۹ یا بالاتر (توسعه با ۲۴ LTS انجام شده)
- یک سرور لینوکسی با دسترسی SSH
- دامنه با گواهی TLS (پیشنهاد: Nginx به‌عنوان reverse proxy)

## گام‌های استقرار

```bash
# ۱. دریافت کد
git clone <repo> && cd haftmanzoome

# ۲. نصب وابستگی‌ها فقط برای production
npm ci

# ۳. ساخت فایل محیط
cp .env.example .env.production
# مقادیر واقعی را وارد کنید. SESSION_SECRET را حتماً تازه تولید کنید.

# ۴. ساخت پوشه‌های داده با دسترسی نوشتن
mkdir -p data storage backups

# ۵. اعمال مایگریشن‌ها
npm run db:migrate

# ۶. داده اولیه (فقط بار اول)
npm run db:seed

# ۷. بیلد و اجرا
npm run build
npm run start
```

## چک‌لیست قبل از انتشار

- [ ] `SESSION_SECRET` مقدار تازه و تصادفی دارد
- [ ] `DEV_EXPOSE_OTP` حذف شده یا `false` است
- [ ] `SMS_PROVIDER=kavenegar` با کلید معتبر
- [ ] `APP_URL` روی دامنه واقعی با `https`
- [ ] شماره کارت‌های مقصد در پنل ادمین وارد شده
- [ ] قیمت طلا وارد شده (بدون آن فروش متوقف است)
- [ ] `STORAGE_DIR` بیرون از پوشه وب و غیرقابل دسترسی مستقیم
- [ ] بکاپ روزانه روی cron فعال است
- [ ] `npm run verify` روی همان کامیت موفق است

## اجرا با systemd

```ini
[Unit]
Description=Haft Manzumeh
After=network.target

[Service]
Type=simple
User=haft
WorkingDirectory=/srv/haftmanzoome
EnvironmentFile=/srv/haftmanzoome/.env.production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## نکات Nginx

- حداکثر حجم بدنه درخواست را برای آپلود رسید افزایش دهید: `client_max_body_size 10m;`
- هدر `X-Forwarded-Proto` و `X-Forwarded-For` را پاس بدهید.
- پوشه‌های `data/`، `storage/` و `backups/` **هرگز** مستقیم سرو نشوند.

## استقرار با Docker

`Dockerfile` و `docker-compose.yml` در ریشه پروژه هستند.
پوشه‌های `data` و `storage` باید به‌صورت volume ماندگار mount شوند، وگرنه با هر
بازسازی کانتینر دیتابیس و فایل‌های کاربران از دست می‌روند.

بیلد Docker یک `SESSION_SECRET` ساختگی دارد چون `.env*` وارد ایمیج نمی‌شود.
مقدار واقعی باید در runtime از `env_file` یا secrets برسد؛ بدون آن سشن production بالا نمی‌آید.

## یکپارچه‌سازی مداوم

روی هر push به `main` و هر pull request، گردش‌کار
[`.github/workflows/verify.yml`](../../.github/workflows/verify.yml) این‌ها را اجرا می‌کند:
تایپ‌چک، لینت، بررسی معماری، تست دامنه، بیلد production و Playwright.

## بازگشت به نسخه قبل

۱. سرویس را متوقف کنید.
۲. دیتابیس را از آخرین بکاپ سالم بازگردانید.
۳. به کامیت قبلی برگردید، `npm ci && npm run build`.
۴. سرویس را بالا بیاورید.

> اگر مایگریشنی اجرا شده که در نسخه قبلی وجود ندارد، بازگشت **فقط** با بازگردانی
> بکاپ دیتابیس ممکن است. به همین دلیل قبل از هر استقرار، بکاپ بگیرید.
