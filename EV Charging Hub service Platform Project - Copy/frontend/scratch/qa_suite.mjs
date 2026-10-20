import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";
const SCREENSHOT_DIR = "C:\\Users\\haree\\.gemini\\antigravity-ide\\brain\\79503546-62fb-440f-bde0-2bc48e44a7a7\\qa_screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop_1440", width: 1440, height: 900 },
  { name: "laptop_1024", width: 1024, height: 768 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "mobile_430", width: 430, height: 932 },
  { name: "mobile_375", width: 375, height: 812 }
];

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Login", path: "/login" },
  { name: "Register", path: "/register" },
  { name: "UserDashboard", path: "/user/dashboard" },
  { name: "FindStations", path: "/user/stations" },
  { name: "StationDetails", path: "/user/stations/1" },
  { name: "BookCharging", path: "/user/stations/1/book" },
  { name: "MyBookings", path: "/user/bookings" },
  { name: "ChargingHistory", path: "/user/history" },
  { name: "FavouriteStations", path: "/user/favourites" },
  { name: "Settings", path: "/user/settings" },
  { name: "HelpSupport", path: "/user/help" },
  { name: "OwnerDashboard", path: "/owner/dashboard" }
];

const results = {
  pagesTested: [],
  consoleErrors: [],
  consoleWarnings: [],
  overflowIssues: [],
  interactiveTests: [],
  networkFailures: []
};

