import { describe, expect, it } from "vitest";

import { isActiveHref, mainNav } from "./site";

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
  it("سه مسیر اصلی دارد و خانه در آن نیست", () => {
    expect(mainNav).toHaveLength(3);
    expect(mainNav.map((item) => item.href)).toEqual(["/products", "/occasions", "/gift"]);
  });
});
