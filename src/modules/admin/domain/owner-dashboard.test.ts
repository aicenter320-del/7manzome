import { describe, expect, it } from "vitest";

import {
  buildAttentionItems,
  classifyOverallHealth,
  classifyTrendHealth,
  inventoryTurnoverBp,
  parseDashboardRange,
  percentChangeBp,
  rankAttentionItems,
  resolveDashboardRange,
  summarizeOrderPipeline,
  type AttentionItem,
} from "./owner-dashboard";

describe("percentChangeBp", () => {
  it("افزایش ده درصد را ۱۰۰۰ صدم‌درصد می‌دهد", () => {
    expect(percentChangeBp(110, 100)).toBe(1_000);
  });

  it("کاهش بیست درصد را منفی ۲۰۰۰ می‌دهد", () => {
    expect(percentChangeBp(80, 100)).toBe(-2_000);
  });

  it("وقتی دوره قبل صفر و جاری صفر است صفر برمی‌گردد", () => {
    expect(percentChangeBp(0, 0)).toBe(0);
  });

  it("وقتی دوره قبل صفر است تغییر تعریف نمی‌شود", () => {
    expect(percentChangeBp(10, 0)).toBeNull();
  });
});

describe("classifyTrendHealth", () => {
  it("افت ۲۰ درصد نیازمند توجه است", () => {
    expect(classifyTrendHealth(-2_000)).toBe("attention");
  });

  it("افت ۵۰ درصد بحرانی است", () => {
    expect(classifyTrendHealth(-5_000)).toBe("critical");
  });

  it("رشد سالم است", () => {
    expect(classifyTrendHealth(500)).toBe("healthy");
  });
});

describe("classifyOverallHealth", () => {
  const base = {
    shopOpen: true,
    goldPriceAvailable: true,
    pendingReviewCount: 0,
    stuckOrderCount: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    rejectedPaymentCount: 0,
    uncoveredGoldMg: 0,
    salesChangeBp: 0,
    profitChangeBp: 0,
  };

  it("فروشگاه بسته را بحرانی می‌داند", () => {
    expect(classifyOverallHealth({ ...base, shopOpen: false })).toBe("critical");
  });

  it("صف تایید را نیازمند توجه می‌داند", () => {
    expect(classifyOverallHealth({ ...base, pendingReviewCount: 2 })).toBe("attention");
  });

  it("بدون مشکل سالم است", () => {
    expect(classifyOverallHealth(base)).toBe("healthy");
  });
});

describe("rankAttentionItems", () => {
  it("بحرانی را بالاتر از هشدار می‌گذارد", () => {
    const items: AttentionItem[] = [
      { id: "b", severity: "warning", title: "ب", href: "/" },
      { id: "a", severity: "critical", title: "الف", href: "/" },
    ];
    expect(rankAttentionItems(items).map((item) => item.id)).toEqual(["a", "b"]);
  });
});

describe("buildAttentionItems", () => {
  it("بدون مشکل فهرست خالی است", () => {
    expect(
      buildAttentionItems({
        shopOpen: true,
        goldPriceAvailable: true,
        pendingReviewCount: 0,
        stuckOrderCount: 0,
        outOfStockCount: 0,
        lowStockCount: 0,
        rejectedPaymentCount: 0,
        uncoveredGoldMg: 0,
        salesChangeBp: 100,
        profitChangeBp: 50,
      }),
    ).toEqual([]);
  });

  it("قیمت طلای غایب را بحرانی می‌آورد", () => {
    const items = buildAttentionItems({
      shopOpen: true,
      goldPriceAvailable: false,
      pendingReviewCount: 0,
      stuckOrderCount: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      rejectedPaymentCount: 0,
      uncoveredGoldMg: 0,
      salesChangeBp: 0,
      profitChangeBp: 0,
    });
    expect(items[0]?.id).toBe("gold-price-missing");
    expect(items[0]?.severity).toBe("critical");
  });

  it("طلای پوشش‌نداده را هشدار می‌آورد", () => {
    const items = buildAttentionItems({
      shopOpen: true,
      goldPriceAvailable: true,
      pendingReviewCount: 0,
      stuckOrderCount: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      rejectedPaymentCount: 0,
      uncoveredGoldMg: 2_000,
      salesChangeBp: 0,
      profitChangeBp: 0,
    });
    expect(items[0]?.id).toBe("uncovered-gold");
    expect(items[0]?.href).toBe("/admin/treasures");
  });
});

describe("parseDashboardRange", () => {
  it("مقدار نامعتبر را به ۳۰ روز برمی‌گرداند", () => {
    expect(parseDashboardRange("nope")).toBe("30d");
  });
});

describe("resolveDashboardRange", () => {
  it("امروز را از ابتدای روز تهران می‌گیرد", () => {
    const noon = Date.UTC(2026, 7, 14, 9, 0, 0);
    const resolved = resolveDashboardRange("today", noon);
    expect(resolved.fromAt).toBeLessThanOrEqual(noon);
    expect(resolved.toAt).toBe(noon);
    expect(resolved.grain).toBe("day");
  });
});

describe("inventoryTurnoverBp", () => {
  it("فروش برابر موجودی یعنی ۱۰۰ درصد گردش", () => {
    expect(inventoryTurnoverBp(1_000, 1_000)).toBe(10_000);
  });

  it("موجودی صفر گردش ندارد", () => {
    expect(inventoryTurnoverBp(100, 0)).toBeNull();
  });
});

describe("summarizeOrderPipeline", () => {
  it("وضعیت‌ها را در برچسب فارسی جمع می‌زند", () => {
    const rows = summarizeOrderPipeline(
      {
        created: 2,
        payment_pending: 1,
        paid: 3,
        processing: 1,
        personalization: 0,
        quality_check: 1,
        packed: 4,
        shipped: 2,
        delivered: 8,
        cancelled: 1,
        refund_pending: 1,
        refunded: 2,
      },
      3,
    );

    expect(rows.find((row) => row.key === "new")?.count).toBe(3);
    expect(rows.find((row) => row.key === "prep")?.count).toBe(5);
    expect(rows.find((row) => row.key === "returned")?.count).toBe(6);
  });
});
