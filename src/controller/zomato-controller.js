import { getBrowser } from "../utils/browser.js";

export const scrapeZomatoMenu = async (req, res) => {
  const { restaurantUrl } = req.body;

  try {
    const { browser, context } = await getBrowser();
    const page = await context.newPage();

    await page.goto(restaurantUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle");

    const screenshotPath = `./screenshots/menu-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await page.close();

    res.status(200).json({
      success: true,
      message: "Menu scraped successfully",
      screenshot: screenshotPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape Zomato menu" });
  }
};
