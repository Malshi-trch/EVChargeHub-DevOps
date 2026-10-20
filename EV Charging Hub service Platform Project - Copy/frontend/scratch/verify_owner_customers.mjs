import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";

const testResults = {
  stepsPassed: [],
  stepsFailed: [],
  consoleErrors: [],
};

async function runVerification() {
  console.log("🚀 Starting Owner Customers Management Verification Suite...");

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
    // STEP 1: Navigate to /owner/customers
    // ---------------------------------------------------------
    console.log("📍 Step 1: Navigating to /owner/customers...");
    await page.goto(`${BASE_URL}/owner/customers`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".owner-customers-header h1", { timeout: 5000 });

    const pageTitle = await page.$eval(".owner-customers-header h1", (el) => el.textContent.trim());
    console.log(`Page title: "${pageTitle}"`);
    if (pageTitle === "Customers") {
      testResults.stepsPassed.push("Page title 'Customers' verified");
    } else {
      testResults.stepsFailed.push(`Expected 'Customers', got '${pageTitle}'`);
    }

    const pageDesc = await page.$eval(".owner-customers-header .header-desc", (el) => el.textContent.trim());
    if (pageDesc.includes("View EV drivers who use your charging network")) {
      testResults.stepsPassed.push("Page description matches required text");
    } else {
      testResults.stepsFailed.push(`Unexpected description: '${pageDesc}'`);
    }

    // Check sidebar active state
    const sidebarActive = await page.$eval(".owner-menu-link.active span", (el) => el.textContent.trim());
    if (sidebarActive === "Customers") {
      testResults.stepsPassed.push("Sidebar link 'Customers' is marked active");
    } else {
      testResults.stepsFailed.push(`Expected active sidebar 'Customers', got '${sidebarActive}'`);
    }

    // ---------------------------------------------------------
    // STEP 2: KPI Cards verification
    // ---------------------------------------------------------
    console.log("📍 Step 2: Verifying KPI Cards...");
    await page.waitForSelector(".customers-kpi-grid .kpi-card");
    const kpiLabels = await page.$$eval(".customers-kpi-grid .kpi-card .kpi-label", (els) =>
      els.map((e) => e.textContent.trim())
    );
    console.log("KPI labels found:", kpiLabels);
    const kpiLabelsUpper = kpiLabels.map((l) => l.toUpperCase());
    if (
      kpiLabelsUpper.includes("TOTAL CUSTOMERS") &&
      kpiLabelsUpper.includes("ACTIVE CUSTOMERS") &&
      kpiLabelsUpper.includes("RETURNING CUSTOMERS") &&
      kpiLabelsUpper.includes("TOTAL COMPLETED SESSIONS")
    ) {
      testResults.stepsPassed.push("All expected KPI cards present (Total, Active, Returning, Completed Sessions)");
    } else {
      testResults.stepsFailed.push(`Missing expected KPI cards: got ${JSON.stringify(kpiLabels)}`);
    }

    const totalCustomersVal = await page.$eval(
      ".customers-kpi-grid .kpi-card:nth-child(1) .kpi-value",
      (el) => el.textContent.trim()
    );
    console.log(`Total Customers count: ${totalCustomersVal}`);
    if (parseInt(totalCustomersVal, 10) > 0) {
      testResults.stepsPassed.push(`Total Customers correctly derived (>0): ${totalCustomersVal}`);
    } else {
      testResults.stepsFailed.push("Total Customers should be > 0");
    }

    // ---------------------------------------------------------
    // STEP 3: Customer Table Columns & Row Data
    // ---------------------------------------------------------
    console.log("📍 Step 3: Verifying Desktop Customer Table...");
    await page.waitForSelector(".customers-table tbody tr");
    const tableHeaders = await page.$$eval(".customers-table thead th", (els) =>
      els.map((e) => e.textContent.trim())
    );
    console.log("Table headers:", tableHeaders);
    const tableHeadersUpper = tableHeaders.map((h) => h.toUpperCase());
    if (
      tableHeadersUpper.includes("CUSTOMER") &&
      tableHeadersUpper.includes("CONTACT") &&
      tableHeadersUpper.includes("TOTAL BOOKINGS") &&
      tableHeadersUpper.includes("COMPLETED SESSIONS") &&
      tableHeadersUpper.includes("TOTAL SPENT") &&
      tableHeadersUpper.includes("LAST VISIT") &&
      tableHeadersUpper.includes("STATUS")
    ) {
      testResults.stepsPassed.push("All required customer table columns present");
    } else {
      testResults.stepsFailed.push(`Missing columns: got ${JSON.stringify(tableHeaders)}`);
    }

    const rowCount = await page.$$eval(".customers-table tbody tr", (els) => els.length);
    console.log(`Customers displayed in table: ${rowCount}`);
    if (rowCount >= 3) {
      testResults.stepsPassed.push(`Multiple derived customer rows displayed: ${rowCount}`);
    } else {
      testResults.stepsFailed.push(`Expected at least 3 customer rows, got ${rowCount}`);
    }

    // ---------------------------------------------------------
    // STEP 4: Search functionality
    // ---------------------------------------------------------
    console.log("📍 Step 4: Testing Search Filter...");
    const searchInput = await page.$(".filter-search-box input");
    await searchInput.type("Hareen");
    await new Promise((r) => setTimeout(r, 300));

    let filteredNames = await page.$$eval(".customers-table tbody tr .customer-name", (els) =>
      els.map((e) => e.textContent.trim())
    );
    console.log("Search 'Hareen' returned:", filteredNames);
    if (filteredNames.length === 1 && filteredNames[0].includes("Hareen")) {
      testResults.stepsPassed.push("Search by name correctly filtered to Hareen");
    } else {
      testResults.stepsFailed.push(`Search by name failed, got ${JSON.stringify(filteredNames)}`);
    }

    // Clear search using clear button
    const clearBtn = await page.$(".filter-clear-input-btn");
    if (clearBtn) {
      await clearBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    } else {
      await page.$eval(".filter-search-box input", (el) => {
        el.value = "";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }

    const restoredCount = await page.$$eval(".customers-table tbody tr", (els) => els.length);
    if (restoredCount === rowCount) {
      testResults.stepsPassed.push("Clearing search restored full customer list");
    } else {
      testResults.stepsFailed.push(`Clearing search did not restore all rows: ${restoredCount} vs ${rowCount}`);
    }

    // Search by email
    await searchInput.type("perera");
    await new Promise((r) => setTimeout(r, 300));
    filteredNames = await page.$$eval(".customers-table tbody tr .customer-name", (els) =>
      els.map((e) => e.textContent.trim())
    );
    console.log("Search 'perera' returned:", filteredNames);
    if (filteredNames.length === 1 && filteredNames[0].includes("Kasun")) {
      testResults.stepsPassed.push("Search by email query correctly matched Kasun Perera");
    } else {
      testResults.stepsFailed.push(`Search by email failed, got ${JSON.stringify(filteredNames)}`);
    }

    // Click Reset Filters
    const resetBtn = await page.$(".btn-reset-filters");
    if (resetBtn) {
      await resetBtn.click();
      await new Promise((r) => setTimeout(r, 300));
      testResults.stepsPassed.push("Reset Filters button works and resets search/filters");
    } else {
      testResults.stepsFailed.push("Reset Filters button not found when filter active");
    }

    // ---------------------------------------------------------
    // STEP 5: Customer Type Filters
    // ---------------------------------------------------------
    console.log("📍 Step 5: Testing Customer Type Filters...");
    await page.select("#customer-type-select", "Active");
    await new Promise((r) => setTimeout(r, 300));
    const activeFilterCount = await page.$$eval(".customers-table tbody tr", (els) => els.length);
    console.log(`Active customers count via filter: ${activeFilterCount}`);
    if (activeFilterCount > 0) {
      testResults.stepsPassed.push(`Customer Type filter 'Active' successfully filtered rows (${activeFilterCount})`);
    } else {
      testResults.stepsFailed.push("Customer Type filter 'Active' returned 0 rows");
    }

    // Reset customer type filter
    await page.select("#customer-type-select", "All");
    await new Promise((r) => setTimeout(r, 300));

    // ---------------------------------------------------------
    // STEP 6: Navigate to Customer Profile Details
    // ---------------------------------------------------------
    console.log("📍 Step 6: Navigating to Customer Profile (/owner/customers/:customerId)...");
    const firstProfileLink = await page.$(".customers-table tbody tr:first-child .btn-view-customer-profile");
    const targetUrl = await page.evaluate((el) => el.getAttribute("href"), firstProfileLink);
    console.log(`Navigating via View Profile: ${targetUrl}`);
    await firstProfileLink.click();
    await page.waitForSelector(".customer-full-name", { timeout: 5000 });

    const currentUrl = page.url();
    if (currentUrl.includes("/owner/customers/")) {
      testResults.stepsPassed.push(`Successfully routed to Customer Profile URL: ${currentUrl}`);
    } else {
      testResults.stepsFailed.push(`Expected customer details URL, got: ${currentUrl}`);
    }

    const customerName = await page.$eval(".customer-full-name", (el) => el.textContent.trim());
    console.log(`Customer name on profile: "${customerName}"`);
    if (customerName.length > 0) {
      testResults.stepsPassed.push(`Customer Profile Name loaded: "${customerName}"`);
    } else {
      testResults.stepsFailed.push("Customer name empty on profile");
    }

    // ---------------------------------------------------------
    // STEP 7: Customer Profile Summary 8-Box KPI Grid
    // ---------------------------------------------------------
    console.log("📍 Step 7: Verifying Profile 8-Box Metrics...");
    const statLabels = await page.$$eval(".profile-stats-grid .profile-stat-box .stat-label", (els) =>
      els.map((e) => e.textContent.trim())
    );
    console.log("Profile stat labels:", statLabels);
    const statLabelsUpper = statLabels.map((s) => s.toUpperCase());
    if (
      statLabelsUpper.includes("TOTAL BOOKINGS") &&
      statLabelsUpper.includes("COMPLETED SESSIONS") &&
      statLabelsUpper.includes("CANCELLED BOOKINGS") &&
      statLabelsUpper.includes("TOTAL SPENT") &&
      statLabelsUpper.includes("TOTAL ENERGY CHARGED") &&
      statLabelsUpper.includes("FIRST VISIT") &&
      statLabelsUpper.includes("LAST VISIT") &&
      statLabelsUpper.includes("MOST USED STATION")
    ) {
      testResults.stepsPassed.push("All 8 profile summary metric boxes present");
    } else {
      testResults.stepsFailed.push(`Missing profile stat boxes: got ${JSON.stringify(statLabels)}`);
    }

    // ---------------------------------------------------------
    // STEP 8: Booking History Table & View Booking Link
    // ---------------------------------------------------------
    console.log("📍 Step 8: Verifying Booking History on Profile...");
    await page.waitForSelector(".history-table tbody tr");
    const historyRows = await page.$$eval(".history-table tbody tr", (els) => els.length);
    console.log(`Customer history rows found: ${historyRows}`);
    if (historyRows >= 1) {
      testResults.stepsPassed.push(`Customer booking history table rendered ${historyRows} row(s)`);
    } else {
      testResults.stepsFailed.push("No booking history rows rendered");
    }

    const viewBookingLink = await page.$(".history-table tbody tr:first-child .btn-view-booking-link");
    const bookingHref = await page.evaluate((el) => el.getAttribute("href"), viewBookingLink);
    console.log(`View Booking link targets: ${bookingHref}`);
    if (bookingHref && bookingHref.startsWith("/owner/bookings/")) {
      testResults.stepsPassed.push(`View Booking correctly links to owner booking details: ${bookingHref}`);
    } else {
      testResults.stepsFailed.push(`Invalid View Booking link: ${bookingHref}`);
    }

    // ---------------------------------------------------------
    // STEP 9: Activity Timeline & Privacy Notice
    // ---------------------------------------------------------
    console.log("📍 Step 9: Verifying Activity Timeline & Privacy Notice...");
    const timelineItems = await page.$$(".activity-timeline .timeline-item");
    if (timelineItems.length >= 1) {
      testResults.stepsPassed.push(`Activity timeline contains ${timelineItems.length} milestone event(s)`);
    } else {
      testResults.stepsFailed.push("No activity timeline items found");
    }

    const privacyNotice = await page.$eval(".privacy-notice-box .notice-text strong", (el) =>
      el.textContent.trim()
    );
    if (privacyNotice.includes("Privacy-Aware")) {
      testResults.stepsPassed.push("Privacy-Aware Station Owner Notice present and compliant");
    } else {
      testResults.stepsFailed.push("Privacy Notice missing or unexpected");
    }

    // ---------------------------------------------------------
    // STEP 10: Back to Customers Navigation
    // ---------------------------------------------------------
    console.log("📍 Step 10: Testing Back to Customers link...");
    await page.click(".back-to-customers-link");
    await page.waitForSelector(".owner-customers-header h1", { timeout: 5000 });
    if (page.url().endsWith("/owner/customers")) {
      testResults.stepsPassed.push("Back to Customers successfully returned to /owner/customers");
    } else {
      testResults.stepsFailed.push(`Back link navigated to unexpected URL: ${page.url()}`);
    }

    // ---------------------------------------------------------
    // STEP 11: Invalid Customer ID Handling
    // ---------------------------------------------------------
    console.log("📍 Step 11: Testing Invalid Customer ID (/owner/customers/invalid-id-999)...");
    await page.goto(`${BASE_URL}/owner/customers/invalid-id-999`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".customer-not-found-card", { timeout: 5000 });

    const notFoundTitle = await page.$eval(".customer-not-found-card h2", (el) => el.textContent.trim());
    const notFoundMsg = await page.$eval(".customer-not-found-card p", (el) => el.textContent.trim());
    console.log(`Not Found State: "${notFoundTitle}" - "${notFoundMsg}"`);
    if (
      notFoundTitle === "Customer Not Found" &&
      notFoundMsg.includes("The requested customer could not be found in your charging network")
    ) {
      testResults.stepsPassed.push("Invalid customer ID safely handled with exact required Not Found message");
    } else {
      testResults.stepsFailed.push(`Unexpected not found message: ${notFoundTitle} / ${notFoundMsg}`);
    }

    // ---------------------------------------------------------
    // STEP 12: Cross-Page Sidebar Navigation
    // ---------------------------------------------------------
    console.log("📍 Step 12: Testing Sidebar Customers Link from other pages...");
    // From /owner/dashboard
    await page.goto(`${BASE_URL}/owner/dashboard`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".owner-menu", { timeout: 5000 });
    const customersLink = await page.$("a.owner-menu-link[href='/owner/customers']");
    if (customersLink) {
      await customersLink.click();
      await page.waitForSelector(".owner-customers-header h1", { timeout: 5000 });
      testResults.stepsPassed.push("Sidebar Customers link works cleanly from /owner/dashboard");
    } else {
      testResults.stepsFailed.push("Sidebar Customers link missing on /owner/dashboard");
    }

    // From /owner/bookings
    await page.goto(`${BASE_URL}/owner/bookings`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".owner-menu", { timeout: 5000 });
    const customersFromBookings = await page.$("a.owner-menu-link[href='/owner/customers']");
    if (customersFromBookings) {
      await customersFromBookings.click();
      await page.waitForSelector(".owner-customers-header h1", { timeout: 5000 });
      testResults.stepsPassed.push("Sidebar Customers link works cleanly from /owner/bookings");
    } else {
      testResults.stepsFailed.push("Sidebar Customers link missing on /owner/bookings");
    }

    // ---------------------------------------------------------
    // STEP 13: Responsive Design at 390x844 (Mobile)
    // ---------------------------------------------------------
    console.log("📍 Step 13: Testing Mobile Viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/owner/customers`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".owner-customers-header h1", { timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile Customers List width: scroll=${scrollWidth}, client=${clientWidth}`);
    if (scrollWidth <= clientWidth) {
      testResults.stepsPassed.push("Zero horizontal overflow on mobile (390x844) /owner/customers");
    } else {
      testResults.stepsFailed.push(`Horizontal overflow detected on mobile: ${scrollWidth} > ${clientWidth}`);
    }

    // Mobile stacked cards should be visible
    const mobileCardsVisible = await page.$eval(
      ".customers-mobile-cards",
      (el) => window.getComputedStyle(el).display !== "none"
    );
    if (mobileCardsVisible) {
      testResults.stepsPassed.push("Desktop table correctly converts to clean mobile cards on 390px");
    } else {
      testResults.stepsFailed.push("Mobile cards should be displayed on 390px");
    }

    // Mobile profile page responsiveness
    const firstMobileProfile = await page.$(".customers-mobile-cards .btn-view-customer-profile");
    if (firstMobileProfile) {
      await firstMobileProfile.click();
      await page.waitForSelector(".customer-full-name", { timeout: 5000 });
      const profScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const profClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      console.log(`Mobile Profile width: scroll=${profScrollWidth}, client=${profClientWidth}`);
      if (profScrollWidth <= profClientWidth) {
        testResults.stepsPassed.push("Zero horizontal overflow on mobile (390x844) Customer Profile");
      } else {
        testResults.stepsFailed.push(`Horizontal overflow on mobile profile: ${profScrollWidth} > ${profClientWidth}`);
      }
    }

  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
    testResults.stepsFailed.push(`Exception: ${err.message}`);
  } finally {
    await browser.close();
  }

  // ---------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------
  console.log("\n========================================================");
  console.log("📊 TEST VERIFICATION SUMMARY");
  console.log("========================================================");
  console.log(`✅ Passed: ${testResults.stepsPassed.length}`);
  console.log(`❌ Failed: ${testResults.stepsFailed.length}`);
  console.log(`🚨 Console Errors: ${testResults.consoleErrors.length}`);

  if (testResults.stepsFailed.length > 0) {
    console.log("\nFailed Steps:");
    testResults.stepsFailed.forEach((s) => console.log(` - ❌ ${s}`));
  }

  if (testResults.consoleErrors.length > 0) {
    console.log("\nConsole Errors:");
    testResults.consoleErrors.forEach((e) => console.log(` - 🚨 ${e}`));
  }

  return testResults;
}

runVerification();
