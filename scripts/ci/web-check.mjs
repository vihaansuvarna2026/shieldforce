// End-to-end check of the built app (www/) in Chromium: layout on every screen size,
// first-run terms, navigation, the scanner, training, offline use, that nothing ever
// reaches the internet, and a speed budget on a slowed-down phone.
//
//   npm run check            (builds www/ first; needs Playwright with Chromium)
//
// "App mode" stubs window.Capacitor so the pages behave exactly as in the store apps.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const www = join(root, "www");
const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const SCREENS = ["index.html", "scam-intel.html", "scam-detail.html?id=digital-arrest", "threat-map.html",
  "ai-analyzer.html", "learn.html", "training.html", "training.html?module=upi", "fraud-anatomy.html",
  "detection.html", "schemes.html", "scheme-detail.html?id=sparsh", "reports.html", "emergency.html",
  "more.html", "contact.html", "privacy.html", "terms.html"];
const SIZES = [["fold", 280, 653], ["small phone", 320, 568], ["android", 360, 800], ["iphone", 390, 844],
  ["large phone", 430, 932], ["phone landscape", 844, 390], ["tablet 7in", 600, 960], ["ipad", 820, 1180],
  ["ipad landscape", 1366, 1024], ["laptop", 1440, 900]];
const SCAM = "Dear pensioner, your SPARSH account will be BLOCKED today. Click http://sparsh-update.xyz and share the OTP sent to your phone to avoid suspension. - Defence Pension Cell";
const BENIGN = "Hi Didi, reached the station safely. Will call you after dinner tonight. Love to the kids.";

/* ---------- serve www/ ---------- */
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

/* ---------- harness ---------- */
const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failed = 0;
const check = (ok, what) => { console.log(`${ok ? "PASS" : "FAIL"}  ${what}`); if (!ok) failed++; };
const external = new Set();
const errors = [];

async function context({ app = true, accepted = true, w = 390, h = 844, touch = true, sw = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch,
    serviceWorkers: sw ? "allow" : "block" });
  await ctx.addInitScript(([app, accepted]) => {
    if (app) window.Capacitor = { isNativePlatform: () => true };
    try { if (accepted) localStorage.setItem("sf_terms_accepted_v1", "1"); sessionStorage.setItem("sf_splash_done", "1"); } catch (e) { /* storage off */ }
  }, [app, accepted]);
  ctx.on("request", (r) => { if (!r.url().startsWith(BASE) && !/^(data|blob|about):/.test(r.url())) external.add(r.url()); });
  ctx.on("page", (p) => {
    p.on("pageerror", (e) => errors.push(`${p.url()}: ${e.message}`));
    p.on("console", (m) => { if (m.type() === "error") errors.push(`${p.url()}: ${m.text()}`); });
  });
  return ctx;
}

/* ---------- 1. layout on every size ---------- */
{
  const bad = [];
  for (const [name, w, h] of SIZES) {
    const ctx = await context({ w, h, touch: w < 1024 });
    const p = await ctx.newPage();
    for (const s of SCREENS) {
      await p.goto(BASE + s, { waitUntil: "load" });
      const r = await p.evaluate(() => {
        const bar = document.getElementById("appbar"), tab = document.getElementById("tabbar");
        const first = document.querySelector("main")?.firstElementChild?.getBoundingClientRect().top ?? 999;
        return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          chrome: !!bar && !!tab, under: first < bar.getBoundingClientRect().bottom - 1 };
      });
      if (r.over > 0 || !r.chrome || r.under) bad.push(`${name} ${s} ${JSON.stringify(r)}`);
    }
    await ctx.close();
  }
  check(bad.length === 0, `layout: ${SIZES.length} sizes × ${SCREENS.length} screens fit, with app bar and tabs${bad.length ? "\n      " + bad.join("\n      ") : ""}`);
}

