import { describe, expect, it } from "vitest";

import {
  isClosedJourneyStatus,
  journeyStationOf,
  parseJourneyStation,
  preferredForwardStatus,
} from "./order-journey";

describe("journeyStationOf", () => {
  it("وضعیت‌های پرداخت را در ایستگاه انتظار می‌گذارد", () => {
    expect(journeyStationOf("created")).toBe("awaiting_payment");
    expect(journeyStationOf("payment_pending")).toBe("awaiting_payment");
  });

  it("لغو و مرجوعی را بسته می‌داند", () => {
    expect(isClosedJourneyStatus("cancelled")).toBe(true);
    expect(isClosedJourneyStatus("refunded")).toBe(true);
    expect(isClosedJourneyStatus("packed")).toBe(false);
  });
});

describe("preferredForwardStatus", () => {
  it("بعد از پرداخت آماده‌سازی را پیشنهاد می‌دهد", () => {
    expect(preferredForwardStatus("paid", false)).toBe("processing");
  });

  it("اگر حکاکی دارد از آماده‌سازی به حکاکی می‌رود", () => {
    expect(preferredForwardStatus("processing", true)).toBe("personalization");
    expect(preferredForwardStatus("processing", false)).toBe("quality_check");
  });

  it("برای انتظار پرداخت گامی از سفارش پیشنهاد نمی‌دهد", () => {
    expect(preferredForwardStatus("payment_pending", false)).toBeNull();
  });
});

describe("parseJourneyStation", () => {
  it("کلید معتبر را می‌پذیرد", () => {
    expect(parseJourneyStation("pack")).toBe("pack");
    expect(parseJourneyStation("closed")).toBe("closed");
    expect(parseJourneyStation("unknown")).toBeUndefined();
  });
});
