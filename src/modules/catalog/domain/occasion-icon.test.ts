import { describe, expect, it } from "vitest";

import { occasionIconKey } from "./occasion-icon";

describe("occasionIconKey", () => {
  it("مناسبت‌های شناخته‌شده را از اسلاگ تشخیص می‌دهد", () => {
    expect(occasionIconKey("birthday")).toBe("cake");
    expect(occasionIconKey("first-tooth")).toBe("smile");
    expect(occasionIconKey("nowruz")).toBe("flower");
    expect(occasionIconKey("jashn-taklif")).toBe("moon-star");
  });

  it("اسلاگ ناشناخته را با ایموجی قدیمی می‌شناسد", () => {
    expect(occasionIconKey("custom", "🎂")).toBe("cake");
    expect(occasionIconKey("custom", "🦷")).toBe("smile");
    expect(occasionIconKey("custom", "🌸")).toBe("flower");
    expect(occasionIconKey("custom", "✨")).toBe("moon-star");
  });

  it("بدون اسلاگ و ایموجی شناخته‌شده به تقویم برمی‌گردد", () => {
    expect(occasionIconKey("unknown")).toBe("calendar-heart");
    expect(occasionIconKey("unknown", "🎉")).toBe("calendar-heart");
  });

  it("اسلاگ بر ایموجی اولویت دارد", () => {
    expect(occasionIconKey("birthday", "🌸")).toBe("cake");
  });
});
