import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173/owner/dashboard";
const SCREENSHOT_DIR = "C:\\Users\\haree\\.gemini\\antigravity-ide\\brain\\79503546-62fb-440f-bde0-2bc48e44a7a7\\owner_qa_screenshots";

async function snap() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();

  // Desktop full page
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "owner_desktop_full.png"), fullPage: true });

  // Tablet full page
  await page.setViewport({ width: 768, height: 1024 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "owner_tablet_full.png"), fullPage: true });

  // Mobile full page
  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "owner_mobile_full.png"), fullPage: true });

  await browser.close();
  console.log("Full-page screenshots captured!");
}

snap();
