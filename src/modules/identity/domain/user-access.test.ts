import { describe, expect, it } from "vitest";

import {
  ASSIGNABLE_ROLE_LABELS,
  assignedRoleFromRoles,
  isAssignableRole,
  rolesForAssignedRole,
} from "./user-access";

describe("assignedRoleFromRoles", () => {
  it("بدون نقش کارمندی مشتری است", () => {
    expect(assignedRoleFromRoles([])).toBe("customer");
  });

  it("مدیر ارشد را ترجیح می‌دهد", () => {
    expect(assignedRoleFromRoles(["super_admin"])).toBe("super_admin");
    expect(assignedRoleFromRoles(["fulfillment", "super_admin"])).toBe("super_admin");
  });

  it("نقش کارمندی را همان‌طور که هست نشان می‌دهد", () => {
    expect(assignedRoleFromRoles(["content_manager"])).toBe("content_manager");
    expect(assignedRoleFromRoles(["customer_support"])).toBe("customer_support");
    expect(assignedRoleFromRoles(["fulfillment"])).toBe("fulfillment");
  });
});

describe("rolesForAssignedRole", () => {
  it("مشتری را بدون نقش کارمندی می‌سازد", () => {
    expect(rolesForAssignedRole("customer")).toEqual([]);
  });

  it("نقش کارمندی را تک‌نقش می‌گذارد", () => {
    expect(rolesForAssignedRole("super_admin")).toEqual(["super_admin"]);
    expect(rolesForAssignedRole("content_manager")).toEqual(["content_manager"]);
  });
});

describe("برچسب‌ها", () => {
  it("نقش‌های نمایشی فارسی‌اند", () => {
    expect(ASSIGNABLE_ROLE_LABELS.customer).toBe("مشتری");
    expect(ASSIGNABLE_ROLE_LABELS.super_admin).toBe("مدیر ارشد");
    expect(ASSIGNABLE_ROLE_LABELS.content_manager).toBe("مدیر محتوا");
    expect(ASSIGNABLE_ROLE_LABELS.customer_support).toBe("پشتیبانی مشتریان");
    expect(ASSIGNABLE_ROLE_LABELS.fulfillment).toBe("آماده‌سازی و ارسال");
  });

  it("نقش قابل‌انتخاب را از رشته تشخیص می‌دهد", () => {
    expect(isAssignableRole("customer")).toBe(true);
    expect(isAssignableRole("content_manager")).toBe(true);
    expect(isAssignableRole("manager")).toBe(false);
  });
});
