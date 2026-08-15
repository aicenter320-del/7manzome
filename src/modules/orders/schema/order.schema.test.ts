import { describe, expect, it } from "vitest";

import { placeOrderSchema } from "./order.schema";

describe("placeOrderSchema", () => {
  const base = {
    recipientName: "سارا محمدی",
    recipientPhone: "09121111111",
    shippingAddress: {
      province: "تهران",
      city: "تهران",
      addressLine: "خیابان ولیعصر، پلاک ۱۲",
    },
  };

  it("استان و شهر معتبر را می‌پذیرد", () => {
    const result = placeOrderSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("شهر خارج از استان را رد می‌کند", () => {
    const result = placeOrderSchema.safeParse({
      ...base,
      shippingAddress: { ...base.shippingAddress, city: "شیراز" },
    });
    expect(result.success).toBe(false);
  });

  it("استان خارج از فهرست را رد می‌کند", () => {
    const result = placeOrderSchema.safeParse({
      ...base,
      shippingAddress: { ...base.shippingAddress, province: "استان خیالی" },
    });
    expect(result.success).toBe(false);
  });
});
