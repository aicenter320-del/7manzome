import { describe, expect, it } from "vitest";

import { overflowScrollLeft, overflowThumb } from "./overflow-thumb";

describe("overflowThumb", () => {
  it("بدون سرریز نوار را مخفی می‌کند", () => {
    expect(
      overflowThumb({ clientWidth: 400, scrollWidth: 400, scrollLeft: 0, rtl: true }),
    ).toEqual({ overflow: false, start: 0, size: 1 });
  });

  it("عرض شست با نسبت نمایان به کل محتواست", () => {
    const thumb = overflowThumb({
      clientWidth: 200,
      scrollWidth: 400,
      scrollLeft: 0,
      rtl: false,
    });
    expect(thumb.overflow).toBe(true);
    expect(thumb.size).toBe(0.5);
    expect(thumb.start).toBe(0);
  });

  it("در انتهای اسکرول شست به پایان نوار می‌رسد", () => {
    const thumb = overflowThumb({
      clientWidth: 200,
      scrollWidth: 400,
      scrollLeft: 200,
      rtl: false,
    });
    expect(thumb.start).toBeCloseTo(0.5);
    expect(thumb.size).toBe(0.5);
  });

  it("در RTL با scrollLeft منفی پیشرفت را می‌فهمد", () => {
    const thumb = overflowThumb({
      clientWidth: 200,
      scrollWidth: 400,
      scrollLeft: -200,
      rtl: true,
    });
    expect(thumb.start).toBeCloseTo(0.5);
  });
});

describe("overflowScrollLeft", () => {
  it("نسبت کلیک را به اسکرول LTR تبدیل می‌کند", () => {
    expect(
      overflowScrollLeft({ clientWidth: 200, scrollWidth: 400, ratio: 1, rtl: false }),
    ).toBe(200);
  });

  it("در RTL مقدار منفی می‌دهد", () => {
    expect(
      overflowScrollLeft({ clientWidth: 200, scrollWidth: 400, ratio: 1, rtl: true }),
    ).toBe(-200);
  });
});
