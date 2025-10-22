import { getBrowser } from "../utils/browser.js";
import fs from "fs";

export const scrapeZomatoMenu = async (req, res) => {
  const { restaurantUrl } = req.body;

  let browser, context, page;

  try {
    ({ browser, context } = await getBrowser());
    page = await context.newPage();

    console.log("🌐 Navigating to restaurant page...");
    await page.goto(restaurantUrl, {
      waitUntil: "networkidle",
      timeout: 60000, // Increased timeout for slow-loading pages
    });
    console.log("✅ Restaurant page loaded");

    // Wait for "Go to Menu Editor" button
    await page.waitForSelector('a[data-tut="GO_TO_MENU_EDITOR"]', {
      state: "visible",
      timeout: 60000, // Headless sometimes needs more time
    });

    // Click the button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }),
      page.click('a[data-tut="GO_TO_MENU_EDITOR"]'),
    ]);
    console.log("✅ Clicked 'Go to Menu Editor' and page navigated");

    // Wait for "Add Catalogue" button
    await page.waitForSelector('button[data-tut="ADD_CATALOGUE"]', {
      state: "visible",
      timeout: 60000,
    });

    await page.click('button[data-tut="ADD_CATALOGUE"]');
    console.log("✅ Clicked 'Add Catalogue'");

    // Take screenshot
    fs.mkdirSync("./screenshots", { recursive: true });
    const screenshotPath = `./screenshots/menu-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    res.status(200).json({
      success: true,
      message: "Menu editor opened and screenshot taken successfully",
      screenshot: screenshotPath,
    });
  } catch (err) {
    console.error("❌ Error scraping menu:", err);

    // Optional: take screenshot on error for debugging
    if (page) {
      const errorScreenshot = `./screenshots/error-${Date.now()}.png`;
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      console.log(`📸 Error screenshot saved: ${errorScreenshot}`);
    }

    res.status(500).json({ error: "Failed to scrape Zomato menu" });
  } finally {
    if (browser) await browser.close();
  }
};
