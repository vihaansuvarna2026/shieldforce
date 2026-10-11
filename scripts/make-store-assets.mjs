// Produce every store graphic at the exact size each store asks for: screenshots for
// Google Play (phone, 7" tablet, 10" tablet, Chromebook) and the App Store (6.9" iPhone,
// 13" iPad), plus the Play feature graphic and 512 icon. Screens are captured from the
// built app (www/) in app mode, as they look in the store builds, and saved as flattened
// RGB PNGs — both stores reject images with an alpha channel.
//
// Run with `npm run store-assets` (builds www/ first). Needs Playwright, like `npm run icons`.
import { createServer } from "node:http";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pngToRGB } from "./lib/png.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const www = join(root, "www");
const KIT = join(root, "store-kit");
const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright").catch(() => {
  throw new Error("Playwright is needed to capture the screens: npm i -g playwright");
});

/* ---------------- the sizes ---------------- */
// [folder, CSS width, CSS height, pixel ratio] → output is width×ratio by height×ratio
const TARGETS = [
  ["google-play/screenshots/phone",       360,  640, 3],   // 1080 × 1920  (9:16)
  ["google-play/screenshots/tablet-7in",  612, 1088, 2],   // 1224 × 2176  (9:16)
  ["google-play/screenshots/tablet-10in",1280,  720, 2],   // 2560 × 1440  (16:9)
  ["google-play/screenshots/chromebook", 1280,  720, 1.5], // 1920 × 1080  (16:9)
  ["app-store/screenshots/iphone-6.9in",  440,  956, 3],   // 1320 × 2868
  ["app-store/screenshots/ipad-13in",    1032, 1376, 2]    // 2064 × 2752
];

/* ---------------- the screens ---------------- */
const SHOTS = [
  ["1-home", async (p, go) => { await go("index.html"); }],
  ["2-scan", async (p, go) => {
    await go("ai-analyzer.html");
    await p.click('[data-ex="pension"]'); await p.click("#ai-run"); await p.waitForTimeout(2600);
    await p.evaluate(() => {
      const r = document.getElementById("ai-result"), bar = document.getElementById("appbar").offsetHeight;
      scrollTo(0, r.getBoundingClientRect().top + scrollY - bar - 12);
    });
  }],
  ["3-intel", async (p, go) => { await go("scam-intel.html"); }],
  ["4-briefing", async (p, go) => { await go("scam-detail.html?id=digital-arrest"); }],
  ["5-training", async (p, go) => {
    await go("training.html?module=upi");
    await p.locator(".quiz-opt").nth(1).click(); await p.waitForTimeout(700);
    // clicking scrolled the answer into view; bring the question back to the top
    await p.evaluate(() => {
      const q = document.querySelector(".quiz-q"), bar = document.getElementById("appbar").offsetHeight;
      scrollTo(0, Math.max(0, q.getBoundingClientRect().top + scrollY - bar - 64));
    });
  }],
  ["6-emergency", async (p, go) => { await go("emergency.html"); }]
];

/* ---------------- a throwaway local server for www/ ---------------- */
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png",
  ".svg": "image/svg+xml", ".pdf": "application/pdf", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  try {
    const file = join(www, path === "/" ? "index.html" : path);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }).end(readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

/* ---------------- capture ---------------- */
const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const save = (file, png) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, pngToRGB(png)); };

for (const old of ["screenshots", "google-play/screenshots", "app-store/screenshots"]) rmSync(join(KIT, old), { recursive: true, force: true });
for (const [folder, w, h, dpr] of TARGETS) {
  const touch = !folder.endsWith("chromebook");
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr,
    isMobile: touch, hasTouch: touch, serviceWorkers: "block" });
  await ctx.addInitScript(() => {
    // look exactly like the store builds: app mode, terms already accepted
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "android" };
    try { localStorage.setItem("sf_terms_accepted_v1", "1"); } catch (e) { /* storage off */ }
  });
  const page = await ctx.newPage();
  const go = async (screen) => { await page.goto(BASE + screen, { waitUntil: "networkidle" }); await page.waitForTimeout(400); };
  for (const [name, show] of SHOTS) {
    await show(page, go);
    await page.waitForTimeout(1100);
    save(join(KIT, folder, `${name}.png`), await page.screenshot());
  }
  await ctx.close();
  console.log(`${folder}: ${SHOTS.length} × ${Math.round(w * dpr)}x${Math.round(h * dpr)}`);
}

// Google Play listing graphics
const fg = await browser.newPage({ viewport: { width: 1024, height: 500 } });
await fg.goto(pathToFileURL(join(KIT, "source", "feature-graphic.html")).href);
await fg.waitForTimeout(500);
save(join(KIT, "google-play", "feature-graphic-1024x500.png"), await fg.screenshot());
copyFileSync(join(KIT, "icons", "android", "play-store-icon-512.png"), join(KIT, "google-play", "app-icon-512.png"));
copyFileSync(join(KIT, "icons", "ios", "AppIcon-1024-AppStore.png"), join(KIT, "app-store", "app-icon-1024.png"));
console.log("google-play: feature graphic 1024x500, app icon 512x512; app-store: app icon 1024x1024");

await browser.close();
server.close();
