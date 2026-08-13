/**
 * نقطه ورود اسکیمای دیتابیس.
 *
 * drizzle.config.ts همین فایل را می‌خواند، پس هر جدول جدید باید از اینجا صادر شود
 * وگرنه در مایگریشن‌ها دیده نمی‌شود.
 */

export * from "./identity";
export * from "./media";
export * from "./children";
export * from "./pricing";
export * from "./catalog";
export * from "./treasury";
export * from "./gifting";
export * from "./orders";
export * from "./payments";
export * from "./notifications";
export * from "./content";
