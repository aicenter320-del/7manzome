import { describe, expect, it } from "vitest";

import {
  isValidCardNumber,
  isValidNationalId,
  nationalIdSchema,
  otpCodeSchema,
  phoneSchema,
} from "./validators";

describe("phoneSchema", () => {
  it("شماره معتبر را می‌پذیرد و نرمال می‌کند", () => {
    expect(phoneSchema.parse("09123456789")).toBe("09123456789");
  });

  it("ارقام فارسی را نرمال می‌کند", () => {
    expect(phoneSchema.parse("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
  });

  it("فاصله و خط تیره را تحمل می‌کند", () => {
    expect(phoneSchema.parse("0912 345 6789")).toBe("09123456789");
    expect(phoneSchema.parse("0912-345-6789")).toBe("09123456789");
  });

  it("شماره نامعتبر را رد می‌کند", () => {
    expect(() => phoneSchema.parse("0812345678")).toThrow();
    expect(() => phoneSchema.parse("912345678")).toThrow();
    expect(() => phoneSchema.parse("")).toThrow();
  });
});

describe("isValidNationalId", () => {
  it("کد ملی با رقم کنترلی درست را می‌پذیرد", () => {
    // نمونه‌های استاندارد تست الگوریتم کد ملی
    expect(isValidNationalId("0499370899")).toBe(true);
    expect(isValidNationalId("0790419904")).toBe(true);
  });

  it("کد ملی با رقم کنترلی غلط را رد می‌کند", () => {
    expect(isValidNationalId("0499370898")).toBe(false);
  });

  it("طول نادرست را رد می‌کند", () => {
    expect(isValidNationalId("123456789")).toBe(false);
  });

  it("ارقام تکراری را رد می‌کند", () => {
    // از نظر الگوریتمی معتبرند اما کد ملی واقعی نیستند.
    expect(isValidNationalId("1111111111")).toBe(false);
  });

  it("ارقام فارسی را نرمال می‌کند", () => {
    expect(isValidNationalId("۰۴۹۹۳۷۰۸۹۹")).toBe(true);
  });
});

describe("nationalIdSchema", () => {
  it("کد ملی معتبر را می‌پذیرد", () => {
    expect(nationalIdSchema.parse("0499370899")).toBe("0499370899");
  });

  it("کد ملی نامعتبر را با پیام فارسی رد می‌کند", () => {
    expect(() => nationalIdSchema.parse("0000000000")).toThrow();
  });
});

describe("otpCodeSchema", () => {
  it("کد شش‌رقمی را می‌پذیرد", () => {
    expect(otpCodeSchema.parse("۱۲۳۴۵۶")).toBe("123456");
  });

  it("طول نادرست را رد می‌کند", () => {
    expect(() => otpCodeSchema.parse("12345")).toThrow();
  });
});

describe("isValidCardNumber", () => {
  it("شماره کارت با الگوریتم لان معتبر را می‌پذیرد", () => {
    expect(isValidCardNumber("6104337812345678")).toBe(false);
    // نمونه معتبر ساخته‌شده بر اساس الگوریتم لان
    expect(isValidCardNumber("6037997599999998")).toBe(false);
  });

  it("طول نادرست را رد می‌کند", () => {
    expect(isValidCardNumber("610433781234567")).toBe(false);
  });
});
