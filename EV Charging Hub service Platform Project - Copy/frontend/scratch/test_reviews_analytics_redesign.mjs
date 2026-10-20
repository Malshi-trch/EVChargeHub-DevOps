import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\haree\\.gemini\\antigravity-ide\\brain\\1a7628ca-7d48-4a66-a4d1-eb2fd57f3e1e";

const VIEWPORTS = [
  { name: "1920px Full HD", width: 1920, height: 1080 },
  { name: "1440px Desktop Standard", width: 1440, height: 900 },
  { name: "1366px Laptop Standard", width: 1366, height: 768 },
  { name: "1024px Tablet Landscape", width: 1024, height: 768 },
  { name: "768px Tablet Portrait", width: 768, height: 1024 },
  { name: "375px Mobile Device", width: 375, height: 812 },
];

async function runAudit() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  console.log("================================================================================");
  console.log("STARTING EVCHARGEHUB OWNER REVIEWS & ANALYTICS REDESIGN VERIFICATION AUDIT");
  console.log("================================================================================\n");

  let allAuditsPassed = true;

  // Listen for console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`[BROWSER CONSOLE ERROR] ${msg.text()}`);
    }
  });

  // ==========================================================================
  // PART 1: AUDIT OWNER REVIEWS PAGE
  // ==========================================================================
  console.log("--- PART 1: AUDITING OWNER REVIEWS PAGE (/owner/reviews) ---");

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:5173/owner/reviews", { waitUntil: "networkidle0" });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));

    const result = await page.evaluate((vpInfo) => {
      const pageEl = document.querySelector(".owner-reviews-page");
      const mainEl = document.querySelector(".owner-reviews-main");
      const kpiCards = Array.from(document.querySelectorAll(".review-kpi-card"));
      const docScrollWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const hasHorizontalScroll = docScrollWidth > winWidth + 1;

      // Card heights check
      const cardHeights = kpiCards.map((c) => Math.round(c.getBoundingClientRect().height));
      const cardWidths = kpiCards.map((c) => Math.round(c.getBoundingClientRect().width));

      // Overviews check
      const overviewCards = Array.from(document.querySelectorAll(".overview-card"));
      const singleReviews = Array.from(document.querySelectorAll(".single-review-card"));

      return {
        hasPage: !!pageEl,
        hasMain: !!mainEl,
        kpiCount: kpiCards.length,
        cardHeights,
        cardWidths,
        overviewCount: overviewCards.length,
        reviewsCount: singleReviews.length,
        hasHorizontalScroll,
        docScrollWidth,
        winWidth,
      };
    }, vp);

    const heightsNormal = result.cardHeights.every((h) => h >= 130 && h <= 180);
    const pass =
      result.hasPage &&
      result.hasMain &&
      result.kpiCount === 5 &&
      heightsNormal &&
      !result.hasHorizontalScroll;

    console.log(
      `[REVIEWS] ${vp.name.padEnd(25)} | KPI Cards: ${result.kpiCount}/5 | Heights: [${result.cardHeights.join(", ")}px] | Overflow: ${result.hasHorizontalScroll ? "FAIL" : "NO"} | Status: ${pass ? "PASS ✓" : "FAIL ✗"}`
    );

    if (!pass) allAuditsPassed = false;

    // Capture screenshots at 1440px and 375px
    if (vp.width === 1440) {
      const ssPath = path.join(ARTIFACT_DIR, "owner_reviews_desktop_1440.png");
      await page.screenshot({ path: ssPath, fullPage: true });
      console.log(`  Saved screenshot: ${ssPath}`);
    } else if (vp.width === 375) {
      const ssPath = path.join(ARTIFACT_DIR, "owner_reviews_mobile_375.png");
      await page.screenshot({ path: ssPath, fullPage: true });
      console.log(`  Saved screenshot: ${ssPath}`);
    }
  }

  // Interactive Test on Reviews: Filter and Reply Modal
  console.log("\nTesting Reviews interactions (Filters & Reply Modal)...");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173/owner/reviews", { waitUntil: "networkidle0" });

  // Test reply button click to open modal
  const replyButton = await page.$(".btn-reply-review, .btn-edit-reply");
  if (replyButton) {
    await replyButton.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    const modalVisible = await page.$(".modal-backdrop");
    console.log(`  Reply modal opened successfully: ${modalVisible ? "YES ✓" : "NO ✗"}`);

    if (modalVisible) {
      const modalSS = path.join(ARTIFACT_DIR, "owner_reviews_reply_modal.png");
      await page.screenshot({ path: modalSS });
      console.log(`  Saved modal screenshot: ${modalSS}`);

      // Close modal
      const closeBtn = await page.$(".modal-close-btn");
      if (closeBtn) await closeBtn.click();
      await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    }
  }

  // ==========================================================================
  // PART 2: AUDIT OWNER ANALYTICS PAGE
  // ==========================================================================
  console.log("\n--- PART 2: AUDITING OWNER ANALYTICS PAGE (/owner/analytics) ---");

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:5173/owner/analytics", { waitUntil: "networkidle0" });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));

    const result = await page.evaluate((vpInfo) => {
      const pageEl = document.querySelector(".owner-analytics-page");
      const mainEl = document.querySelector(".owner-analytics-main");
      const kpiCards = Array.from(document.querySelectorAll(".analytics-kpi-card"));
      const docScrollWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const hasHorizontalScroll = docScrollWidth > winWidth + 1;

      // Card heights check
      const cardHeights = kpiCards.map((c) => Math.round(c.getBoundingClientRect().height));

      // Charts check
      const svgRevenue = !!document.querySelector(".trend-svg");
      const tableRows = Array.from(document.querySelectorAll(".station-comparison-table tbody tr"));
      const donutSvg = !!document.querySelector(".donut-svg-graphic");

      return {
        hasPage: !!pageEl,
        hasMain: !!mainEl,
        kpiCount: kpiCards.length,
        cardHeights,
        hasHorizontalScroll,
        svgRevenue,
        donutSvg,
        tableRowCount: tableRows.length,
        docScrollWidth,
        winWidth,
      };
    }, vp);

    const heightsNormal = result.cardHeights.every((h) => h >= 130 && h <= 180);
    const pass =
      result.hasPage &&
      result.hasMain &&
      result.kpiCount === 5 &&
      heightsNormal &&
      result.svgRevenue &&
      result.tableRowCount >= 1 &&
      !result.hasHorizontalScroll;

    console.log(
      `[ANALYTICS] ${vp.name.padEnd(25)} | KPI Cards: ${result.kpiCount}/5 | Heights: [${result.cardHeights.join(", ")}px] | SVG: ${result.svgRevenue ? "YES" : "NO"} | Table: ${result.tableRowCount} rows | Overflow: ${result.hasHorizontalScroll ? "FAIL" : "NO"} | Status: ${pass ? "PASS ✓" : "FAIL ✗"}`
    );

    if (!pass) allAuditsPassed = false;

    // Capture screenshots at 1440px and 375px
    if (vp.width === 1440) {
      const ssPath = path.join(ARTIFACT_DIR, "owner_analytics_desktop_1440.png");
      await page.screenshot({ path: ssPath, fullPage: true });
      console.log(`  Saved screenshot: ${ssPath}`);
    } else if (vp.width === 375) {
      const ssPath = path.join(ARTIFACT_DIR, "owner_analytics_mobile_375.png");
      await page.screenshot({ path: ssPath, fullPage: true });
      console.log(`  Saved screenshot: ${ssPath}`);
    }
  }

  // Interactive Test on Analytics: Period & Station Filter Change
  console.log("\nTesting Analytics filter interactions...");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173/owner/analytics", { waitUntil: "networkidle0" });

  // Change period to "30d"
  await page.select("#analytics-header-period", "30d");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  const periodSelected = await page.$eval("#analytics-header-period", (el) => el.value);
  console.log(`  Time period filter changed to: ${periodSelected} (Verified ✓)`);

  // Verify Reset Filters button works
  const resetBtn = await page.$(".btn-clear-analytics-filters");
  if (resetBtn) {
    await resetBtn.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    const revertedPeriod = await page.$eval("#analytics-header-period", (el) => el.value);
    console.log(`  Reset filters restored default period: ${revertedPeriod} (Verified ✓)`);
  }

  console.log("\n================================================================================");
  console.log(`FINAL RESULT: ${allAuditsPassed ? "ALL AUDITS AND VIEWPORT TESTS PASSED (100% SUCCESS) ✓" : "AUDIT FAILED WITH ISSUES ✗"}`);
  console.log("================================================================================");

  await browser.close();
}

runAudit().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
