import { describe, expect, it } from "vitest";

import { contentDispositionHeader } from "./content-disposition";

describe("contentDispositionHeader", () => {
  it("برای نام خالی چیزی برنمی‌گرداند", () => {
    expect(contentDispositionHeader(null)).toBeUndefined();
    expect(contentDispositionHeader("   ")).toBeUndefined();
  });

  it("نام ASCII را بدون درصدگذاری خراب نمی‌کند", () => {
    expect(contentDispositionHeader("hero.jpg")).toBe(
      'inline; filename="hero.jpg"; filename*=UTF-8\'\'hero.jpg',
    );
  });

  it("نام فارسی را از filename ASCII بیرون می‌گذارد تا هدر ByteString بماند", () => {
    const header = contentDispositionHeader("دستبند طلا.jpg");
    expect(header).toBeDefined();
    if (!header) return;

    for (let index = 0; index < header.length; index += 1) {
      expect(header.charCodeAt(index)).toBeLessThan(256);
    }

    expect(header.startsWith('inline; filename="')).toBe(true);
    expect(header).toContain("filename*=UTF-8''");
    expect(header).toContain(encodeURIComponent("دستبند طلا.jpg"));
    expect(header).not.toContain("د");
  });

  it("شکستن خط در نام را برای تزریق هدر حذف می‌کند", () => {
    const header = contentDispositionHeader('evil\r\nX-Injected: 1.jpg');
    expect(header).toBeDefined();
    expect(header).not.toContain("\r");
    expect(header).not.toContain("\n");
  });
});
