import { describe, expect, it } from "vitest";

import { canAdminDecideKyc, nextKycDecisions } from "./kyc-status";

describe("nextKycDecisions", () => {
  it("از انجام‌نشده فقط تایید دستی مجاز است", () => {
    expect(nextKycDecisions("none")).toEqual(["verified"]);
  });

  it("از صف بررسی می‌توان تایید یا رد کرد", () => {
    expect(nextKycDecisions("pending")).toEqual(["verified", "rejected"]);
  });

  it("پس از رد می‌توان دستی تایید کرد", () => {
    expect(nextKycDecisions("rejected")).toEqual(["verified"]);
  });

  it("از تاییدشده فقط لغو به انجام‌نشده مجاز است", () => {
    expect(nextKycDecisions("verified")).toEqual(["none"]);
  });
});

describe("canAdminDecideKyc", () => {
  it("تایید دستی از انجام‌نشده را اجازه می‌دهد", () => {
    expect(canAdminDecideKyc("none", "verified")).toBe(true);
    expect(canAdminDecideKyc("none", "rejected")).toBe(false);
  });

  it("از تاییدشده فقط لغو مجاز است", () => {
    expect(canAdminDecideKyc("verified", "none")).toBe(true);
    expect(canAdminDecideKyc("verified", "rejected")).toBe(false);
    expect(canAdminDecideKyc("verified", "verified")).toBe(false);
  });
});
