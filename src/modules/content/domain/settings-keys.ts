import { z } from "zod";

/**
 * کلیدهای تنظیمات با اسکیمای اعتبارسنجی.
 *
 * چرا اینجا متمرکز شده: بدون این جدول، خواندن `settings` تبدیل می‌شود به
 * `JSON.parse` بی‌محافظ و کلید اشتباه فقط در زمان اجرا کشف می‌شود.
 * با این ساختار، کلید غلط خطای کامپایل می‌دهد.
 */

export const settingsSchemas = {
  /** نرخ مالیات بر ارزش افزوده بر حسب صدم درصد. ۱۰٪ = ۱۰۰۰ */
  "pricing.vat_bp": z.number().int().min(0).max(10_000),

  /** درصد پیش‌فرض سود فروشنده بر حسب صدم درصد. */
  "pricing.default_profit_bp": z.number().int().min(0).max(10_000),

  /** حداکثر عمر مجاز قیمت طلا به دقیقه؛ بیشتر از آن هشدار داده می‌شود. */
  "pricing.max_price_age_minutes": z.number().int().min(1).max(10_080),

  /** حاشیه روی قیمت زنده طلا؛ صدم‌درصد. ۲٪ = ۲۰۰. سقف ۲۰٪. */
  "pricing.live_markup_bp": z.number().int().min(0).max(2_000),

  /** مهلت پرداخت کارت‌به‌کارت به ساعت. */
  "payment.card_transfer_deadline_hours": z.number().int().min(1).max(720),

  /** حداقل مبلغ مشارکت در گنجینه به ریال. */
  "gifting.min_contribution_rial": z.number().int().min(0),

  /** مبالغ پیشنهادی پیش‌فرض صفحه هدیه به ریال. */
  "gifting.suggested_amounts_rial": z.array(z.number().int().positive()).min(1).max(6),

  /** حداکثر طول پیام یادگاری. */
  "gifting.max_keepsake_length": z.number().int().min(20).max(1_000),

  /** هزینه ثابت ارسال به ریال. */
  "shipping.flat_rate_rial": z.number().int().min(0),

  /** آستانه سفارش برای ارسال رایگان به ریال؛ صفر یعنی غیرفعال. */
  "shipping.free_threshold_rial": z.number().int().min(0),

  /** آستانه‌های نقطه عطف گنجینه به میلی‌گرم. */
  "treasury.milestones_mg": z.array(z.number().int().positive()).min(1),

  /** آیا فروشگاه باز است؛ برای توقف اضطراری فروش. */
  "shop.is_open": z.boolean(),

  /** پیام نمایش‌داده‌شده وقتی فروشگاه بسته است. */
  "shop.closed_message": z.string().max(300),
} as const;

export type SettingKey = keyof typeof settingsSchemas;
export type SettingValue<K extends SettingKey> = z.infer<(typeof settingsSchemas)[K]>;

/**
 * مقادیر پیش‌فرض.
 * اگر کلیدی در دیتابیس نبود، این مقدار استفاده می‌شود؛ پس سیستم بدون seed هم بالا می‌آید.
 */
export const settingsDefaults: { [K in SettingKey]: SettingValue<K> } = {
  "pricing.vat_bp": 1_000,
  "pricing.default_profit_bp": 700,
  "pricing.max_price_age_minutes": 720,
  "pricing.live_markup_bp": 200,
  "payment.card_transfer_deadline_hours": 72,
  "gifting.min_contribution_rial": 1_000_000,
  "gifting.suggested_amounts_rial": [5_000_000, 10_000_000, 20_000_000, 50_000_000],
  "gifting.max_keepsake_length": 300,
  "shipping.flat_rate_rial": 800_000,
  "shipping.free_threshold_rial": 100_000_000,
  "treasury.milestones_mg": [100, 500, 1_000, 3_000, 5_000, 10_000],
  "shop.is_open": true,
  "shop.closed_message": "فروشگاه به‌طور موقت بسته است. به‌زودی بازمی‌گردیم.",
};

/** توضیح فارسی هر کلید برای نمایش در پنل ادمین. */
export const settingsLabels: Record<SettingKey, string> = {
  "pricing.vat_bp": "نرخ مالیات بر ارزش افزوده (صدم درصد)",
  "pricing.default_profit_bp": "درصد پیش‌فرض سود (صدم درصد)",
  "pricing.max_price_age_minutes": "حداکثر عمر مجاز قیمت طلا (دقیقه)",
  "pricing.live_markup_bp": "درصد افزوده روی قیمت زنده طلا",
  "payment.card_transfer_deadline_hours": "مهلت پرداخت کارت‌به‌کارت (ساعت)",
  "gifting.min_contribution_rial": "حداقل مبلغ مشارکت (ریال)",
  "gifting.suggested_amounts_rial": "مبالغ پیشنهادی صفحه هدیه (ریال)",
  "gifting.max_keepsake_length": "حداکثر طول پیام یادگاری",
  "shipping.flat_rate_rial": "هزینه ثابت ارسال (ریال)",
  "shipping.free_threshold_rial": "آستانه ارسال رایگان (ریال)",
  "treasury.milestones_mg": "آستانه‌های نقطه عطف گنجینه (میلی‌گرم)",
  "shop.is_open": "فروشگاه باز است",
  "shop.closed_message": "پیام بسته بودن فروشگاه",
};

/**
 * اعتبارسنجی مقدار یک کلید.
 * اگر مقدار ذخیره‌شده خراب باشد، به پیش‌فرض برمی‌گردیم تا سایت از کار نیفتد.
 */
export function parseSetting<K extends SettingKey>(key: K, raw: unknown): SettingValue<K> {
  const result = settingsSchemas[key].safeParse(raw);
  return (result.success ? result.data : settingsDefaults[key]) as SettingValue<K>;
}

export const settingKeys = Object.keys(settingsSchemas) as SettingKey[];
