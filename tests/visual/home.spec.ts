import { test, expect } from "@playwright/test";

const store = process.env.STORE || "";
const stagingThemeId = process.env.STAGING_THEME_ID || "";
const previewUrl =
  process.env.PREVIEW_URL ||
  (store && stagingThemeId
    ? `https://${store}?preview_theme_id=${stagingThemeId}`
    : store ? `https://${store}` : "");

test.describe("Homepage visual", () => {
  test.skip(!previewUrl, "Preview URL non définie");
  test("homepage", async ({ page }) => {
    await page.goto(previewUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await expect(page.locator("body")).toHaveScreenshot("homepage.png", {
      fullPage: true,
      animations: "disabled"
    });
  });
});
