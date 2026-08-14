import { describe, expect, it } from "vitest";

import {
  CUSTOMER_ROLE_SLUG,
  SYSTEM_ASSIGNABLE_LABELS,
  assignedRoleFromRoles,
  isAssignableRoleValue,
  labelForAssignedRole,
  rolesForAssignedRole,
} from "./user-access";

const sampleOptions = [
  { slug: "super_admin", title: "مدیر ارشد" },
  { slug: "content_manager", title: "مدیر محتوا" },
  { slug: "c_custom1", title: "انبار" },
];

describe("assignedRoleFromRoles", () => {
  it("بدون نقش کارمندی مشتری است", () => {
    expect(assignedRoleFromRoles([])).toBe(CUSTOMER_ROLE_SLUG);
  });

  it("مدیر ارشد را ترجیح می‌دهد", () => {
    expect(assignedRoleFromRoles(["super_admin"])).toBe("super_admin");
    expect(assignedRoleFromRoles(["fulfillment", "super_admin"])).toBe("super_admin");
  });

  it("نقش کارمندی را همان‌طور که هست نشان می‌دهد", () => {
    expect(assignedRoleFromRoles(["content_manager"])).toBe("content_manager");
    expect(assignedRoleFromRoles(["c_custom1"])).toBe("c_custom1");
  });
});

describe("rolesForAssignedRole", () => {
  it("مشتری را بدون نقش کارمندی می‌سازد", () => {
    expect(rolesForAssignedRole("customer")).toEqual([]);
  });

  it("نقش کارمندی را تک‌نقش می‌گذارد", () => {
    expect(rolesForAssignedRole("super_admin")).toEqual(["super_admin"]);
    expect(rolesForAssignedRole("c_custom1")).toEqual(["c_custom1"]);
  });
});

describe("برچسب‌ها", () => {
  it("نقش‌های سیستمی فارسی‌اند", () => {
    expect(SYSTEM_ASSIGNABLE_LABELS.customer).toBe("مشتری");
    expect(SYSTEM_ASSIGNABLE_LABELS.super_admin).toBe("مدیر ارشد");
    expect(SYSTEM_ASSIGNABLE_LABELS.content_manager).toBe("مدیر محتوا");
  });

  it("برچسب را از فهرست نقش‌ها می‌خواند", () => {
    expect(labelForAssignedRole("c_custom1", sampleOptions)).toBe("انبار");
    expect(labelForAssignedRole("customer", sampleOptions)).toBe("مشتری");
  });

  it("نقش قابل‌انتخاب را از فهرست تشخیص می‌دهد", () => {
    expect(isAssignableRoleValue("customer", sampleOptions)).toBe(true);
    expect(isAssignableRoleValue("c_custom1", sampleOptions)).toBe(true);
    expect(isAssignableRoleValue("unknown", sampleOptions)).toBe(false);
  });
});
