import { isAbsolute, resolve } from "node:path";

/**
 * آدرس `file:` را به مسیر مطلق تبدیل می‌کند تا migrate، seed و خود برنامه
 * همیشه یک فایل SQLite را ببینند؛ مسیر نسبی به cwd وابسته است و با عوض شدن
 * پوشهٔ اجرا به دیتابیس خالی جدید می‌رسد.
 */
export function resolveFileDatabaseUrl(url: string): string {
  if (!url.startsWith("file:")) return url;

  let filePath = url.slice("file:".length);
  if (filePath.startsWith("//")) {
    const afterHost = filePath.indexOf("/", 2);
    filePath = afterHost === -1 ? filePath.slice(2) : filePath.slice(afterHost);
  }

  if (!isAbsolute(filePath)) {
    filePath = resolve(filePath);
  }

  return `file:${filePath.replaceAll("\\", "/")}`;
}

export function filePathFromDatabaseUrl(url: string): string | null {
  if (!url.startsWith("file:")) return null;
  return resolveFileDatabaseUrl(url).slice("file:".length);
}
