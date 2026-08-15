import { describe, expect, it } from "vitest";

import {
  IRAN_PROVINCES,
  citiesOfProvince,
  isCityInProvince,
  isIranProvince,
  iranProvinceNames,
} from "./iran-places";

describe("iran places", () => {
  it("سی‌ویک استان دارد", () => {
    expect(IRAN_PROVINCES).toHaveLength(31);
    expect(iranProvinceNames()).toHaveLength(31);
  });

  it("نام استان‌ها یکتا است", () => {
    const names = iranProvinceNames();
    expect(new Set(names).size).toBe(names.length);
  });

  it("هر استان دست‌کم یک شهر دارد", () => {
    for (const province of IRAN_PROVINCES) {
      expect(province.cities.length).toBeGreaterThan(0);
    }
  });

  it("شهر باید متعلق به همان استان باشد", () => {
    expect(isIranProvince("تهران")).toBe(true);
    expect(isCityInProvince("تهران", "تهران")).toBe(true);
    expect(isCityInProvince("تهران", "شیراز")).toBe(false);
    expect(isCityInProvince("فارس", "شیراز")).toBe(true);
    expect(citiesOfProvince("ناموجود")).toEqual([]);
  });
});
