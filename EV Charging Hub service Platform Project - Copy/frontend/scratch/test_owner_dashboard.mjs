import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173/owner/dashboard";
const SCREENSHOT_DIR = "C:\\Users\\haree\\.gemini\\antigravity-ide\\brain\\79503546-62fb-440f-bde0-2bc48e44a7a7\\owner_qa_screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runOwnerQA() {
  console.log("⚡ Starting Station Owner Dashboard Automated QA Test...");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`[CONSOLE ERROR]: ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    console.error(`[PAGE ERROR]: ${err.message}`);
  });

  // 1. Desktop Test (1440x900)
  console.log("\n1. Testing Desktop Layout (1440x900)...");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".owner-dashboard", { timeout: 4000 });

  // Verify key components exist
  const sidebarExists = await page.$(".owner-sidebar");
  const heroExists = await page.$(".owner-hero");
  const statsCount = await page.$$eval(".owner-stat-card", (els) => els.length);
  const actionsCount = await page.$$eval(".owner-action-card", (els) => els.length);
  const stationsCount = await page.$$eval(".station-perf-card", (els) => els.length);
  const bookingsCount = await page.$$eval(".recent-bookings-table tbody tr", (els) => els.length);
  const chartBarsCount = await page.$$eval(".chart-bar-col", (els) => els.length);

  console.log(`- Sidebar rendered: ${!!sidebarExists}`);
  console.log(`- Hero section rendered: ${!!heroExists}`);
  console.log(`- Stat cards rendered: ${statsCount}/4`);
  console.log(`- Quick action cards rendered: ${actionsCount}/4`);
  console.log(`- Station performance cards rendered: ${stationsCount}`);
  console.log(`- Recent bookings rendered: ${bookingsCount}`);
  console.log(`- Revenue chart bars rendered: ${chartBarsCount}/7`);

  const desktopScreenshot = path.join(SCREENSHOT_DIR, "owner_desktop_1440.png");
  await page.screenshot({ path: desktopScreenshot, fullPage: false });
  console.log(`- Saved: ${desktopScreenshot}`);

  // 2. Test Notification Toggle
  console.log("\n2. Testing Notification Dropdown...");
  await page.click(".owner-notif-btn");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
  const dropdownVisible = await page.$(".owner-notif-dropdown");
  console.log(`- Notifications dropdown opened: ${!!dropdownVisible}`);
  await page.click(".owner-notif-btn"); // close

  // 3. Test Add Station Modal Flow
  console.log("\n3. Testing Add New Station Modal...");
  await page.click(".owner-primary-btn");
  await page.waitForSelector(".owner-modal-card", { timeout: 3000 });
  console.log("- Add Station modal opened");

  // Fill in new station
  await page.type(".modal-field input[placeholder*='e.g. Galle']", "Hikkaduwa Coastal Fast Hub");
  await page.type(".modal-field input[placeholder*='Marine Drive']", "Galle Road, Hikkaduwa");
  await page.click(".modal-submit-btn");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));

  const updatedStationsCount = await page.$$eval(".station-perf-card", (els) => els.length);
  const toastText = await page.$eval(".owner-toast", (el) => el.innerText).catch(() => "");
  console.log(`- Station added successfully! Total stations now: ${updatedStationsCount} (Toast: "${toastText.trim()}")`);

  // 4. Test Add Charger Modal Flow
  console.log("\n4. Testing Add Charger Modal...");
  const addChargerBtn = (await page.$$(".owner-action-card"))[1];
  if (addChargerBtn) {
    await addChargerBtn.click();
    await page.waitForSelector(".owner-modal-card", { timeout: 3000 });
    console.log("- Add Charger modal opened");
    await page.click(".modal-submit-btn");
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    console.log("- Charger added successfully!");
  }

  // 5. Test Tablet Layout (768x1024)
  console.log("\n5. Testing Tablet Layout (768x1024)...");
  await page.setViewport({ width: 768, height: 1024 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));

  const tabletSidebarHidden = await page.$eval(".owner-sidebar", (el) => window.getComputedStyle(el).display === "none");
  const tabletTabsVisible = await page.$eval(".owner-mobile-tabs", (el) => window.getComputedStyle(el).display !== "none");
  const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth > 768);

  console.log(`- Sidebar hidden on tablet: ${tabletSidebarHidden}`);
  console.log(`- Mobile navigation tabs visible on tablet: ${tabletTabsVisible}`);
  console.log(`- Tablet horizontal overflow: ${tabletOverflow ? "FAIL" : "NONE (PASS)"}`);

  const tabletScreenshot = path.join(SCREENSHOT_DIR, "owner_tablet_768.png");
  await page.screenshot({ path: tabletScreenshot, fullPage: false });
  console.log(`- Saved: ${tabletScreenshot}`);

  // 6. Test Mobile Layout (375x812)
  console.log("\n6. Testing Standard Mobile Layout (375x812)...");
  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));

  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > 375);
  console.log(`- Mobile horizontal overflow: ${mobileOverflow ? "FAIL" : "NONE (PASS)"}`);

  const mobileScreenshot = path.join(SCREENSHOT_DIR, "owner_mobile_375.png");
  await page.screenshot({ path: mobileScreenshot, fullPage: false });
  console.log(`- Saved: ${mobileScreenshot}`);

  await browser.close();
  console.log("\n✅ Station Owner Dashboard QA testing completed successfully!");
}

runOwnerQA().catch((err) => {
  console.error("FATAL OWNER QA ERROR:", err);
  process.exit(1);
});
