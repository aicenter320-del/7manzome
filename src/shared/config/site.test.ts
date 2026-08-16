import { describe, expect, it } from "vitest";

import { customerTabs, isActiveHref, mainNav } from "./site";

describe("isActiveHref", () => {
  it("خانه فقط روی ریشه فعال است", () => {
    expect(isActiveHref("/", "/")).toBe(true);
    expect(isActiveHref("/products", "/")).toBe(false);
  });

  it("مسیر تو در تو را برای ویترین تشخیص می‌دهد", () => {
    expect(isActiveHref("/products", "/products")).toBe(true);
    expect(isActiveHref("/products/star-necklace", "/products")).toBe(true);
    expect(isActiveHref("/gift", "/products")).toBe(false);
  });
});

describe("mainNav", () => {
  it("سه مسیر خرید دارد و خانه در آن نیست", () => {
    expect(mainNav).toHaveLength(3);
    expect(mainNav.map((item) => item.href)).toEqual(["/products", "/occasions", "/gift"]);
  });
});

describe("customerTabs", () => {
  it("چهار تب نوار پایین دارد", () => {
    expect(customerTabs.map((item) => item.id)).toEqual(["home", "shop", "gift", "account"]);
  });
});