/* ---------- 2. first launch shows the terms, once ---------- */
{
  const ctx = await context({ accepted: false });
  const p = await ctx.newPage();
  await p.goto(BASE + "index.html", { waitUntil: "load" });
  await p.waitForSelector("#splash.gate-mode #splash-agree-btn", { timeout: 8000 });
  check(await p.isDisabled("#splash-agree-btn"), "first launch: terms screen shows, Agree locked until ticked");
  await p.goto(BASE + "terms.html", { waitUntil: "load" });
  check(!(await p.$("#splash")), "terms and privacy can be read before agreeing");
  await p.goto(BASE + "index.html", { waitUntil: "load" });
  await p.waitForSelector("#splash-agree-check");
  await p.check("#splash-agree-check"); await p.click("#splash-agree-btn");
  await p.waitForSelector("#splash", { state: "detached", timeout: 8000 });
  await p.goto(BASE + "learn.html", { waitUntil: "load" });
  check(!(await p.$("#splash")), "after agreeing, screens open straight away");
  await ctx.close();
}

/* ---------- 3. tabs, detail screens and Back ---------- */
{
  const ctx = await context();
  const p = await ctx.newPage();
  await p.goto(BASE + "index.html", { waitUntil: "load" });
  let ok = true;
  for (const t of ["scam-intel.html", "ai-analyzer.html", "learn.html", "emergency.html", "index.html"]) {
    await p.tap(`#tabbar a.tb-item[href$="${t}"]`);
    await p.waitForURL("**/" + t, { timeout: 8000 }).catch(() => { ok = false; });
  }
  check(ok, "every tab opens its screen");
  await p.tap('#tabbar a.tb-item[href$="scam-intel.html"]'); await p.waitForURL("**/scam-intel.html");
  await p.tap(".intel-card"); await p.waitForURL("**/scam-detail.html?id=*");
  await p.tap("#appbar .ab-back"); await p.waitForURL("**/scam-intel.html", { timeout: 8000 }).catch(() => {});
  check(p.url().endsWith("scam-intel.html"), "Back from a scam briefing returns to the list");
  await p.goto(BASE + "scheme-detail.html?id=sparsh", { waitUntil: "load" });
  await p.tap("#appbar .ab-back"); await p.waitForURL("**/schemes.html", { timeout: 8000 }).catch(() => {});
  check(p.url().endsWith("schemes.html"), "Back from a screen opened directly goes to its parent");
  await ctx.close();
}

/* ---------- 4. the scanner works with no internet ---------- */
{
  const ctx = await context();
  const p = await ctx.newPage();
  await p.goto(BASE + "ai-analyzer.html", { waitUntil: "load" });
  await ctx.setOffline(true);
  const scan = async (text) => {
    await p.fill("#ai-text", text); await p.tap("#ai-run");
    await p.waitForSelector("#ai-output .gauge-num", { timeout: 8000 });
    const r = await p.evaluate(() => ({ score: +document.querySelector("#ai-output .gauge-num").textContent,
      verdict: document.querySelector("#ai-output .gauge-verdict").textContent,
      flags: document.querySelectorAll("#ai-output .flag:not(.ok)").length }));
    await p.tap("#ai-clear");
    return r;
  };
  const a = await scan(SCAM), b = await scan(BENIGN);
  console.log(`      scam message → ${a.score} "${a.verdict}", ${a.flags} red flags; family message → ${b.score} "${b.verdict}"`);
  check(a.score >= 60 && a.flags >= 3, "offline scanner flags a pension-scam message as fraud");
  check(b.score < 30 && b.flags === 0, "offline scanner passes an ordinary family message");
  await ctx.close();
}

/* ---------- 5. training keeps progress ---------- */
{
  const ctx = await context();
  const p = await ctx.newPage();
  await p.goto(BASE + "training.html?module=upi", { waitUntil: "load" });
  await p.locator(".quiz-opt").first().tap();
  check(await p.locator(".quiz-explain").isVisible(), "a quiz answer shows its explanation");
  for (let i = 0; i < 12 && await p.$("#quiz-next"); i++) {
    await p.tap("#quiz-next");
    if (await p.$(".quiz-opt:not([disabled])")) await p.locator(".quiz-opt").first().tap();
  }
  const saved = await p.evaluate(() => { try { return Object.keys(JSON.parse(localStorage.getItem("sf-training-v1") || "{}")).length; } catch (e) { return 0; } });
  check(saved >= 1, "finishing a module saves progress on the device");
  await ctx.close();
}

