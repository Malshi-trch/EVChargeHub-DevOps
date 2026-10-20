import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function checkRoutes() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  const routes = [
    "/owner/dashboard",
    "/owner/stations",
    "/owner/chargers",
    "/owner/bookings",
    "/owner/customers",
    "/owner/settings",
    "/owner/help"
  ];
  for (const r of routes) {
    await page.goto("http://localhost:5173" + r, { waitUntil: "networkidle0" });
    const hasSidebar = await page.$(".owner-sidebar");
    const hasMain = await page.$(".owner-main-container");
    console.log(r.padEnd(20), hasSidebar ? "Sidebar: OK ✓" : "Sidebar: MISSING", hasMain ? "Main: OK ✓" : "Main: MISSING");
  }
  await browser.close();
}

checkRoutes();
