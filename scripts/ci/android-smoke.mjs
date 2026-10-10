// Drive the installed Android debug build on an emulator: first-run terms gate, tabs, a
// detail screen, the system Back button, safe areas and the PDF hand-off. Screenshots go
// to $OUT for the workflow to upload. Exits non-zero on the first failed check.
import { _android as android } from "playwright";
import { mkdirSync } from "node:fs";

const PKG = "in.shieldforce.app";
const OUT = process.env.OUT || "smoke";
mkdirSync(OUT, { recursive: true });

const [device] = await android.devices();
if (!device) throw new Error("no emulator attached");
console.log(`device: ${device.model()} (serial ${device.serial()})`);

let failed = 0;
const check = (ok, what) => { console.log(`${ok ? "PASS" : "FAIL"}  ${what}`); if (!ok) failed++; };
const shot = (name) => device.screenshot({ path: `${OUT}/${name}.png` });
const back = () => device.shell("input keyevent 4");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await device.shell(`pm clear ${PKG}`);                       // a genuine first launch
await device.shell(`am start -W -n ${PKG}/.MainActivity`);

const webview = await device.webView({ pkg: PKG }, { timeout: 60000 });
const page = await webview.page();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

const path = () => page.evaluate(() => location.pathname + location.search);
const settle = async () => { await page.waitForLoadState("load"); await wait(900); };

await settle();
check(await page.evaluate(() => !!window.Capacitor?.isNativePlatform?.()), "runs as a native app");
check(await page.evaluate(() => document.body.classList.contains("is-native")), "app shell knows it is native");

// first run: the terms gate must appear and must block until agreed
await page.waitForSelector("#splash.gate-mode #splash-agree-btn", { timeout: 15000 });
check(await page.isDisabled("#splash-agree-btn"), "terms gate shows, Agree disabled until ticked");
await shot("1-terms-gate");
await page.check("#splash-agree-check");
await page.click("#splash-agree-btn");
await page.waitForSelector("#splash", { state: "detached", timeout: 10000 });
check(true, "terms accepted, home unlocked");
await wait(600);
await shot("2-home");

// the app bar must clear the status bar
const bar = await page.evaluate(() => {
  const s = getComputedStyle(document.documentElement);
  const ab = document.querySelector("#appbar").getBoundingClientRect();
  return { inset: s.getPropertyValue("--safe-t"), top: ab.top, h: ab.height };
});
console.log("app bar:", JSON.stringify(bar));
check(bar.h >= 56, "app bar has room for its controls");

// tabs
await page.click('#tabbar a[href$="scam-intel.html"]');
await settle();
check((await path()).endsWith("scam-intel.html"), "Intel tab opens");
await page.click(".intel-card");
await settle();
check((await path()).includes("scam-detail.html?id="), "a scam opens its detail screen");
await shot("3-detail");

// system Back walks back through screens instead of quitting
await back(); await settle();
check((await path()).endsWith("scam-intel.html"), "Back returns to the Intel list");
await back(); await settle();
check(/\/(index\.html)?$/.test(await path()), "Back again returns Home");

// a second launch skips the gate
await device.shell(`am force-stop ${PKG}`);
await device.shell(`am start -W -n ${PKG}/.MainActivity`);
const page2 = await (await device.webView({ pkg: PKG }, { timeout: 60000 })).page();
page2.on("pageerror", (e) => errors.push(e.message));
page2.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page2.waitForLoadState("load"); await wait(1200);
check(await page2.evaluate(() => !document.getElementById("splash")), "returning user goes straight to Home");

// field guides hand PDFs to the browser instead of failing inside the app
const open = async (screen) => { await page2.goto(new URL(screen, page2.url()).href); await wait(900); };
await open("reports.html");
const pdf = await page2.getAttribute("#report-grid a.btn", "href");
const target = await page2.getAttribute("#report-grid a.btn", "target");
console.log("pdf link:", pdf, target);
check(/^https:\/\/.+\/assets\/reports\/.+\.pdf$/.test(pdf || "") && target === "_blank", "PDFs open the hosted copy externally");
check(await page2.evaluate(() => !document.getElementById("dl-all")), "'Download all' is hidden in the app");
await shot("4-reports");

// the SOS dialler
await open("emergency.html");
check(await page2.locator('a[href^="tel:1930"]').count() > 0, "1930 helpline is a tap-to-call link");
await shot("5-sos");

check(errors.length === 0, `no script errors${errors.length ? ": " + errors.join(" | ") : ""}`);
await device.close();
console.log(failed ? `${failed} check(s) failed` : "all checks passed");
process.exit(failed ? 1 : 0);
