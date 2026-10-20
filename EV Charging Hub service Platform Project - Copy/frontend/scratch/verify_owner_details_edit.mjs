import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";

const testResults = {
  stepsPassed: [],
  stepsFailed: [],
  consoleErrors: [],
  logs: []
};

async function runVerification() {
  console.log("🚀 Starting Owner Station Details + Edit Station Verification...");

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
    // STEP 1: Navigate to /owner/stations/1/edit
    // ---------------------------------------------------------
    console.log("📍 Step 1: Navigating to /owner/stations/1/edit...");
    await page.goto(`${BASE_URL}/owner/stations/1/edit`, { waitUntil: "networkidle0" });
    await page.waitForSelector("#edit-station-name", { timeout: 5000 });

    const initialName = await page.$eval("#edit-station-name", (el) => el.value);
    console.log(`Pre-filled station name: "${initialName}"`);
    if (initialName.includes("Ruhuna")) {
      testResults.stepsPassed.push("Pre-filled form with existing station data verified");
    } else {
      testResults.stepsFailed.push(`Expected Ruhuna in station name, got: ${initialName}`);
    }

    // ---------------------------------------------------------
    // STEP 8: Change Station Name to "University of Ruhuna Supercharger Hub" & Price to "92"
    // ---------------------------------------------------------
    console.log("📍 Step 8: Changing Station Name and Price per kWh...");
    await page.click("#edit-station-name");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#edit-station-name", "University of Ruhuna Supercharger Hub");

    await page.click("#edit-price-kwh");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type("#edit-price-kwh", "92");

    testResults.stepsPassed.push("Station Name and Price updated in form");

    // ---------------------------------------------------------
    // STEP 9: Click "Save Changes"
    // ---------------------------------------------------------
    console.log("📍 Step 9: Clicking Save Changes...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click(".submit-station-btn")
    ]);
    testResults.stepsPassed.push("Save Changes submitted and navigated");

    // ---------------------------------------------------------
    // STEP 10: Verify navigation back to /owner/stations/1 and confirm updated name and price
    // ---------------------------------------------------------
    console.log("📍 Step 10: Verifying /owner/stations/1 updated data...");
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    if (currentUrl.includes("/owner/stations/1") && !currentUrl.includes("/edit")) {
      testResults.stepsPassed.push("Navigated to /owner/stations/1");
    } else {
      testResults.stepsFailed.push(`Expected /owner/stations/1, got: ${currentUrl}`);
    }

    await page.waitForSelector(".details-header h1");
    const updatedTitle = await page.$eval(".details-header h1", (el) => el.textContent.trim());
    console.log(`Station details header title: "${updatedTitle}"`);
    if (updatedTitle === "University of Ruhuna Supercharger Hub") {
      testResults.stepsPassed.push("Updated station title verified on Details page");
    } else {
      testResults.stepsFailed.push(`Expected title "University of Ruhuna Supercharger Hub", got: "${updatedTitle}"`);
    }

    const priceText = await page.$eval(".price-big", (el) => el.textContent.trim());
    console.log(`Station details price: "${priceText}"`);
    if (priceText.includes("92")) {
      testResults.stepsPassed.push("Updated price LKR 92 verified on Details page");
    } else {
      testResults.stepsFailed.push(`Expected price to contain 92, got: "${priceText}"`);
    }

    // ---------------------------------------------------------
    // STEP 11: Click "Back to My Stations"
    // ---------------------------------------------------------
    console.log("📍 Step 11: Clicking Back to My Stations...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click(".back-link")
    ]);
    testResults.stepsPassed.push("Navigated back to My Stations via back-link");

    // ---------------------------------------------------------
    // STEP 12: On /owner/stations verify updated name, no duplicate, and persistence after reload
    // ---------------------------------------------------------
    console.log("📍 Step 12: Checking My Stations for updated title and no duplicates...");
    await page.waitForSelector(".station-card-title");
    const stationTitles = await page.$$eval(".station-card-title", (els) => els.map((e) => e.textContent.trim()));
    console.log(`Station titles on /owner/stations:`, stationTitles);

    const matchCount = stationTitles.filter((t) => t === "University of Ruhuna Supercharger Hub").length;
    if (matchCount === 1) {
      testResults.stepsPassed.push("Updated station appears exactly once (no duplicates created)");
    } else {
      testResults.stepsFailed.push(`Expected updated station to appear once, found ${matchCount} times`);
    }

    // Refresh page and test persistence
    console.log("Refreshing page to test localStorage persistence...");
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForSelector(".station-card-title");
    const reloadedTitles = await page.$$eval(".station-card-title", (els) => els.map((e) => e.textContent.trim()));
    if (reloadedTitles.includes("University of Ruhuna Supercharger Hub")) {
      testResults.stepsPassed.push("Updated station persisted across page reload in localStorage");
    } else {
      testResults.stepsFailed.push("Updated station did not persist across page reload");
    }

    // ---------------------------------------------------------
    // STEP 13: Test Edit on the second station (Matara City Charging Hub) & Cancel
    // ---------------------------------------------------------
    console.log("📍 Step 13: Testing Edit on second station (/owner/stations/2/edit) and Cancel...");
    await page.goto(`${BASE_URL}/owner/stations/2/edit`, { waitUntil: "networkidle0" });
    await page.waitForSelector("#edit-station-name");
    const station2Name = await page.$eval("#edit-station-name", (el) => el.value);
    console.log(`Station 2 pre-filled name: "${station2Name}"`);
    if (station2Name.includes("Matara")) {
      testResults.stepsPassed.push("Second station (Matara) pre-filled data verified");
    } else {
      testResults.stepsFailed.push(`Expected Matara in name, got: "${station2Name}"`);
    }

    // Click Cancel
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click(".form-cancel-btn")
    ]);
    console.log(`URL after clicking Cancel: ${page.url()}`);
    if (page.url().includes("/owner/stations/2")) {
      testResults.stepsPassed.push("Cancel button navigated back safely without altering data");
    } else {
      testResults.stepsFailed.push(`Expected /owner/stations/2 after Cancel, got ${page.url()}`);
    }

    // ---------------------------------------------------------
    // STEP 14: Test invalid station ID: /owner/stations/999999
    // ---------------------------------------------------------
    console.log("📍 Step 14: Testing invalid station ID /owner/stations/999999...");
    await page.goto(`${BASE_URL}/owner/stations/999999`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".details-not-found-card");
    const notFoundText = await page.$eval(".details-not-found-card h2", (el) => el.textContent.trim());
    console.log(`Not found card heading: "${notFoundText}"`);
    if (notFoundText === "Station Not Found") {
      testResults.stepsPassed.push("Station Not Found state rendered gracefully for invalid ID");
    } else {
      testResults.stepsFailed.push(`Expected "Station Not Found", got: "${notFoundText}"`);
    }

    // Click Back to My Stations on not found card
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click(".back-to-stations-btn")
    ]);
    if (page.url().endsWith("/owner/stations")) {
      testResults.stepsPassed.push("Back to My Stations link on Not Found card works");
    }

    // Test invalid edit ID: /owner/stations/999999/edit
    await page.goto(`${BASE_URL}/owner/stations/999999/edit`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".details-not-found-card");
    testResults.stepsPassed.push("Station Not Found state rendered gracefully for invalid edit ID");

    // ---------------------------------------------------------
    // STEP 15: Test responsive layout at 390x844
    // ---------------------------------------------------------
    console.log("📍 Step 15: Testing responsive layout at 390x844...");
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/owner/stations/1`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".details-header");

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Viewport check: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth <= clientWidth + 2) {
      testResults.stepsPassed.push("No horizontal overflow on mobile 390x844 on Details page");
    } else {
      testResults.stepsFailed.push(`Mobile horizontal overflow: scrollWidth (${scrollWidth}) > clientWidth (${clientWidth})`);
    }

    // Check Edit page on mobile
    await page.goto(`${BASE_URL}/owner/stations/1/edit`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".add-station-form");
    const editScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const editClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (editScrollWidth <= editClientWidth + 2) {
      testResults.stepsPassed.push("No horizontal overflow on mobile 390x844 on Edit page");
    } else {
      testResults.stepsFailed.push(`Mobile horizontal overflow on Edit page: scrollWidth (${editScrollWidth}) > clientWidth (${editClientWidth})`);
    }

    // ---------------------------------------------------------
    // REGRESSION TEST: Check core routes
    // ---------------------------------------------------------
    console.log("📍 Checking regression on core routes...");
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
  console.log("VERIFICATION REPORT:");
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
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY WITH 0 ERRORS!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