async function runQA() {
  console.log("🚀 Starting Antigravity Comprehensive Automated Frontend QA Suite...");
  
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage"
    ]
  });

  const page = await browser.newPage();

  // Intercept console errors & warnings
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    // Ignore harmless Vite HMR or Leaflet map tile 404s if any
    if (type === "error") {
      results.consoleErrors.push({ url: page.url(), text });
      console.error(`[CONSOLE ERROR] (${page.url()}): ${text}`);
    } else if (type === "warning") {
      results.consoleWarnings.push({ url: page.url(), text });
    }
  });

  page.on("pageerror", (err) => {
    results.consoleErrors.push({ url: page.url(), text: err.toString() });
    console.error(`[PAGE ERROR] (${page.url()}): ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    // Ignore third party external map tiles or fonts if offline
    if (req.url().includes("tile.openstreetmap.org")) return;
    results.networkFailures.push({ url: req.url(), error: req.failure()?.errorText });
  });

  // TEST 1: Check all pages across viewports for horizontal overflow & layout health
  console.log("\n--- PHASE 1: Multi-Viewport Responsive & Overflow Audit ---");
  for (const pageDef of PAGES) {
    console.log(`\nAuditing page: ${pageDef.name} (${pageDef.path})`);
    results.pagesTested.push(pageDef.name);

    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      const targetUrl = `${BASE_URL}${pageDef.path}`;
      
      try {
        await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 12000 });
      } catch {
        // Fallback if networkidle takes longer due to leaflet tiles
        await page.waitForSelector("#root", { timeout: 5000 }).catch(() => {});
      }

      await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));

      // Measure overflow
      const overflowData = await page.evaluate((vpWidth) => {
        const docElem = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docElem.scrollWidth, body.scrollWidth);
        const clientWidth = docElem.clientWidth;
        const hasHorizontalScroll = scrollWidth > vpWidth + 1;

        let widestElements = [];
        if (hasHorizontalScroll) {
          const all = document.querySelectorAll("*");
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > vpWidth + 1 && rect.width > 0) {
              widestElements.push({
                tag: el.tagName,
                className: el.className ? String(el.className).slice(0, 50) : "",
                right: Math.round(rect.right),
                width: Math.round(rect.width)
              });
              if (widestElements.length >= 3) break;
            }
          }
        }

        return {
          scrollWidth,
          clientWidth,
          hasHorizontalScroll,
          widestElements
        };
      }, vp.width);

      if (overflowData.hasHorizontalScroll) {
        console.warn(`⚠️ OVERFLOW DETECTED: ${pageDef.name} at ${vp.name} (${vp.width}px): scrollWidth=${overflowData.scrollWidth}px`, overflowData.widestElements);
        results.overflowIssues.push({
          page: pageDef.name,
          viewport: vp.name,
          width: vp.width,
          scrollWidth: overflowData.scrollWidth,
          elements: overflowData.widestElements
        });
      } else {
        process.stdout.write(` ✓ [${vp.name}]`);
      }
    }
  }

  // TEST 2: Interactive QA Flows
  console.log("\n\n--- PHASE 2: Interactive Element & User Flow Verification ---");

  // 2.1 Home Page Mobile Menu Toggle
  console.log("Testing Home Page Mobile Hamburger Menu...");
  await page.setViewport({ width: 430, height: 932 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".mobile-menu-toggle", { timeout: 4000 });
  
  let menuOpen = await page.evaluate(() => !!document.querySelector(".nav-links.open"));
  
  await page.click(".mobile-menu-toggle");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
  menuOpen = await page.evaluate(() => !!document.querySelector(".nav-links.open"));
  console.log(`- Hamburger menu toggle: ${menuOpen ? "PASSED (opened cleanly)" : "FAILED"}`);
  results.interactiveTests.push({ test: "Home Hamburger Menu Toggle", passed: menuOpen });

  // 2.2 Navigation to Login
  console.log("Testing Login Form & Auth Navigation...");
  await page.click(".nav-links a[href='/login'], a.login-btn");
  await page.waitForSelector(".login-page", { timeout: 4000 });
  const loginUrl = page.url();
  console.log(`- Navigation to login: ${loginUrl.includes("/login") ? "PASSED" : "FAILED"}`);
  results.interactiveTests.push({ test: "Navigation to Login", passed: loginUrl.includes("/login") });

  // Fill login and submit
  await page.type("input[type='email']", "sarath@example.com");
  await page.type("input[type='password']", "password123");
  await page.click("button[type='submit']");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 800)));
  const afterLoginUrl = page.url();
  console.log(`- Login submission redirect to dashboard: ${afterLoginUrl.includes("/user/dashboard") ? "PASSED" : "FAILED"}`);
  results.interactiveTests.push({ test: "Login Form Redirect", passed: afterLoginUrl.includes("/user/dashboard") });

  // 2.3 Find Stations Search & Filtering
  console.log("Testing Find Stations Live Search & Filter Bar...");
  await page.goto(`${BASE_URL}/user/stations`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".main-station-search input", { timeout: 4000 });

  // Count initial stations
  const initialCount = await page.evaluate(() => document.querySelectorAll(".find-station-card").length);
  console.log(`- Initial stations displayed: ${initialCount}`);

  // Test live search query
  await page.type(".main-station-search input", "Southern");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  const filteredCount = await page.evaluate(() => document.querySelectorAll(".find-station-card").length);
  const filteredName = await page.evaluate(() => document.querySelector(".find-station-card h4, .find-station-card h3")?.innerText || "");
  console.log(`- Live search for 'Southern': ${filteredCount === 1 && filteredName.includes("Southern") ? "PASSED" : "FAILED"} (${filteredName})`);
  results.interactiveTests.push({ test: "Find Stations Search Filter", passed: filteredName.includes("Southern") });

  // Clear search
  await page.evaluate(() => {
    const input = document.querySelector(".main-station-search input");
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));

  // Test Favorite Toggle
  console.log("Testing Favorite Station Heart Toggle & localStorage...");
  const favBtn = await page.$(".station-favourite");
  if (favBtn) {
    await favBtn.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    const storedFavs = await page.evaluate(() => localStorage.getItem("evFavouriteStations"));
    console.log(`- Favorite saved to localStorage: ${storedFavs && storedFavs.length > 5 ? "PASSED" : "FAILED"}`);
    results.interactiveTests.push({ test: "Favorite Station Toggle", passed: !!(storedFavs && storedFavs.length > 5) });
  }

  // 2.4 End-to-End Booking Flow
  console.log("Testing Complete Booking Flow...");
  await page.goto(`${BASE_URL}/user/stations/1/book`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".time-slot-grid", { timeout: 4000 });

  // Select a time slot
  const slotClicked = await page.evaluate(() => {
    const slot = document.querySelector(".time-slot-grid button");
    if (slot) {
      slot.click();
      return true;
    }
    return false;
  });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
  console.log(`- Time slot selected: ${slotClicked ? "PASSED" : "FAILED"}`);

  // Click proceed button
  const continueBtn = await page.$(".continue-booking-button");
  if (continueBtn) {
    await continueBtn.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));
    console.log(`- Proceed to confirmation: ${page.url().includes("/confirm") ? "PASSED" : "FAILED"}`);
    results.interactiveTests.push({ test: "Booking Step to Confirmation", passed: page.url().includes("/confirm") });
  }

  // 2.5 Help FAQ Accordion Test
  console.log("Testing Help & Support FAQ Accordions...");
  await page.goto(`${BASE_URL}/user/help`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".faq-question", { timeout: 4000 });

  await page.click(".faq-question");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));

  const faqAnswerVisible = await page.evaluate(() => !!document.querySelector(".faq-answer"));
  console.log(`- FAQ accordion toggle: ${faqAnswerVisible ? "PASSED" : "FAILED"}`);
  results.interactiveTests.push({ test: "FAQ Accordion Interaction", passed: faqAnswerVisible });

  // 2.6 Owner Dashboard Tab Switching
  console.log("Testing Owner Dashboard Mobile Tab Switching...");
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/owner/dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".owner-mobile-tabs", { timeout: 4000 });

  const tabClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll(".owner-mobile-tab")).find((b) => b.innerText.includes("Stations"));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
  const sectionActive = await page.evaluate(() => document.body.innerText.includes("STATIONS"));
  console.log(`- Owner mobile tab switch: ${sectionActive ? "PASSED" : "FAILED"}`);
  results.interactiveTests.push({ test: "Owner Mobile Tab Switch", passed: sectionActive });

  // 2.7 Take sample verification screenshots
  console.log("\nCapturing QA Verification Screenshots...");
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2], VIEWPORTS[4]]) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/user/stations`, { waitUntil: "networkidle0" }).catch(() => {});
    const sPath = path.join(SCREENSHOT_DIR, `stations_${vp.name}.png`);
    await page.screenshot({ path: sPath, fullPage: false });
    console.log(`- Saved: ${sPath}`);
  }

  await browser.close();

  // Print Summary
  console.log("\n==========================================");
  console.log("        QA TEST SUITE SUMMARY             ");
  console.log("==========================================");
  console.log(`Total Pages Tested: ${results.pagesTested.length}`);
  console.log(`Console Errors: ${results.consoleErrors.length}`);
  if (results.consoleErrors.length > 0) {
    results.consoleErrors.forEach((e) => console.log(`  - ${e.url}: ${e.text}`));
  }
  console.log(`Overflow / Layout Issues: ${results.overflowIssues.length}`);
  if (results.overflowIssues.length > 0) {
    results.overflowIssues.forEach((o) => console.log(`  - ${o.page} at ${o.viewport} (${o.width}px): scrollWidth=${o.scrollWidth}px`));
  }
  console.log(`Interactive Tests: ${results.interactiveTests.filter(t => t.passed).length}/${results.interactiveTests.length} Passed`);
  results.interactiveTests.forEach(t => console.log(`  - ${t.test}: ${t.passed ? "✓ PASS" : "✗ FAIL"}`));
  console.log("==========================================");

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, "qa_results.json"),
    JSON.stringify(results, null, 2)
  );
}

runQA().catch((err) => {
  console.error("FATAL QA SUITE ERROR:", err);
  process.exit(1);
});
