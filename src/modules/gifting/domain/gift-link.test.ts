import { describe, expect, it } from "vitest";

import {
  ANONYMOUS_DISPLAY_NAME,
  buildGiftUrl,
  isGiftTokenFormat,
  isLinkAccepting,
  maskContributorName,
  validateContributionAmount,
} from "./gift-link";

describe("validateContributionAmount", () => {
  const minRial = 1_000_000;

  it("مبلغ کمتر از حداقل را رد می‌کند", () => {
    const result = validateContributionAmount(500_000, minRial);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("حداقل");
    }
  });

  it("مبلغ برابر حداقل را می‌پذیرد", () => {
    expect(validateContributionAmount(minRial, minRial)).toEqual({ ok: true });
  });

  it("مبلغ صفر یا منفی را رد می‌کند", () => {
    expect(validateContributionAmount(0, minRial).ok).toBe(false);
    expect(validateContributionAmount(-10, minRial).ok).toBe(false);
  });
});

describe("isLinkAccepting", () => {
  const now = 1_700_000_000_000;

  it("لینک منقضی‌شده را نمی‌پذیرد", () => {
    expect(isLinkAccepting("active", now - 1, now)).toBe(false);
    expect(isLinkAccepting("expired", null, now)).toBe(false);
  });

  it("لینک متوقف یا بسته‌شده را نمی‌پذیرد", () => {
    expect(isLinkAccepting("paused", null, now)).toBe(false);
    expect(isLinkAccepting("closed", null, now)).toBe(false);
  });

  it("لینک فعال بدون انقضا را می‌پذیرد", () => {
    expect(isLinkAccepting("active", null, now)).toBe(true);
  });

  it("لینک فعال با انقضای آینده را می‌پذیرد", () => {
    expect(isLinkAccepting("active", now + 86_400_000, now)).toBe(true);
  });
});

describe("maskContributorName", () => {
  it("نام ناشناس را به «یک دوست» تبدیل می‌کند", () => {
    expect(maskContributorName("سارا", true)).toBe(ANONYMOUS_DISPLAY_NAME);
  });

  it("نام غیرناشناس را دست‌نخورده برمی‌گرداند", () => {
    expect(maskContributorName("سارا", false)).toBe("سارا");
  });
});

describe("buildGiftUrl", () => {
  it("نشانی صفحه هدیه را می‌سازد", () => {
    expect(buildGiftUrl("http://localhost:3000", "abc-token-value-1")).toBe(
      "http://localhost:3000/g/abc-token-value-1",
    );
  });

  it("اسلش انتهایی آدرس پایه را حذف می‌کند", () => {
    expect(buildGiftUrl("https://haft.ir/", "tokentokentoken1")).toBe(
      "https://haft.ir/g/tokentokentoken1",
    );
  });
});

describe("isGiftTokenFormat", () => {
  it("توکن کوتاه را رد می‌کند", () => {
    expect(isGiftTokenFormat("short")).toBe(false);
  });

  it("توکن معتبر را می‌پذیرد", () => {
    expect(isGiftTokenFormat("abcdefghijklmnop")).toBe(true);
  });
});
