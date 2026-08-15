import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { filePathFromDatabaseUrl, resolveFileDatabaseUrl } from "./database-url";

describe("resolveFileDatabaseUrl", () => {
  it("مسیر نسبی file: را مطلق می‌کند", () => {
    const resolved = resolveFileDatabaseUrl("file:./data/haft.db");
    expect(resolved.startsWith("file:")).toBe(true);
    expect(resolved).toBe(`file:${resolve("./data/haft.db").replaceAll("\\", "/")}`);
  });

  it("مسیر مطلق را دست نمی‌زند", () => {
    expect(resolveFileDatabaseUrl("file:/app/data/haft.db")).toBe("file:/app/data/haft.db");
  });

  it("آدرس غیر فایلی را برمی‌گرداند", () => {
    expect(resolveFileDatabaseUrl("libsql://example.turso.io")).toBe("libsql://example.turso.io");
  });

  it("file:/// را به مسیر یونیکس تبدیل می‌کند", () => {
    expect(resolveFileDatabaseUrl("file:///app/data/haft.db")).toBe("file:/app/data/haft.db");
  });
});

describe("filePathFromDatabaseUrl", () => {
  it("برای آدرس غیر فایلی null برمی‌گرداند", () => {
    expect(filePathFromDatabaseUrl("libsql://example.turso.io")).toBeNull();
  });

  it("مسیر فایل را بدون پیشوند برمی‌گرداند", () => {
    expect(filePathFromDatabaseUrl("file:/app/data/haft.db")).toBe("/app/data/haft.db");
  });
});
