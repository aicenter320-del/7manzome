import { describe, expect, it } from "vitest";

import {
  canDeleteMediaFolder,
  foldersForRoles,
  isMediaFolder,
} from "./media-access";

describe("foldersForRoles", () => {
  it("مدیر ارشد همه پوشه‌ها را می‌بیند", () => {
    expect(foldersForRoles(["super_admin"])).toEqual(["products", "children", "receipts"]);
  });

  it("مالی فقط رسید را می‌بیند", () => {
    expect(foldersForRoles(["finance"])).toEqual(["receipts"]);
  });

  it("مدیر محتوا فقط محصول را می‌بیند", () => {
    expect(foldersForRoles(["content_manager"])).toEqual(["products"]);
  });

  it("آماده‌سازی فقط محصول را می‌بیند", () => {
    expect(foldersForRoles(["fulfillment"])).toEqual(["products"]);
  });

  it("پشتیبانی محصول، کودک و رسید را می‌بیند", () => {
    expect(foldersForRoles(["customer_support"])).toEqual([
      "products",
      "children",
      "receipts",
    ]);
  });

  it("نقش ناشناخته پوشه‌ای ندارد", () => {
    expect(foldersForRoles([])).toEqual([]);
  });
});

describe("canDeleteMediaFolder", () => {
  it("مدیر محتوا محصول را حذف می‌کند نه رسید", () => {
    expect(canDeleteMediaFolder(["content_manager"], "products")).toBe(true);
    expect(canDeleteMediaFolder(["content_manager"], "receipts")).toBe(false);
  });

  it("مالی رسید را حذف می‌کند نه محصول", () => {
    expect(canDeleteMediaFolder(["finance"], "receipts")).toBe(true);
    expect(canDeleteMediaFolder(["finance"], "products")).toBe(false);
  });

  it("پشتیبانی عکس کودک را نمی‌تواند حذف کند", () => {
    expect(canDeleteMediaFolder(["customer_support"], "children")).toBe(false);
  });

  it("فقط مدیر ارشد عکس کودک را حذف می‌کند", () => {
    expect(canDeleteMediaFolder(["super_admin"], "children")).toBe(true);
  });
});

describe("isMediaFolder", () => {
  it("پوشه معتبر را می‌شناسد", () => {
    expect(isMediaFolder("products")).toBe(true);
    expect(isMediaFolder("unknown")).toBe(false);
  });
});
