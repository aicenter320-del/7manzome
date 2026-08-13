import { describe, expect, it } from "vitest";

import { detectScript, estimateEngravingFit, validateEngravingText } from "./engraving";

describe("validateEngravingText", () => {
  it("متن فارسی معتبر را می‌پذیرد", () => {
    const result = validateEngravingText("آراد", { maxChars: 12, script: "persian" });
    expect(result).toEqual({ ok: true, text: "آراد" });
  });

  it("متن لاتین معتبر را می‌پذیرد", () => {
    const result = validateEngravingText("ARAD", { maxChars: 12, script: "latin" });
    expect(result).toEqual({ ok: true, text: "ARAD" });
  });

  it("حروف عربی را به فارسی نرمال می‌کند", () => {
    const result = validateEngravingText("علي", { maxChars: 12, script: "persian" });
    expect(result).toEqual({ ok: true, text: "علی" });
  });

  it("متن خالی را رد می‌کند", () => {
    const result = validateEngravingText("   ", { maxChars: 12, script: "persian" });
    expect(result).toMatchObject({ ok: false, problem: "empty" });
  });

  it("متن بلندتر از ظرفیت را رد می‌کند", () => {
    const result = validateEngravingText("آرادِ عزیز دلبند ما", {
      maxChars: 8,
      script: "persian",
    });
    expect(result).toMatchObject({ ok: false, problem: "too_long" });
  });

  it("محصول بدون قابلیت حکاکی را رد می‌کند", () => {
    const result = validateEngravingText("آراد", { maxChars: 0, script: "persian" });
    expect(result).toMatchObject({ ok: false, problem: "not_supported" });
  });

  it("ایموجی و کاراکتر غیرمجاز را رد می‌کند", () => {
    const result = validateEngravingText("آراد ❤", { maxChars: 12, script: "persian" });
    expect(result).toMatchObject({ ok: false, problem: "invalid_chars" });
  });

  it("حروف لاتین در حکاکی فارسی مجاز نیست", () => {
    const result = validateEngravingText("Arad", { maxChars: 12, script: "persian" });
    expect(result).toMatchObject({ ok: false, problem: "invalid_chars" });
  });

  it("کاراکتر کنترلی حذف می‌شود", () => {
    const result = validateEngravingText("آراد\u0000", { maxChars: 12, script: "persian" });
    expect(result).toEqual({ ok: true, text: "آراد" });
  });
});

describe("estimateEngravingFit", () => {
  it("نسبت استفاده‌شده را می‌دهد", () => {
    const fit = estimateEngravingFit("آراد", 8);
    expect(fit.usedRatio).toBe(0.5);
    expect(fit.remainingChars).toBe(4);
    expect(fit.fits).toBe(true);
  });

  it("متن بلندتر از ظرفیت جا نمی‌شود", () => {
    const fit = estimateEngravingFit("آرادِ عزیز", 5);
    expect(fit.fits).toBe(false);
    expect(fit.remainingChars).toBe(0);
  });

  it("ظرفیت صفر همیشه پر است", () => {
    expect(estimateEngravingFit("", 0).usedRatio).toBe(1);
  });
});

describe("detectScript", () => {
  it("فارسی را تشخیص می‌دهد", () => {
    expect(detectScript("آراد")).toBe("persian");
  });

  it("لاتین را تشخیص می‌دهد", () => {
    expect(detectScript("ARAD")).toBe("latin");
  });
});
