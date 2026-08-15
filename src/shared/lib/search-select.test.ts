import { describe, expect, it } from "vitest";

import {
  exactSearchOption,
  filterSearchOptions,
  uniqueCompletion,
} from "./search-select";

const BANKS = [
  { value: "ملی", label: "ملی" },
  { value: "ملت", label: "ملت" },
  { value: "سپه", label: "سپه" },
  { value: "سامان", label: "سامان" },
  { value: "سرمایه", label: "سرمایه" },
  { value: "سینا", label: "سینا" },
  { value: "شهر", label: "شهر" },
  { value: "صادرات", label: "صادرات" },
  { value: "صنعت و معدن", label: "صنعت و معدن" },
  { value: "اقتصاد نوین", label: "اقتصاد نوین" },
];

const BANK_ALIASES = ["بانک"];

describe("filterSearchOptions", () => {
  it("با حرف اول، گزینه‌هایی که با همان حرف شروع می‌شوند را برمی‌گرداند", () => {
    const labels = filterSearchOptions(BANKS, "س").map((item) => item.label);
    expect(labels).toEqual(["سپه", "سامان", "سرمایه", "سینا"]);
  });

  it("پیشوند «بانک» را نادیده می‌گیرد", () => {
    const labels = filterSearchOptions(BANKS, "بانک س", BANK_ALIASES).map((item) => item.label);
    expect(labels).toEqual(["سپه", "سامان", "سرمایه", "سینا"]);
  });

  it("اسم کامل بانک را پیدا می‌کند", () => {
    expect(filterSearchOptions(BANKS, "سپه").map((item) => item.label)).toEqual(["سپه"]);
    expect(filterSearchOptions(BANKS, "بانک سپه", BANK_ALIASES).map((item) => item.label)).toEqual([
      "سپه",
    ]);
  });

  it("کلمهٔ دوم نام چندکلمه‌ای را هم تطبیق می‌دهد", () => {
    expect(filterSearchOptions(BANKS, "نوین").map((item) => item.label)).toEqual(["اقتصاد نوین"]);
    expect(filterSearchOptions(BANKS, "معدن").map((item) => item.label)).toEqual(["صنعت و معدن"]);
  });

  it("بدون کوئری همه را برمی‌گرداند", () => {
    expect(filterSearchOptions(BANKS, "").length).toBe(BANKS.length);
  });

  it("ارقام فارسی و لاتین را یکسان می‌بیند", () => {
    const years = [
      { value: "1403", label: "۱۴۰۳", keywords: ["1403"] },
      { value: "1399", label: "۱۳۹۹", keywords: ["1399"] },
    ];
    expect(filterSearchOptions(years, "140").map((item) => item.value)).toEqual(["1403"]);
    expect(filterSearchOptions(years, "۱۴۰").map((item) => item.value)).toEqual(["1403"]);
  });
});

describe("uniqueCompletion", () => {
  it("ادامهٔ کمرنگ را وقتی فقط یک گزینه مانده برمی‌گرداند", () => {
    const completion = uniqueCompletion(BANKS, "سپ");
    expect(completion?.option.label).toBe("سپه");
    expect(completion?.remainder).toBe("ه");
  });

  it("با چند گزینه تکمیل یکتا نمی‌دهد", () => {
    expect(uniqueCompletion(BANKS, "س")).toBeNull();
  });

  it("با کوئری خالی تکمیل نمی‌دهد", () => {
    expect(uniqueCompletion([{ value: "سپه", label: "سپه" }], "")).toBeNull();
  });
});

describe("exactSearchOption", () => {
  it("تطبیق دقیق برچسب را پیدا می‌کند", () => {
    expect(exactSearchOption(BANKS, "سپه")?.value).toBe("سپه");
    expect(exactSearchOption(BANKS, "بانک سپه", BANK_ALIASES)?.value).toBe("سپه");
  });

  it("برای متن ناقص null می‌دهد", () => {
    expect(exactSearchOption(BANKS, "سپ")).toBeNull();
  });
});