/* ---------- 6. app mode: every screen opens offline ---------- */
{
  const ctx = await context();
  const p = await ctx.newPage();
  await p.goto(BASE + "index.html", { waitUntil: "load" });
  const bad = [];
  for (const s of SCREENS) {
    await p.goto(BASE + s, { waitUntil: "load" });
    const r = await p.evaluate(() => ({ chrome: !!document.getElementById("tabbar"), text: document.querySelector("main")?.innerText.length || 0,
      native: document.body.classList.contains("is-native") }));
    if (!r.chrome || r.text < 80 || !r.native) bad.push(`${s} ${JSON.stringify(r)}`);
  }
  check(bad.length === 0, `app mode: all ${SCREENS.length} screens render their full content${bad.length ? ": " + bad.join(", ") : ""}`);
  await ctx.close();
}

/* ---------- 7. web version: installs, then works with the network off ---------- */
{
  const ctx = await context({ app: false, sw: true });
  const p = await ctx.newPage();
  await p.goto(BASE + "index.html", { waitUntil: "load" });
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(async () => {
    const keys = await caches.keys(); if (!keys.length) return false;
    return (await (await caches.open(keys[0])).keys()).length >= 60;
  }, null, { timeout: 30000 }).catch(() => {});
  await ctx.setOffline(true);
  const bad = [];
  for (const s of SCREENS) {
    const ok = await p.goto(BASE + s, { waitUntil: "load" }).then(() => true).catch(() => false);
    const text = ok ? await p.evaluate(() => document.querySelector("main")?.innerText.length || 0) : 0;
    if (text < 80) bad.push(s);
  }
  check(bad.length === 0, `web version: all ${SCREENS.length} screens open with the network off${bad.length ? ": " + bad.join(", ") : ""}`);
  await ctx.close();
}

/* ---------- 8. speed on a slow phone (CPU slowed 4x) ---------- */
{
  const ctx = await context({ w: 390, h: 844 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const rows = [];
  for (const s of ["index.html", "scam-intel.html", "learn.html", "emergency.html", "threat-map.html"]) {
    const t0 = Date.now();
    await p.goto(BASE + s, { waitUntil: "load" });
    const load = Date.now() - t0;
    await p.waitForTimeout(500);
    await p.evaluate(() => { window.__ft = []; let last = performance.now();
      (function f(t) { window.__ft.push(t - last); last = t; window.__raf = requestAnimationFrame(f); })(performance.now()); });
    await cdp.send("Input.synthesizeScrollGesture", { x: 195, y: 600, yDistance: -1200, speed: 1600, gestureSourceType: "touch" });
    await cdp.send("Input.synthesizeScrollGesture", { x: 195, y: 300, yDistance: 1200, speed: 1600, gestureSourceType: "touch" });
    const ft = await p.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__ft.slice(2); });
    const fps = Math.round(ft.length / (ft.reduce((a, c) => a + c, 0) / 1000));
    rows.push({ s, load, fps });
  }
  console.log("      " + rows.map((r) => `${r.s.replace(".html", "")}: opens ${r.load}ms, scrolls ${r.fps}fps`).join(" · "));
  check(rows.every((r) => r.load < 1500), "slow phone: every screen opens in under 1.5 s");
  check(rows.every((r) => r.fps >= 45), "slow phone: scrolling stays smooth (45+ fps)");
  await ctx.close();
}

/* ---------- 9. nothing reaches the internet ---------- */
check(external.size === 0, `no request ever left the app${external.size ? ": " + [...external].slice(0, 5).join(", ") : ""}`);
check(errors.length === 0, `no script errors${errors.length ? ":\n      " + errors.slice(0, 5).join("\n      ") : ""}`);

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
