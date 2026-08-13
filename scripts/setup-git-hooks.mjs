/**
 * نصب Git hooks پروژه بدون نیاز به وابستگی خارجی (husky و مشابه آن).
 *
 * با تنظیم core.hooksPath روی پوشه .githooks، هوک‌های نسخه‌شده در مخزن
 * برای همه اعضای تیم فعال می‌شوند. اگر پوشه .git وجود نداشته باشد
 * (مثلاً هنگام نصب در محیط CI یا داکر) بی‌صدا رد می‌شود.
 */

import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const gitDir = join(process.cwd(), ".git");
const hooksDir = join(process.cwd(), ".githooks");

if (!existsSync(gitDir) || !existsSync(hooksDir)) {
  process.exit(0);
}

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    stdio: "ignore",
  });

  // روی سیستم‌های یونیکسی هوک باید اجرایی باشد.
  if (process.platform !== "win32") {
    for (const file of readdirSync(hooksDir)) {
      chmodSync(join(hooksDir, file), 0o755);
    }
  }

  console.log("Git hooks فعال شد (core.hooksPath = .githooks)");
} catch {
  // نبودن گیت نباید نصب وابستگی‌ها را با شکست مواجه کند.
  process.exit(0);
}
