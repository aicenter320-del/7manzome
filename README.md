# هفت منظومه

طلافروشی آنلاین تخصصی کودکان، با گنجینه طلای فرزند.

مستندات کامل در [`docs/`](docs/README.md) است. نقطه شروع عامل‌های هوش مصنوعی: [`AGENTS.md`](AGENTS.md) و [`docs/CONTEXT.md`](docs/CONTEXT.md).

## پیش‌نیاز

- Node.js ۲۰.۹ یا بالاتر (توسعه با ۲۴ LTS)

## راه‌اندازی محلی

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

ورود ادمین: شماره `ADMIN_BOOTSTRAP_PHONE` (پیش‌فرض `09120000000`).
در توسعه با `SMS_PROVIDER=console` کد یک‌بارمصرف در ترمینال چاپ می‌شود؛ اگر `DEV_EXPOSE_OTP=true` باشد روی صفحه ورود هم دیده می‌شود.

```bash
npm run verify   # تایپ‌چک + لینت + معماری + تست دامنه
npm run test:e2e # مسیرهای حیاتی (بعد از npm run build)
npm run db:backup
```

## استقرار

راهنمای عملیاتی: [`docs/05-ops/deployment.md`](docs/05-ops/deployment.md).
Docker: `docker compose up --build`
