/**
 * اعمال مایگریشن‌های Drizzle روی دیتابیس.
 *
 * از migrator رسمی libsql استفاده می‌کند تا جدول تاریخچه مایگریشن هم مدیریت شود.
 * اجرا: npm run db:migrate
 */

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { createClient } from "@libsql/client";
import { config as loadEnv } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import { resolveFileDatabaseUrl } from "@/shared/config/database-url";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const databaseUrl = resolveFileDatabaseUrl(process.env.DATABASE_URL ?? "file:./data/haft.db");

// اگر پوشه data وجود نداشته باشد، libsql خطای مبهم می‌دهد.
if (databaseUrl.startsWith("file:")) {
  mkdirSync(dirname(databaseUrl.slice("file:".length)), { recursive: true });
}

const client = createClient({
  url: databaseUrl,
  ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
});

const db = drizzle(client);

async function main(): Promise<void> {
  console.log(`اعمال مایگریشن‌ها روی ${databaseUrl}`);

  await client.executeMultiple(
    ["PRAGMA journal_mode = WAL;", "PRAGMA foreign_keys = ON;"].join("\n"),
  );

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("مایگریشن‌ها با موفقیت اعمال شدند.");
}

main()
  .catch((error: unknown) => {
    console.error("اعمال مایگریشن شکست خورد:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    client.close();
  });
