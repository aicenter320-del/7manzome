import { describe, expect, it } from "vitest";

import { postLoginPath } from "./post-login";

describe("postLoginPath", () => {
  it("کارمند را به پنل مدیریت می‌برد", () => {
    expect(postLoginPath(true)).toBe("/admin");
  });

  it("مشتری را به حساب خودش می‌برد", () => {
    expect(postLoginPath(false)).toBe("/dashboard");
  });

  it("مسیر بازگشت را بر نقش مقدم می‌داند", () => {
    expect(postLoginPath(true, "/dashboard/orders")).toBe("/dashboard/orders");
    expect(postLoginPath(false, "/admin")).toBe("/admin");
  });
});
