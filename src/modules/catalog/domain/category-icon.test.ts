import { describe, expect, it } from "vitest";

import { categoryIconKey } from "./category-icon";

describe("categoryIconKey", () => {
  it("دسته‌های شناخته‌شده را از اسلاگ تشخیص می‌دهد", () => {
    expect(categoryIconKey("bracelet")).toBe("link");
    expect(categoryIconKey("necklace")).toBe("medal");
    expect(categoryIconKey("earring")).toBe("gem");
    expect(categoryIconKey("coin-bar")).toBe("coins");
    expect(categoryIconKey("ring")).toBe("ring");
    expect(categoryIconKey("anklet")).toBe("footprints");
  });

  it("اسلاگ ناشناخته به درخشش برمی‌گردد", () => {
    expect(categoryIconKey("unknown")).toBe("sparkles");
  });
});
