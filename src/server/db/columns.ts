import { nanoid } from "nanoid";
import { integer, text } from "drizzle-orm/sqlite-core";

/**
 * ستون‌های تکرارشونده و قراردادهای مشترک اسکیما.
 *
 * هدف: هیچ‌جا `id` یا `created_at` دستی تعریف نشود تا قراردادها یکدست بمانند.
 * قراردادها در docs/02-domain/data-model.md مستند شده‌اند.
 */

/** شناسه ۲۱ کاراکتری تولیدشده در سطح اپلیکیشن؛ امن برای نمایش در URL. */
export const primaryId = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => nanoid());

/** ارجاع به شناسه جدول دیگر. */
export const idRef = (name: string) => text(name);

/** زمان به‌صورت epoch میلی‌ثانیه UTC. هرگز رشته تاریخ ذخیره نمی‌کنیم. */
export const timestamp = (name: string) => integer(name);

/** شمارنده یا عدد صحیح بی‌واحد (تعداد، ترتیب، سن به ماه و مانند آن). */
export const counter = (name: string) => integer(name);

export const createdAt = () =>
  integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now());

export const updatedAt = () =>
  integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now());

/** مبلغ به ریال؛ همیشه عدد صحیح. هرگز اعشاری و هرگز تومان. */
export const rial = (name: string) => integer(name);

/** وزن طلا به میلی‌گرم؛ همیشه عدد صحیح. */
export const mg = (name: string) => integer(name);

/** درصد به صدم درصد (basis point): ۹٪ یعنی ۹۰۰. */
export const basisPoints = (name: string) => integer(name);

export const boolean = (name: string) => integer(name, { mode: "boolean" });

/** ستون JSON با تایپ مشخص؛ خواندنش باید با Zod اعتبارسنجی شود. */
export const jsonColumn = <T>(name: string) => text(name, { mode: "json" }).$type<T>();
