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
      timeout: 30000,
    });
    console.log("✅ Restaurant page loaded");

    // Wait for "Go to Menu Editor" button and click it
    await page.waitForSelector('a[data-tut="GO_TO_MENU_EDITOR"]', {
      state: "visible",
    });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.click('a[data-tut="GO_TO_MENU_EDITOR"]'),
    ]);
    console.log("✅ Clicked 'Go to Menu Editor' and page navigated");

    // Wait for "Add Catalogue" button and click it
    await page.waitForSelector('button[data-tut="ADD_CATALOGUE"]', {
      state: "visible",
    });

    // Click the button
    await page.click('button[data-tut="ADD_CATALOGUE"]');
    console.log("✅ Clicked 'Add Catalogue'");

    // Take screenshot of the menu editor page
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
    res.status(500).json({ error: "Failed to scrape Zomato menu" });
  }
};
