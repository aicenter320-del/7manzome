import "server-only";

import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import { env } from "@/shared/config/env";

import * as schema from "./schema";

/**
 * اتصال دیتابیس.
 *
 * چرا libsql و نه better-sqlite3: ماژول نیتیو نیست و بین ویندوز (توسعه) و
 * لینوکس (سرور) نیاز به rebuild ندارد. جزئیات در ADR-0003.
 */

export type Database = LibSQLDatabase<typeof schema>;

interface DatabaseHandle {
  client: Client;
  db: Database;
}

// در محیط توسعه، hot reload ماژول را چند بار ارزیابی می‌کند؛ بدون کش سراسری
// با هر تغییر فایل یک اتصال جدید باز می‌شود و به‌سرعت به سقف توصیف‌گر فایل می‌رسیم.
const globalForDb = globalThis as unknown as { __haftDb?: DatabaseHandle };

function createHandle(): DatabaseHandle {
  const client = createClient({
    url: env.DATABASE_URL,
    ...(env.DATABASE_AUTH_TOKEN ? { authToken: env.DATABASE_AUTH_TOKEN } : {}),
  });

  return { client, db: drizzle(client, { schema, casing: "snake_case" }) };
}

const handle = globalForDb.__haftDb ?? createHandle();

if (env.NODE_ENV !== "production") {
  globalForDb.__haftDb = handle;
}

export const db = handle.db;
export const dbClient = handle.client;
export { schema };

/**
 * تنظیمات اجباری اتصال.
 *
 * مهم‌ترینشان foreign_keys است: SQLite به‌طور پیش‌فرض کلید خارجی را اعمال
 * نمی‌کند و بدون این تنظیم، داده ناسازگار بی‌صدا ذخیره می‌شود.
 */
const PRAGMAS = [
  "PRAGMA journal_mode = WAL;",
  "PRAGMA foreign_keys = ON;",
  "PRAGMA busy_timeout = 5000;",
  "PRAGMA synchronous = NORMAL;",
].join("\n");

let pragmaPromise: Promise<void> | null = null;

/**
 * اعمال یک‌بارِ PRAGMAها. اسکریپت‌های عملیاتی باید آن را await کنند؛
 * در محیط وب هنگام بارگذاری ماژول آغاز می‌شود و پیش از اولین کوئری واقعی تمام است.
 */
export function ensurePragmas(): Promise<void> {
  pragmaPromise ??= handle.client
    .executeMultiple(PRAGMAS)
    .then(() => undefined)
    .catch((error: unknown) => {
      // اگر PRAGMA اعمال نشود، صحت داده در خطر است؛ خطا را پنهان نمی‌کنیم.
      console.error("[db] failed to apply connection pragmas", error);
      throw error;
    });

  return pragmaPromise;
}

void ensurePragmas();
