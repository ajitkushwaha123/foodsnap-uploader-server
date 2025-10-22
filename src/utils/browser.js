import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const STORAGE_PATH = path.resolve("./zomato-session.json");

export async function getBrowser() {
  let browser;
  let context;

  const hasSession = fs.existsSync(STORAGE_PATH);

  browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  context = await browser.newContext({
    storageState: hasSession ? STORAGE_PATH : undefined,
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
    timezoneId: "Asia/Kolkata",
    colorScheme: "light",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  console.log(
    hasSession ? "✅ Session loaded" : "⚠️ No session found, login needed"
  );

  return { browser, context };
}

export async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
    console.log("🛑 Browser closed");
  }
}
