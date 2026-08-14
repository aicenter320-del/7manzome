import { describe, expect, it } from "vitest";

import {
  canDeleteMediaFolder,
  foldersForPermissions,
  isMediaFolder,
} from "./media-access";

describe("foldersForPermissions", () => {
  it("همه مجوزها همه پوشه‌ها را می‌بینند", () => {
    expect(
      foldersForPermissions(["catalog:read", "child:read", "payment:read"]),
    ).toEqual(["products", "children", "receipts"]);
  });

  it("خواندن پرداخت فقط رسید را می‌بیند", () => {
    expect(foldersForPermissions(["payment:read"])).toEqual(["receipts"]);
  });

  it("خواندن کاتالوگ فقط محصول را می‌بیند", () => {
    expect(foldersForPermissions(["catalog:read"])).toEqual(["products"]);
  });

  it("خواندن کودک فقط عکس کودک را می‌بیند", () => {
    expect(foldersForPermissions(["child:read"])).toEqual(["children"]);
  });

  it("بدون مجوز پوشه‌ای ندارد", () => {
    expect(foldersForPermissions([])).toEqual([]);
  });
});

describe("canDeleteMediaFolder", () => {
  it("نوشتن کاتالوگ محصول را حذف می‌کند نه رسید", () => {
    expect(canDeleteMediaFolder(["catalog:write"], "products")).toBe(true);
    expect(canDeleteMediaFolder(["catalog:write"], "receipts")).toBe(false);
  });

  it("بررسی پرداخت رسید را حذف می‌کند نه محصول", () => {
    expect(canDeleteMediaFolder(["payment:review"], "receipts")).toBe(true);
    expect(canDeleteMediaFolder(["payment:review"], "products")).toBe(false);
  });

  it("خواندن کودک عکس کودک را حذف نمی‌کند", () => {
    expect(canDeleteMediaFolder(["child:read"], "children")).toBe(false);
  });

  it("فقط مجوز نقش عکس کودک را حذف می‌کند", () => {
    expect(canDeleteMediaFolder(["role:write"], "children")).toBe(true);
  });
});

describe("isMediaFolder", () => {
  it("پوشه معتبر را می‌شناسد", () => {
    expect(isMediaFolder("products")).toBe(true);
    expect(isMediaFolder("unknown")).toBe(false);
  });
});
