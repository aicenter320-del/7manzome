/**
 * بکاپ دیتابیس SQLite.
 *
 * از VACUUM INTO استفاده می‌کند، نه کپی خام فایل. دلیل: در حالت WAL بخشی از
 * داده در فایل جانبی است و کپی خام می‌تواند ناقص باشد. VACUUM INTO یک نسخه
 * سالم و فشرده می‌سازد، حتی وقتی دیتابیس در حال استفاده است.
 *
 * اجرا: npm run db:backup
 */

import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { config as loadEnv } from "dotenv";

import { resolveFileDatabaseUrl } from "@/shared/config/database-url";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const databaseUrl = resolveFileDatabaseUrl(process.env.DATABASE_URL ?? "file:./data/haft.db");
const backupDir = resolve("backups");

/** تعداد نسخه‌هایی که نگه داشته می‌شود؛ قدیمی‌ترها حذف می‌شوند. */
const KEEP_COPIES = 14;

if (!databaseUrl.startsWith("file:")) {
  console.error("بکاپ فقط برای دیتابیس فایلی محلی پشتیبانی می‌شود.");
  process.exit(1);
}

mkdirSync(backupDir, { recursive: true });

function timestampLabel(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

const client = createClient({ url: databaseUrl });

async function main(): Promise<void> {
  const target = join(backupDir, `haft-${timestampLabel()}.db`);

  // مسیر باید با اسلش نوشته شود تا روی ویندوز هم برای SQLite قابل خواندن باشد.
  const sqlitePath = target.replaceAll("\\", "/");

  await client.execute(`VACUUM INTO '${sqlitePath}'`);

  const size = statSync(target).size;
  console.log(`بکاپ ساخته شد: ${target} (${(size / 1024 / 1024).toFixed(2)} مگابایت)`);

  const copies = readdirSync(backupDir)
    .filter((name) => name.startsWith("haft-") && name.endsWith(".db"))
    .sort()
    .reverse();

  for (const stale of copies.slice(KEEP_COPIES)) {
    unlinkSync(join(backupDir, stale));
    console.log(`نسخه قدیمی حذف شد: ${stale}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error("بکاپ شکست خورد:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    client.close();
  });
