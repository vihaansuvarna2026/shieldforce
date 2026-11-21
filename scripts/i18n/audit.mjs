// Prove each translated language really works in the app, after `npm run i18n:build`:
//   1. walk every screen and state in that language and list any text still shown in English
//   2. open the main screens on a small phone and fail if anything spills off the side
//   3. check Urdu is laid out right-to-left
//   4. save one phone screenshot per language for a person to look at
//
//   node scripts/i18n/audit.mjs [lang …]   (default: every language offered in the app)
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "../lib/serve.mjs";
import { crawl } from "./crawl.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ready = JSON.parse(readFileSync(join(root, "js", "i18n.js"), "utf8").match(/const READY = (\[[^\]]*\]);/)[1]);
const langs = process.argv.slice(2).length ? process.argv.slice(2) : ready.filter((l) => l !== "en");
const shots = join(root, "i18n-work", "shots");
mkdirSync(shots, { recursive: true });

const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const srv = await serve(join(root, "www"));
const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const PAGES = ["index.html", "scam-intel.html", "scam-detail.html?id=digital-arrest", "threat-map.html", "ai-analyzer.html",
  "learn.html", "training.html?module=upi", "fraud-anatomy.html", "detection.html", "schemes.html", "reports.html",
  "emergency.html", "more.html", "contact.html", "privacy.html", "terms.html"];
let failed = false;

for (const lang of langs) {
  const { found, errors } = await crawl(browser, srv.base, { kind: "audit", lang, quick: !!process.env.QUICK });
  const missing = Object.values(found);

  // layout on a small phone (360 px wide), app mode
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  await ctx.addInitScript((lang) => {
    window.Capacitor = { isNativePlatform: () => true };
    try { localStorage.setItem("sf_lang", lang); localStorage.setItem("sf_terms_accepted_v1", "1"); sessionStorage.setItem("sf_splash_done", "1"); } catch (e) { /* off */ }
  }, lang);
  const page = await ctx.newPage();
  const overflow = [];
  let dir = "";
  for (const p of PAGES) {
    await page.goto(srv.base + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll("body *")].filter((e) => {
        const b = e.getBoundingClientRect(), s = getComputedStyle(e);
        if (!b.width || s.position === "fixed" || e.closest("[class*=ticker], .marquee, svg, #map, .map-wrap, pre, textarea")) return false;
        return b.right > W + 2 || b.left < -2;
      }).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join(".")} "${(e.textContent || "").trim().slice(0, 40)}"`);
      return { scroll: document.documentElement.scrollWidth > W + 2, wide, dir: document.documentElement.dir, lang: document.documentElement.lang };
    });
    if (r.scroll || r.wide.length) overflow.push(`${p}: ${r.wide.join(" | ") || "page scrolls sideways"}`);
    dir = r.dir;
    if (p === "index.html") await page.screenshot({ path: join(shots, `${lang}-home.png`) });
    if (p === "emergency.html") await page.screenshot({ path: join(shots, `${lang}-sos.png`) });
  }
  await ctx.close();

  const rtlOk = lang !== "ur" || dir === "rtl";
  const ok = !missing.length && !overflow.length && rtlOk && !errors.length;
  if (!ok) failed = true;
  console.log(`${ok ? "✓" : "✗"} ${lang}: ${missing.length} English leftovers, ${overflow.length} layout spills` +
    (lang === "ur" ? `, direction ${dir || "ltr"}` : "") + (errors.length ? `, ${errors.length} page errors` : ""));
  missing.slice(0, 10).forEach((m) => console.log(`    EN  ${m.at}: ${m.en.slice(0, 90)}`));
  overflow.slice(0, 10).forEach((o) => console.log(`    ↔  ${o}`));
  errors.slice(0, 5).forEach((e) => console.log(`    !  ${e}`));
}
await browser.close(); srv.close();
console.log(`screenshots: ${shots}`);
process.exit(failed ? 1 : 0);
