import { expect, test } from "@playwright/test";

test.describe("مسیرهای عمومی", () => {
  test("صفحه اصلی روایت برند را نشان می‌دهد", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /گنجینه طلای فرزندت را بساز/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "مشاهده محصولات" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "هدیه بده" })).toBeVisible();
  });

  test("صفحه محصولات قابل مشاهده است", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("ورود با کد یک‌بارمصرف در دسترس است", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("شماره موبایل")).toBeVisible();
    await expect(page.getByRole("button", { name: "دریافت کد تایید" })).toBeVisible();
  });

  test("داشبورد بدون ورود به صفحه ورود می‌رود", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
