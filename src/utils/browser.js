import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const STORAGE_PATH = path.resolve("./zomato-session.json");
let browser;
let context; // store context separately

export async function getBrowser() {
  if (!browser) {
    const hasSession = fs.existsSync(STORAGE_PATH);

    browser = await chromium.launch({
      headless: false, // headless false to look like real browser
      args: [
        "--disable-dev-shm-usage", // reduces /dev/shm memory use
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-http2",
        "--single-process",
        "--disable-blink-features=AutomationControlled", // hides automation
      ],
    });

    context = await browser.newContext({
      storageState: hasSession ? STORAGE_PATH : undefined,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      locale: "en-US",
      timezoneId: "Asia/Kolkata",
      colorScheme: "light",
      permissions: ["geolocation"], // if needed
      geolocation: { latitude: 28.6139, longitude: 77.209 }, // Delhi as example
    });

    // Optional: override navigator.webdriver to false
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    console.log(
      hasSession ? "✅ Session loaded" : "⚠️ No session found, login needed"
    );
  }
  return { browser, context }; // return both
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    context = null;
    console.log("🛑 Browser closed");
  }
}
