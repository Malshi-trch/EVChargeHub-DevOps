import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173/owner/dashboard";
const ARTIFACT_DIR = "C:\\Users\\haree\\.gemini\\antigravity-ide\\brain\\1a7628ca-7d48-4a66-a4d1-eb2fd57f3e1e";

const VIEWPORTS = [
  { name: "1920px Desktop Large", width: 1920, height: 1080, expectedCols: 4 },
  { name: "1440px Desktop Standard", width: 1440, height: 900, expectedCols: 4 },
  { name: "1366px Desktop Laptop", width: 1366, height: 768, expectedCols: 4 },
  { name: "1024px Medium Screen", width: 1024, height: 768, expectedCols: 2 },
  { name: "768px Mobile/Tablet", width: 768, height: 1024, expectedCols: 1 },
  { name: "375px Mobile Small", width: 375, height: 812, expectedCols: 1 },
];

async function runTests() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  console.log("=== STARTING QUICK ACTIONS LAYOUT & RESPONSIVENESS AUDIT ===\n");

  let allPassed = true;

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));

    const audit = await page.evaluate((vpInfo) => {
      const grid = document.querySelector(".dash-actions-grid");
      const cards = Array.from(document.querySelectorAll(".dash-action-card"));
      const docScrollWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;

      if (!grid || cards.length !== 4) {
        return { error: `Expected grid with 4 cards, found: ${cards.length}` };
      }

      const gridRect = grid.getBoundingClientRect();
      const gridStyle = window.getComputedStyle(grid);
      const cols = gridStyle.gridTemplateColumns.split(" ").filter(Boolean).length;

      const cardDetails = cards.map((c, i) => {
        const r = c.getBoundingClientRect();
        const title = c.querySelector(".action-card-title")?.textContent;
        return {
          index: i + 1,
          title,
          width: Math.round(r.width),
          height: Math.round(r.height),
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          overflowsRight: r.right > winWidth + 1,
        };
      });

      const anyCardOverflows = cardDetails.some((c) => c.overflowsRight);
      const docOverflows = docScrollWidth > winWidth;

      // Group cards into rows by top coordinate
      const rows = {};
      cards.forEach((c) => {
        const top = Math.round(c.getBoundingClientRect().top);
        let foundRow = false;
        for (const rTop of Object.keys(rows)) {
          if (Math.abs(Number(rTop) - top) < 15) {
            rows[rTop].push(c);
            foundRow = true;
            break;
          }
        }
        if (!foundRow) {
          rows[top] = [c];
        }
      });
      const rowCounts = Object.values(rows).map((r) => r.length);

      return {
        winWidth,
        docScrollWidth,
        docOverflows,
        gridCols: cols,
        rowCounts,
        gridRect: {
          left: Math.round(gridRect.left),
          right: Math.round(gridRect.right),
          width: Math.round(gridRect.width),
        },
        anyCardOverflows,
        cardDetails,
      };
    }, vp);

    console.log(`[Viewport: ${vp.name} (${vp.width}x${vp.height})]`);
    console.log(`  Grid Columns Computed: ${audit.gridCols} (Expected: ${vp.expectedCols})`);
    console.log(`  Cards per row: ${audit.rowCounts.join(", ")}`);
    console.log(`  Grid Width: ${audit.gridRect.width}px, Right edge: ${audit.gridRect.right}px / Window: ${audit.winWidth}px`);
    console.log(`  Any Card Overflows: ${audit.anyCardOverflows ? "FAIL (YES)" : "PASS (NO)"}`);
    console.log(`  Document ScrollWidth: ${audit.docScrollWidth}px (Overflow: ${audit.docOverflows ? "FAIL" : "PASS (0px)"})`);

    audit.cardDetails.forEach((c) => {
      console.log(`    Card ${c.index} [${c.title}]: ${c.width}x${c.height}px (L: ${c.left}, R: ${c.right})`);
    });

    if (audit.gridCols !== vp.expectedCols || audit.anyCardOverflows || audit.docOverflows) {
      allPassed = false;
      console.log(`  -> FAILED on ${vp.name}`);
    } else {
      console.log(`  -> PASSED`);
    }

    // Save screenshot for 1440, 1024, and 375
    if (vp.width === 1440 || vp.width === 1024 || vp.width === 375) {
      const snapPath = path.join(ARTIFACT_DIR, `quick_actions_${vp.width}.png`);
      // Scroll to bottom where quick actions are
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
      await page.screenshot({ path: snapPath });
      console.log(`  Saved screenshot: ${snapPath}`);
    }
    console.log("");
  }

  // Test functional navigation on Quick Actions
  console.log("=== TESTING QUICK ACTIONS FUNCTIONALITY & NAVIGATION ===");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });

  // 1. Add Station modal button
  console.log("Testing Card 1: Add Station modal toggle...");
  const addStationBtn = await page.$("button.dash-action-card");
  if (addStationBtn) {
    await addStationBtn.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    const modalVisible = await page.$(".owner-modal-backdrop");
    console.log(`  Add Station modal opened: ${modalVisible ? "PASS" : "FAIL"}`);
    // Close modal
    const cancelBtn = await page.$(".owner-modal-card .btn-cancel");
    if (cancelBtn) await cancelBtn.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
  }

  // Verify Links exist with correct hrefs
  const linkCards = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a.dash-action-card"));
    return links.map((l) => ({
      title: l.querySelector(".action-card-title")?.textContent,
      href: l.getAttribute("href"),
    }));
  });

  console.log("Testing Cards 2, 3, 4 links:");
  linkCards.forEach((l) => {
    console.log(`  Card [${l.title}]: href="${l.href}" - ${l.href ? "PASS" : "FAIL"}`);
  });

  await browser.close();
  console.log(`\n=== AUDIT FINISHED: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"} ===`);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
