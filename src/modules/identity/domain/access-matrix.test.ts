import { describe, expect, it } from "vitest";

import {
  completeGrants,
  isLockedRoleSlug,
  permissionsForGrant,
  permissionsForGrants,
  SYSTEM_ROLE_GRANTS,
} from "./access-matrix";

describe("permissionsForGrant", () => {
  it("هیچ مجوزی برای سطح هیچ ندارد", () => {
    expect(permissionsForGrant("orders", "none")).toEqual([]);
  });

  it("ویرایش سفارش انتقال وضعیت دارد ولی لغو ندارد", () => {
    expect(permissionsForGrant("orders", "write")).toEqual([
      "order:read",
      "order:transition",
      "shipment:read",
      "shipment:write",
    ]);
    expect(permissionsForGrant("orders", "full")).toContain("order:cancel");
  });

  it("کامل کاربران role:write نمی‌دهد", () => {
    expect(permissionsForGrant("users", "full")).not.toContain("role:write");
  });
});

describe("نقش‌های سیستمی", () => {
  it("مالی همان مجوزهای قبلی را دارد", () => {
    const perms = permissionsForGrants(SYSTEM_ROLE_GRANTS.finance);
    expect(perms.sort()).toEqual(
      [
        "gold_price:read",
        "gold_price:write",
        "order:read",
        "payment:read",
        "payment:review",
        "report:read",
        "treasury:adjust",
        "treasury:read",
        "user:read",
      ].sort(),
    );
  });

  it("مدیر سفارش همان مجوزهای قبلی را دارد", () => {
    const perms = permissionsForGrants(SYSTEM_ROLE_GRANTS.order_manager);
    expect(perms.sort()).toEqual(
      [
        "catalog:read",
        "order:cancel",
        "order:read",
        "order:transition",
        "payment:read",
        "report:read",
        "shipment:read",
        "shipment:write",
        "user:read",
      ].sort(),
    );
  });

  it("پشتیبانی همان مجوزهای قبلی را دارد", () => {
    const perms = permissionsForGrants(SYSTEM_ROLE_GRANTS.customer_support);
    expect(perms.sort()).toEqual(
      [
        "catalog:read",
        "child:read",
        "order:read",
        "payment:read",
        "sms:read",
        "treasury:read",
        "user:read",
      ].sort(),
    );
  });
  it("آماده‌سازی سفارش را لغو نمی‌کند", () => {
    const perms = permissionsForGrants(SYSTEM_ROLE_GRANTS.fulfillment);
    expect(perms).toContain("order:transition");
    expect(perms).not.toContain("order:cancel");
  });

  it("مدیر محتوا فقط کاتالوگ و محتوا و خواندن قیمت دارد", () => {
    const perms = permissionsForGrants(SYSTEM_ROLE_GRANTS.content_manager);
    expect(perms.sort()).toEqual(
      ["catalog:read", "catalog:write", "content:write", "gold_price:read"].sort(),
    );
  });
});

describe("completeGrants", () => {
  it("بخش‌های نیامده را هیچ می‌گذارد", () => {
    const map = completeGrants([{ section: "orders", level: "read" }]);
    expect(map.orders).toBe("read");
    expect(map.settings).toBe("none");
  });
});

describe("isLockedRoleSlug", () => {
  it("فقط مدیر ارشد قفل است", () => {
    expect(isLockedRoleSlug("super_admin")).toBe(true);
    expect(isLockedRoleSlug("finance")).toBe(false);
  });
});
