import { describe, expect, it } from "vitest";

import {
  MAX_PRODUCT_IMAGES,
  canAddProductImage,
  hoverFileId,
  nextHeroFileId,
  orderedGallery,
} from "./product-gallery";

const media = [
  { id: "m1", fileId: "hero", alt: "اصلی" },
  { id: "m2", fileId: "second", alt: "نزدیک" },
  { id: "m3", fileId: "third", alt: "بسته" },
] as const;

describe("hoverFileId", () => {
  it("اولین فایل غیرهیرو را برمی‌گرداند", () => {
    expect(hoverFileId("hero", media)).toBe("second");
  });

  it("اگر فقط یک تصویر باشد تهی است", () => {
    expect(hoverFileId("hero", [{ fileId: "hero" }])).toBeNull();
  });

  it("بدون هیرو، دومین فایل گالری را می‌گیرد", () => {
    expect(hoverFileId(null, media)).toBe("second");
  });

  it("گالری خالی تهی است", () => {
    expect(hoverFileId("hero", [])).toBeNull();
    expect(hoverFileId(null, [])).toBeNull();
  });
});

describe("orderedGallery", () => {
  it("تصویر اصلی را به ابتدای فهرست می‌آورد", () => {
    const reordered = orderedGallery("third", media);
    expect(reordered.map((item) => item.fileId)).toEqual(["third", "hero", "second"]);
  });

  it("اگر هیرو از قبل اول باشد ترتیب را عوض نمی‌کند", () => {
    expect(orderedGallery("hero", media)).toEqual([...media]);
  });

  it("اگر هیرو در گالری نباشد همان ترتیب را نگه می‌دارد", () => {
    expect(orderedGallery("missing", media)).toEqual([...media]);
  });
});

describe("nextHeroFileId", () => {
  it("اولین باقی‌مانده را برمی‌گرداند", () => {
    expect(nextHeroFileId([{ fileId: "second" }, { fileId: "third" }])).toBe("second");
  });

  it("بدون باقی‌مانده تهی است", () => {
    expect(nextHeroFileId([])).toBeNull();
  });
});

describe("canAddProductImage", () => {
  it("تا سقف هشت تصویر اجازه می‌دهد", () => {
    expect(canAddProductImage(0)).toBe(true);
    expect(canAddProductImage(MAX_PRODUCT_IMAGES - 1)).toBe(true);
    expect(canAddProductImage(MAX_PRODUCT_IMAGES)).toBe(false);
  });
});
