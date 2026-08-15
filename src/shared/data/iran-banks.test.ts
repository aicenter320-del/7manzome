import { describe, expect, it } from "vitest";

import { IRAN_BANK_NAMES, isIranBankName } from "./iran-banks";

describe("iran banks", () => {
  it("فهرست بانک‌های رایج را دارد", () => {
    expect(IRAN_BANK_NAMES.length).toBeGreaterThan(10);
    expect(isIranBankName("ملت")).toBe(true);
    expect(isIranBankName("ملی")).toBe(true);
    expect(isIranBankName("بانک خیالی")).toBe(false);
  });

  it("نام‌ها یکتا هستند", () => {
    expect(new Set(IRAN_BANK_NAMES).size).toBe(IRAN_BANK_NAMES.length);
  });
});
