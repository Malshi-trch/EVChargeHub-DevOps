import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173/owner/dashboard";
const ARTIFACT_DIR = "C:\\Users\\haree\\.gemini\\antigravity-ide\\brain\\1a7628ca-7d48-4a66-a4d1-eb2fd57f3e1e";

async function runVisualAudit() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();

  console.log("=== 1. DESKTOP VIEWPORT (1440x900) ===");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));

  const desktopMetrics = await page.evaluate(() => {
    const sidebar = document.querySelector(".owner-sidebar");
    const mainContainer = document.querySelector(".owner-main-container");
    const header = document.querySelector(".owner-universal-header");
    const hero = document.querySelector(".dash-hero-card");

    const sbRect = sidebar ? sidebar.getBoundingClientRect() : null;
    const mcRect = mainContainer ? mainContainer.getBoundingClientRect() : null;
    const hdrRect = header ? header.getBoundingClientRect() : null;

    return {
      windowWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      sidebar: sbRect ? { left: sbRect.left, right: sbRect.right, width: sbRect.width } : null,
      mainContainer: mcRect ? { left: mcRect.left, right: mcRect.right, width: mcRect.width } : null,
      header: hdrRect ? { left: hdrRect.left, right: hdrRect.right, width: hdrRect.width } : null,
    };
  });

  console.log("Desktop Metrics:", JSON.stringify(desktopMetrics, null, 2));

  const desktopScreenshotPath = path.join(ARTIFACT_DIR, "desktop_1440_fullpage_redesigned.png");
  await page.screenshot({ path: desktopScreenshotPath, fullPage: true });
  console.log("Saved Desktop Screenshot:", desktopScreenshotPath);

  console.log("\n=== 2. MOBILE VIEWPORT (390x844) ===");
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));

  const mobileMetrics = await page.evaluate(() => {
    const sidebar = document.querySelector(".owner-sidebar");
    const mainContainer = document.querySelector(".owner-main-container");
    const hamburger = document.querySelector(".owner-header-hamburger-btn");

    return {
      windowWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      isSidebarHidden: sidebar ? window.getComputedStyle(sidebar).display === "none" : null,
      isHamburgerVisible: hamburger ? window.getComputedStyle(hamburger).display !== "none" : null,
    };
  });

  console.log("Mobile Metrics:", JSON.stringify(mobileMetrics, null, 2));

  const mobileScreenshotPath = path.join(ARTIFACT_DIR, "mobile_390_fullpage_redesigned.png");
  await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
  console.log("Saved Mobile Screenshot:", mobileScreenshotPath);

  // Test opening the mobile drawer
  console.log("\n=== 3. MOBILE DRAWER INTERACTION ===");
  const hamburgerBtn = await page.$(".owner-header-hamburger-btn");
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    const drawerScreenshotPath = path.join(ARTIFACT_DIR, "mobile_390_drawer_open.png");
    await page.screenshot({ path: drawerScreenshotPath });
    console.log("Saved Mobile Drawer Screenshot:", drawerScreenshotPath);
  }

  await browser.close();
  console.log("\nVisual audit completed successfully!");
}

runVisualAudit().catch((err) => {
  console.error("Visual audit failed:", err);
  process.exit(1);
});
