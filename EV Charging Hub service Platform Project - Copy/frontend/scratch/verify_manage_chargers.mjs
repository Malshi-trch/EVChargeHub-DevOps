import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";

const testResults = {
  stepsPassed: [],
  stepsFailed: [],
  consoleErrors: [],
};

async function runVerification() {
  console.log("🚀 Starting Owner - Manage Chargers Verification Suite...");

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
    // STEP 1: Navigate to /owner/stations/1/chargers
    // ---------------------------------------------------------
    console.log("📍 Step 1: Navigating to /owner/stations/1/chargers...");
    await page.goto(`${BASE_URL}/owner/stations/1/chargers`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".chargers-header h1", { timeout: 5000 });

    const pageTitle = await page.$eval(".chargers-header h1", (el) => el.textContent.trim());
    console.log(`Page title: "${pageTitle}"`);
    if (pageTitle === "Manage Chargers") {
      testResults.stepsPassed.push("Page title 'Manage Chargers' verified");
    } else {
      testResults.stepsFailed.push(`Expected 'Manage Chargers', got '${pageTitle}'`);
    }

    const stationSubtitle = await page.$eval(".station-subtitle strong", (el) => el.textContent.trim());
    console.log(`Station subtitle: "${stationSubtitle}"`);
    if (stationSubtitle.includes("Ruhuna")) {
      testResults.stepsPassed.push("Station subtitle contains 'Ruhuna'");
    } else {
      testResults.stepsFailed.push(`Expected Ruhuna in subtitle, got '${stationSubtitle}'`);
    }

    // ---------------------------------------------------------
    // STEP 2: KPI Cards verification
    // ---------------------------------------------------------
    console.log("📍 Step 2: Verifying 4 KPI Cards...");
    await page.waitForSelector(".chargers-kpi-grid .kpi-card");
    const kpiValues = await page.$$eval(".chargers-kpi-grid .kpi-card .kpi-value", (els) =>
      els.map((e) => parseInt(e.textContent.trim(), 10))
    );
    console.log("KPI values (Total, Available, In Use, Maint/Offline):", kpiValues);
    const [totalKpi, availKpi, inUseKpi, offMaintKpi] = kpiValues;

    if (totalKpi >= 6 && totalKpi === availKpi + inUseKpi + offMaintKpi) {
      testResults.stepsPassed.push(`KPI values balanced: ${totalKpi} = ${availKpi} + ${inUseKpi} + ${offMaintKpi}`);
    } else {
      testResults.stepsFailed.push(`KPI values do not balance: Total=${totalKpi}, sum=${availKpi + inUseKpi + offMaintKpi}`);
    }

    // ---------------------------------------------------------
    // STEP 3: Search Functionality
    // ---------------------------------------------------------
    console.log("📍 Step 3: Testing Search Filter...");
    await page.type(".filter-search-box input", "CP-001");
    await new Promise((r) => setTimeout(r, 400));
    const cardCountSearch = await page.$$eval(".charger-card", (els) => els.length);
    console.log(`Chargers matching "CP-001": ${cardCountSearch}`);
    if (cardCountSearch === 1) {
      testResults.stepsPassed.push("Search by ID CP-001 filtered to exactly 1 charger");
    } else {
      testResults.stepsFailed.push(`Expected 1 match for CP-001, got ${cardCountSearch}`);
    }

    // Clear search
    await page.click(".clear-search-btn");
    await new Promise((r) => setTimeout(r, 400));
    const cardCountCleared = await page.$$eval(".charger-card", (els) => els.length);
    if (cardCountCleared === totalKpi) {
      testResults.stepsPassed.push("Clear search restored all chargers");
    } else {
      testResults.stepsFailed.push(`Expected ${totalKpi} after clear, got ${cardCountCleared}`);
    }

    // ---------------------------------------------------------
    // STEP 4: Status Filter Pills
    // ---------------------------------------------------------
    console.log("📍 Step 4: Testing Status Filter Pills...");
    const filterPills = await page.$$(".status-filter-pills .filter-pill");
    // Click "In Use"
    for (const pill of filterPills) {
      const text = await page.evaluate((el) => el.textContent, pill);
      if (text.includes("In Use")) {
        await pill.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 400));
    const inUseCountFiltered = await page.$$eval(".charger-card", (els) => els.length);
    console.log(`Filtered 'In Use' count: ${inUseCountFiltered}`);
    if (inUseCountFiltered === inUseKpi) {
      testResults.stepsPassed.push(`Filter 'In Use' matches KPI in-use count (${inUseKpi})`);
    } else {
      testResults.stepsFailed.push(`Expected ${inUseKpi} for In Use, got ${inUseCountFiltered}`);
    }

    // Reset filters
    const resetBtn = await page.$(".reset-filters-btn");
    if (resetBtn) await resetBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // ---------------------------------------------------------
    // STEP 5: Quick Status Change
    // ---------------------------------------------------------
    console.log("📍 Step 5: Testing Quick Status Change on CP-001...");
    // Find select for CP-001
    const cp1Select = await page.$("#quick-status-CP-001");
    if (cp1Select) {
      await page.select("#quick-status-CP-001", "Maintenance");
      await new Promise((r) => setTimeout(r, 600));

      const newAvailKpi = await page.$eval(
        ".chargers-kpi-grid .kpi-card:nth-child(2) .kpi-value",
        (el) => parseInt(el.textContent.trim(), 10)
      );
      console.log(`Available KPI after changing CP-001 to Maintenance: ${newAvailKpi} (was ${availKpi})`);
      if (newAvailKpi === availKpi - 1) {
        testResults.stepsPassed.push("Quick status change to Maintenance decreased Available KPI by 1");
      } else {
        testResults.stepsFailed.push(`Expected Available KPI ${availKpi - 1}, got ${newAvailKpi}`);
      }

      // Revert CP-001 back to Available
      await page.select("#quick-status-CP-001", "Available");
      await new Promise((r) => setTimeout(r, 600));
      testResults.stepsPassed.push("Reverted CP-001 back to Available");
    } else {
      testResults.stepsFailed.push("Could not find quick status selector for CP-001");
    }

    // ---------------------------------------------------------
    // STEP 6: In Use Removal Protection
    // ---------------------------------------------------------
    console.log("📍 Step 6: Testing In-Use removal protection...");
    const inUseCards = await page.$$(".charger-card");
    let foundInUseProtected = false;
    for (const card of inUseCards) {
      const text = await page.evaluate((el) => el.textContent, card);
      if (text.includes("In Use")) {
        const removeBtn = await card.$(".charger-action-btn.remove");
        const isDisabled = await page.evaluate((el) => el.disabled || el.classList.contains("disabled"), removeBtn);
        if (isDisabled) {
          foundInUseProtected = true;
          break;
        }
      }
    }
    if (foundInUseProtected) {
      testResults.stepsPassed.push("In-Use charger remove action is safely disabled");
    } else {
      testResults.stepsFailed.push("In-Use charger remove action was not disabled");
    }

    // ---------------------------------------------------------
    // STEP 7: Add New Charger (+ Add Charger Modal)
    // ---------------------------------------------------------
    console.log("📍 Step 7: Testing Add Charger Modal...");
    await page.click(".primary-add-charger-btn");
    await page.waitForSelector(".charger-modal-card", { timeout: 3000 });

    // Try submitting with duplicate ID CP-001
    await page.click("#charger-form-id");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#charger-form-id", "CP-001");
    await page.click(".modal-submit-btn");
    await new Promise((r) => setTimeout(r, 400));

    const idErrMsg = await page.$eval(".form-group:nth-child(1) .err-msg", (el) => el.textContent.trim()).catch(() => "");
    if (idErrMsg.includes("already exists")) {
      testResults.stepsPassed.push("Duplicate Charger ID validation correctly triggered");
    } else {
      testResults.stepsFailed.push(`Expected duplicate error message, got: '${idErrMsg}'`);
    }

    // Now fill valid values
    await page.click("#charger-form-id");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#charger-form-id", "CP-TEST-099");

    await page.click("#charger-form-name");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#charger-form-name", "Bay 99 - Fast Charger");

    await page.select("#charger-form-connector", "CCS");

    await page.click("#charger-form-power");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#charger-form-power", "180");

    await page.select("#charger-form-status", "Available");

    await page.click(".modal-submit-btn");
    await new Promise((r) => setTimeout(r, 600));

    // Verify CP-TEST-099 is present in list
    const addedChargerExists = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll(".charger-id-badge strong")).map((e) => e.textContent.trim());
      return ids.includes("CP-TEST-099");
    });
    if (addedChargerExists) {
      testResults.stepsPassed.push("New charger CP-TEST-099 successfully created and rendered in list");
    } else {
      testResults.stepsFailed.push("New charger CP-TEST-099 not found in list after submit");
    }

    // ---------------------------------------------------------
    // STEP 8: Edit Charger
    // ---------------------------------------------------------
    console.log("📍 Step 8: Testing Edit Charger on CP-TEST-099...");
    // Filter for CP-TEST-099
    await page.type(".filter-search-box input", "CP-TEST-099");
    await new Promise((r) => setTimeout(r, 400));

    await page.click(".charger-action-btn.edit");
    await page.waitForSelector(".charger-modal-card", { timeout: 3000 });

    // Update name to "Bay 99 - Ultra Fast 200kW"
    await page.click("#charger-form-name");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#charger-form-name", "Bay 99 - Ultra Fast 200kW");

    await page.click(".modal-submit-btn");
    await new Promise((r) => setTimeout(r, 600));

    // Clear search filter
    await page.click(".clear-search-btn");
    await new Promise((r) => setTimeout(r, 400));

    const editedTitleFound = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll(".charger-title")).map((e) => e.textContent.trim());
      return titles.includes("Bay 99 - Ultra Fast 200kW");
    });
    if (editedTitleFound) {
      testResults.stepsPassed.push("Charger CP-TEST-099 updated successfully in-place");
    } else {
      testResults.stepsFailed.push("Edited title 'Bay 99 - Ultra Fast 200kW' not found in list");
    }

    // ---------------------------------------------------------
    // STEP 9: Remove Charger
    // ---------------------------------------------------------
    console.log("📍 Step 9: Testing Remove Charger on CP-TEST-099...");
    await page.type(".filter-search-box input", "CP-TEST-099");
    await new Promise((r) => setTimeout(r, 400));

    await page.click(".charger-action-btn.remove");
    await page.waitForSelector(".confirm-delete-card", { timeout: 3000 });

    const deletePrompt = await page.$eval(".confirm-delete-card h3", (el) => el.textContent.trim());
    if (deletePrompt.includes("CP-TEST-099")) {
      testResults.stepsPassed.push("Confirmation dialog shown for removing CP-TEST-099");
    }

    await page.click(".confirm-remove-btn");
    await new Promise((r) => setTimeout(r, 600));

    await page.click(".clear-search-btn");
    await new Promise((r) => setTimeout(r, 400));

    const existsAfterDelete = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll(".charger-id-badge strong")).map((e) => e.textContent.trim());
      return ids.includes("CP-TEST-099");
    });
    if (!existsAfterDelete) {
      testResults.stepsPassed.push("CP-TEST-099 successfully deleted and removed from UI");
    } else {
      testResults.stepsFailed.push("CP-TEST-099 still found after delete confirmation");
    }

    // ---------------------------------------------------------
    // STEP 10: Station Availability Synchronization
    // ---------------------------------------------------------
    console.log("📍 Step 10: Testing parent station synchronization on /owner/stations/1...");
    await page.click(".back-link");
    await page.waitForSelector(".details-header", { timeout: 5000 });

    const detailsTotal = await page.$eval(".details-stats-grid .details-stat-card:nth-child(1) .stat-value", (el) =>
      parseInt(el.textContent.trim(), 10)
    );
    console.log(`Station details Total Chargers: ${detailsTotal}`);
    if (detailsTotal === totalKpi) {
      testResults.stepsPassed.push(`Station details total chargers (${detailsTotal}) synchronized with chargers management`);
    } else {
      testResults.stepsFailed.push(`Expected ${totalKpi} total chargers on details, got ${detailsTotal}`);
    }

    // Navigate to My Stations
    console.log("📍 Step 10b: Testing synchronization on /owner/stations...");
    await page.click(".back-link");
    await page.waitForSelector(".owner-station-card", { timeout: 5000 });

    const myStationsLoaded = page.url().endsWith("/owner/stations");
    if (myStationsLoaded) {
      testResults.stepsPassed.push("Navigated back to /owner/stations cleanly");
    }

    // Test persistence by reloading
    console.log("📍 Step 10c: Testing persistence across page reload...");
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForSelector(".owner-station-card");
    testResults.stepsPassed.push("Station card rendered smoothly after reload");

    // ---------------------------------------------------------
    // STEP 11: General /owner/chargers Network Overview
    // ---------------------------------------------------------
    console.log("📍 Step 11: Testing general overview /owner/chargers...");
    await page.goto(`${BASE_URL}/owner/chargers`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".network-chargers-table", { timeout: 5000 });

    const networkTitle = await page.$eval(".chargers-header h1", (el) => el.textContent.trim());
    console.log(`Network chargers page title: "${networkTitle}"`);
    if (networkTitle.includes("Network Charging Points")) {
      testResults.stepsPassed.push("General overview /owner/chargers loaded with table and header");
    } else {
      testResults.stepsFailed.push(`Expected 'Network Charging Points', got '${networkTitle}'`);
    }

    // Verify "Manage Hub" button navigates to station chargers
    const manageHubLink = await page.$(".manage-station-btn");
    if (manageHubLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        manageHubLink.click()
      ]);
      console.log(`URL after clicking Manage Hub: ${page.url()}`);
      if (page.url().includes("/owner/stations/") && page.url().endsWith("/chargers")) {
        testResults.stepsPassed.push("Manage Hub button navigates directly to station-specific chargers page");
      } else {
        testResults.stepsFailed.push(`Expected /owner/stations/:id/chargers, got ${page.url()}`);
      }
    }

    // ---------------------------------------------------------
    // STEP 12: Invalid Station ID Handling (/owner/stations/999999/chargers)
    // ---------------------------------------------------------
    console.log("📍 Step 12: Testing invalid station ID /owner/stations/999999/chargers...");
    await page.goto(`${BASE_URL}/owner/stations/999999/chargers`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".details-not-found-card", { timeout: 5000 });
    const notFoundHeading = await page.$eval(".details-not-found-card h2", (el) => el.textContent.trim());
    if (notFoundHeading === "Station Not Found") {
      testResults.stepsPassed.push("Station Not Found fallback rendered gracefully without crashing");
    } else {
      testResults.stepsFailed.push(`Expected 'Station Not Found', got '${notFoundHeading}'`);
    }

    // ---------------------------------------------------------
    // STEP 13: Mobile Responsiveness at 390x844
    // ---------------------------------------------------------
    console.log("📍 Step 13: Testing mobile responsiveness (390x844)...");
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/owner/stations/1/chargers`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".chargers-header", { timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile viewport: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth <= clientWidth + 2) {
      testResults.stepsPassed.push("No horizontal overflow on mobile 390x844 for Manage Chargers");
    } else {
      testResults.stepsFailed.push(`Mobile horizontal overflow: scrollWidth (${scrollWidth}) > clientWidth (${clientWidth})`);
    }

    // Check modal responsive on mobile
    await page.click(".primary-add-charger-btn");
    await page.waitForSelector(".charger-modal-card", { timeout: 3000 });
    const modalScrollWidth = await page.evaluate(() => document.querySelector(".charger-modal-card").scrollWidth);
    const modalClientWidth = await page.evaluate(() => document.querySelector(".charger-modal-card").clientWidth);
    if (modalScrollWidth <= modalClientWidth + 2) {
      testResults.stepsPassed.push("Add Charger modal fits cleanly within mobile viewport");
    } else {
      testResults.stepsFailed.push("Add Charger modal overflows on mobile");
    }

    // ---------------------------------------------------------
    // STEP 14: Core Route Regressions
    // ---------------------------------------------------------
    console.log("📍 Step 14: Testing core routes regression...");
    const routesToCheck = [
      "/owner/dashboard",
      "/owner/stations",
      "/owner/stations/add",
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
  console.log("VERIFICATION REPORT: OWNER - MANAGE CHARGERS");
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
    console.log("\n🎉 ALL MANAGE CHARGERS TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
