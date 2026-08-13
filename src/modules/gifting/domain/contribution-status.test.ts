import { describe, expect, it } from "vitest";

import {
  canTransition,
  canUpdateKeepsake,
  isFinalContributionStatus,
  nextStatuses,
} from "./contribution-status";

describe("canTransition", () => {
  it("مسیر موفق را اجازه می‌دهد", () => {
    expect(canTransition("draft", "awaiting_payment")).toBe(true);
    expect(canTransition("awaiting_payment", "confirmed")).toBe(true);
  });

  it("انصراف و رد از انتظار پرداخت را اجازه می‌دهد", () => {
    expect(canTransition("awaiting_payment", "cancelled")).toBe(true);
    expect(canTransition("awaiting_payment", "rejected")).toBe(true);
  });

  it("تلاش مجدد پس از رد را اجازه می‌دهد", () => {
    expect(canTransition("rejected", "awaiting_payment")).toBe(true);
  });

  it("پرش از مراحل را اجازه نمی‌دهد", () => {
    expect(canTransition("draft", "confirmed")).toBe(false);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
  });

  it("از وضعیت نهایی خارج نمی‌شود", () => {
    expect(canTransition("confirmed", "rejected")).toBe(false);
    expect(canTransition("cancelled", "awaiting_payment")).toBe(false);
  });
});

describe("nextStatuses", () => {
  it("گذارهای مجاز انتظار پرداخت را می‌دهد", () => {
    expect(nextStatuses("awaiting_payment")).toEqual(["confirmed", "cancelled", "rejected"]);
  });
});

describe("isFinalContributionStatus", () => {
  it("تایید و لغو نهایی‌اند", () => {
    expect(isFinalContributionStatus("confirmed")).toBe(true);
    expect(isFinalContributionStatus("cancelled")).toBe(true);
  });

  it("رد شدن نهایی نیست چون می‌توان دوباره پرداخت کرد", () => {
    expect(isFinalContributionStatus("rejected")).toBe(false);
  });
});

describe("canUpdateKeepsake", () => {
  it("در انتظار پرداخت و پس از تایید مجاز است", () => {
    expect(canUpdateKeepsake("awaiting_payment")).toBe(true);
    expect(canUpdateKeepsake("confirmed")).toBe(true);
  });

  it("پس از لغو مجاز نیست", () => {
    expect(canUpdateKeepsake("cancelled")).toBe(false);
  });
});
