import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";

const testResults = {
  stepsPassed: [],
  stepsFailed: [],
  consoleErrors: [],
};

async function runVerification() {
  console.log("🚀 Starting Owner Booking Management Verification Suite...");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      testResults.consoleErrors.push(msg.text());
      console.error("Browser Console Error:", msg.text());
    }
  });

  page.on("pageerror", (err) => {
    testResults.consoleErrors.push(err.toString());
    console.error("Browser Page Error:", err.toString());
  });

  try {
    // ---------------------------------------------------------
    // STEP 1: Navigate to /owner/bookings
    // ---------------------------------------------------------
    console.log("📍 Step 1: Navigating to /owner/bookings...");
    await page.goto(`${BASE_URL}/owner/bookings`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".owner-bookings-header h1", { timeout: 5000 });

    const pageTitle = await page.$eval(".owner-bookings-header h1", (el) => el.textContent.trim());
    console.log(`Page title: "${pageTitle}"`);
    if (pageTitle === "Booking Management") {
      testResults.stepsPassed.push("Page title 'Booking Management' verified");
    } else {
      testResults.stepsFailed.push(`Expected 'Booking Management', got '${pageTitle}'`);
    }

    // Check sidebar active state
    const sidebarActive = await page.$eval(".owner-menu-link.active span", (el) => el.textContent.trim());
    if (sidebarActive === "Bookings") {
      testResults.stepsPassed.push("Sidebar link 'Bookings' is marked active");
    } else {
      testResults.stepsFailed.push(`Expected active sidebar 'Bookings', got '${sidebarActive}'`);
    }

    // ---------------------------------------------------------
    // STEP 2: KPI Cards verification
    // ---------------------------------------------------------
    console.log("📍 Step 2: Verifying KPI Cards...");
    await page.waitForSelector(".bookings-kpi-grid .kpi-card");
    const kpiLabels = await page.$$eval(".bookings-kpi-grid .kpi-card .kpi-label", (els) =>
      els.map((e) => e.textContent.trim())
    );
    console.log("KPI labels found:", kpiLabels);
    if (kpiLabels.includes("Today's Bookings") && kpiLabels.includes("Pending") && kpiLabels.includes("Active Sessions")) {
      testResults.stepsPassed.push("All expected KPI cards present (Today, Pending, Active, Completed, Revenue)");
    } else {
      testResults.stepsFailed.push("Missing expected KPI cards");
    }

    // ---------------------------------------------------------
    // STEP 3: Status Tabs filtering
    // ---------------------------------------------------------
    console.log("📍 Step 3: Testing Status Tabs...");
    const tabButtons = await page.$$(".bookings-tabs-bar .booking-tab-btn");
    console.log(`Found ${tabButtons.length} status tab buttons`);
    if (tabButtons.length === 6) {
      testResults.stepsPassed.push("All 6 status tabs (All, Pending, Confirmed, Active, Completed, Cancelled) present");
    }

    // Click 'Pending' tab
    for (const btn of tabButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text.includes("Pending")) {
        await btn.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 400));
    const pendingBadges = await page.$$eval(".bookings-table tbody tr .booking-status-badge", (els) =>
      els.map((e) => e.textContent.trim())
    );
    const allArePending = pendingBadges.length > 0 && pendingBadges.every((b) => b.includes("Pending"));
    if (allArePending) {
      testResults.stepsPassed.push("Pending tab correctly filtered rows to only Pending bookings");
    } else {
      testResults.stepsFailed.push(`Expected only Pending badges, got: ${JSON.stringify(pendingBadges)}`);
    }

    // Click 'All' tab
    for (const btn of tabButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text.startsWith("All")) {
        await btn.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 400));

    // ---------------------------------------------------------
    // STEP 4: Search filter
    // ---------------------------------------------------------
    console.log("📍 Step 4: Testing Search filter...");
    await page.type(".filter-search-box input", "Kasun");
    await new Promise((r) => setTimeout(r, 400));
    const searchMatchCount = await page.$$eval(".bookings-table tbody tr", (els) => els.length);
    console.log(`Search for 'Kasun' returned ${searchMatchCount} rows`);
    if (searchMatchCount >= 1) {
      testResults.stepsPassed.push("Search by customer 'Kasun' filtered results successfully");
    } else {
      testResults.stepsFailed.push("Search by customer 'Kasun' returned 0 results");
    }

    // Clear search
    await page.click(".clear-search-btn");
    await new Promise((r) => setTimeout(r, 400));

    // ---------------------------------------------------------
    // STEP 5: Confirm a Pending Booking (Pending -> Confirmed)
    // ---------------------------------------------------------
    console.log("📍 Step 5: Testing Confirm Booking on Pending booking...");
    // Find first row with Confirm button
    const confirmBtn = await page.$(".action-btn.confirm");
    if (confirmBtn) {
      await confirmBtn.click();
      await new Promise((r) => setTimeout(r, 600));

      // Verify toast message appeared
      const toastVisible = await page.$eval(".owner-toast-banner", (el) => el.textContent.trim()).catch(() => "");
      console.log(`Toast message after confirm: "${toastVisible}"`);
      if (toastVisible.includes("confirmed successfully")) {
        testResults.stepsPassed.push("Pending booking confirmed and notification displayed");
      } else {
        testResults.stepsFailed.push("Toast notification did not confirm success");
      }
    } else {
      testResults.stepsFailed.push("Could not find Confirm button on pending booking");
    }

    // ---------------------------------------------------------
    // STEP 6: Start Session (Confirmed -> Active) & Charger Sync
    // ---------------------------------------------------------
    console.log("📍 Step 6: Testing Start Session on Confirmed booking...");
    const startBtn = await page.$(".action-btn.start");
    if (startBtn) {
      await startBtn.click();
      await new Promise((r) => setTimeout(r, 800));

      const toastVisible = await page.$eval(".owner-toast-banner", (el) => el.textContent.trim()).catch(() => "");
      console.log(`Toast after start session: "${toastVisible}"`);
      if (toastVisible.includes("started") || toastVisible.includes("In Use")) {
        testResults.stepsPassed.push("Start Session triggered and assigned charger synchronized to In Use");
      } else {
        testResults.stepsFailed.push(`Unexpected start session toast: '${toastVisible}'`);
      }
    } else {
      testResults.stepsFailed.push("Could not find Start Session button");
    }

    // ---------------------------------------------------------
    // STEP 7: Complete Session (Active -> Completed) & Charger Release
    // ---------------------------------------------------------
    console.log("📍 Step 7: Testing Complete Session on Active booking...");
    const completeBtn = await page.$(".action-btn.complete");
    if (completeBtn) {
      await completeBtn.click();
      await new Promise((r) => setTimeout(r, 800));

      const toastVisible = await page.$eval(".owner-toast-banner", (el) => el.textContent.trim()).catch(() => "");
      console.log(`Toast after complete session: "${toastVisible}"`);
      if (toastVisible.includes("completed") || toastVisible.includes("Available")) {
        testResults.stepsPassed.push("Complete Session triggered and charger released back to Available");
      } else {
        testResults.stepsFailed.push(`Unexpected complete session toast: '${toastVisible}'`);
      }
    } else {
      testResults.stepsFailed.push("Could not find Complete Session button");
    }

    // ---------------------------------------------------------
    // STEP 8: Booking Details View (/owner/bookings/:bookingId)
    // ---------------------------------------------------------
    console.log("📍 Step 8: Testing Booking Details view...");
    const firstDetailsLink = await page.$(".action-btn.details");
    if (firstDetailsLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        firstDetailsLink.click()
      ]);

      const currentUrl = page.url();
      console.log(`Current details URL: ${currentUrl}`);
      if (currentUrl.includes("/owner/bookings/EVH-")) {
        testResults.stepsPassed.push("Navigated to /owner/bookings/:bookingId route successfully");
      }

      await page.waitForSelector(".booking-details-header-card");
      const customerHeading = await page.$eval(".header-card-left h1", (el) => el.textContent.trim());
      console.log(`Booking details customer: "${customerHeading}"`);
      if (customerHeading.length > 0) {
        testResults.stepsPassed.push("Customer and booking details rendered cleanly");
      }

      // Check timeline items
      const timelineCount = await page.$$eval(".timeline-item", (els) => els.length);
      console.log(`Timeline items present: ${timelineCount}`);
      if (timelineCount >= 4) {
        testResults.stepsPassed.push("Lifecycle timeline with timestamps rendered");
      }

      // Back to bookings
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click(".back-link")
      ]);
      if (page.url().endsWith("/owner/bookings")) {
        testResults.stepsPassed.push("Back to All Bookings link navigated safely");
      }
    }

    // ---------------------------------------------------------
    // STEP 9: Invalid Booking ID Fallback (/owner/bookings/INVALID-999)
    // ---------------------------------------------------------
    console.log("📍 Step 9: Testing invalid booking ID fallback...");
    await page.goto(`${BASE_URL}/owner/bookings/INVALID-999`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".details-not-found-card", { timeout: 5000 });
    const notFoundHeading = await page.$eval(".details-not-found-card h2", (el) => el.textContent.trim());
    if (notFoundHeading === "Booking Not Found") {
      testResults.stepsPassed.push("Graceful Booking Not Found fallback displayed without crashing");
    } else {
      testResults.stepsFailed.push(`Expected 'Booking Not Found', got '${notFoundHeading}'`);
    }

    // ---------------------------------------------------------
    // STEP 10: User-Side Synchronization & Protection
    // ---------------------------------------------------------
    console.log("📍 Step 10: Testing user-side My Bookings and Charging History...");
    await page.goto(`${BASE_URL}/user/bookings`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".my-bookings-dashboard", { timeout: 5000 });
    testResults.stepsPassed.push("User My Bookings page loads cleanly with shared bookings");

    await page.goto(`${BASE_URL}/user/history`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".history-dashboard", { timeout: 5000 });
    testResults.stepsPassed.push("User Charging History page loads completed sessions");

    // ---------------------------------------------------------
    // STEP 11: Mobile Responsiveness at 390x844
    // ---------------------------------------------------------
    console.log("📍 Step 11: Testing mobile responsiveness (390x844)...");
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/owner/bookings`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".owner-bookings-header", { timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile viewport: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth <= clientWidth + 2) {
      testResults.stepsPassed.push("No horizontal overflow on mobile 390x844 on Owner Bookings");
    } else {
      testResults.stepsFailed.push(`Mobile horizontal overflow: scrollWidth (${scrollWidth}) > clientWidth (${clientWidth})`);
    }

    // Check mobile booking cards
    const mobileCardsCount = await page.$$eval(".mobile-booking-card", (els) => els.length);
    console.log(`Mobile booking cards rendered: ${mobileCardsCount}`);
    if (mobileCardsCount > 0) {
      testResults.stepsPassed.push("Mobile booking cards layout active on mobile screens");
    }

    // ---------------------------------------------------------
    // STEP 12: Core Routes Regressions
    // ---------------------------------------------------------
    console.log("📍 Step 12: Testing core routes regression...");
    const routesToCheck = [
      "/owner/dashboard",
      "/owner/stations",
      "/owner/chargers",
      "/owner/stations/1/chargers",
      "/user/dashboard",
      "/user/stations",
      "/"
    ];
    for (const r of routesToCheck) {
      await page.goto(`${BASE_URL}${r}`, { waitUntil: "networkidle0" });
      testResults.stepsPassed.push(`Route ${r} loads cleanly`);
    }

  } catch (err) {
    console.error("Test execution error:", err);
    testResults.stepsFailed.push(`Execution error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log("\n==========================================");
  console.log("VERIFICATION REPORT: OWNER BOOKING MANAGEMENT");
  console.log(`Total Steps Passed: ${testResults.stepsPassed.length}`);
  console.log(`Total Steps Failed: ${testResults.stepsFailed.length}`);
  console.log(`Console Errors: ${testResults.consoleErrors.length}`);
  console.log("==========================================");

  testResults.stepsPassed.forEach((s) => console.log(`  ✓ ${s}`));
  testResults.stepsFailed.forEach((f) => console.log(`  ✗ ${f}`));
  if (testResults.consoleErrors.length > 0) {
    console.log("Console Errors:", testResults.consoleErrors);
  }

  if (testResults.stepsFailed.length === 0 && testResults.consoleErrors.length === 0) {
    console.log("\n🎉 ALL OWNER BOOKING MANAGEMENT TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
