/**
 * بازنشانی کامل دیتابیس محیط توسعه.
 *
 * فایل دیتابیس را حذف می‌کند، مایگریشن‌ها را اعمال می‌کند و داده اولیه را می‌ریزد.
 * در production عمداً مسدود است.
 *
 * اجرا: npm run db:reset
 */

import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadEnv } from "dotenv";

import { resolveFileDatabaseUrl } from "@/shared/config/database-url";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

if (process.env.NODE_ENV === "production") {
  console.error("بازنشانی دیتابیس در محیط production مجاز نیست.");
  process.exit(1);
}

const databaseUrl = resolveFileDatabaseUrl(process.env.DATABASE_URL ?? "file:./data/haft.db");

if (!databaseUrl.startsWith("file:")) {
  console.error("بازنشانی فقط برای دیتابیس فایلی محلی پشتیبانی می‌شود.");
  process.exit(1);
}

const filePath = resolve(databaseUrl.slice("file:".length));

for (const suffix of ["", "-wal", "-shm", "-journal"]) {
  const candidate = `${filePath}${suffix}`;
  if (existsSync(candidate)) {
    unlinkSync(candidate);
    console.log(`حذف شد: ${candidate}`);
  }
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

execFileSync(npmCommand, ["run", "db:migrate"], { stdio: "inherit" });
execFileSync(npmCommand, ["run", "db:seed"], { stdio: "inherit" });

console.log("دیتابیس بازنشانی شد.");
