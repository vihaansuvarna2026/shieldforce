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
const reaches = async (re) => {           // navigation after Back is asynchronous
  for (let i = 0; i < 32; i++) { if (re.test(await path().catch(() => ""))) return true; await wait(250); }
  return false;
};
await back();
check(await reaches(/scam-intel\.html$/), "Back returns to the Intel list");
await wait(600);
await back();
check(await reaches(/\/(index\.html)?$/), "Back again returns Home");
await wait(600);
await back(); await wait(1500);
const top = await device.shell("dumpsys activity activities | grep -E 'topResumedActivity|mResumedActivity'");
check(!top.toString().includes(PKG), "Back on Home leaves the app like any other app");

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

// no internet at all: airplane mode, a cold start, every main screen, and the scanner
await device.shell("cmd connectivity airplane-mode enable");
await device.shell("svc wifi disable");
await device.shell("svc data disable");
await wait(2500);
const ping = (await device.shell("ping -c 1 -W 2 8.8.8.8 >/dev/null 2>&1 && echo ONLINE || echo OFFLINE")).toString().trim();
console.log("network:", ping);
check(ping === "OFFLINE", "phone is offline for the next checks");
await device.shell(`am force-stop ${PKG}`);
await device.shell(`am start -W -n ${PKG}/.MainActivity`);
const page3 = await (await device.webView({ pkg: PKG }, { timeout: 60000 })).page();
page3.on("pageerror", (e) => errors.push(e.message));
page3.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page3.waitForLoadState("load"); await wait(1500);
const content = () => page3.evaluate(() => document.querySelector("main")?.innerText.length || 0);
check(await content() > 200, "offline: the app opens with Home fully loaded");
const empty = [];
for (const s of ["scam-intel.html", "scam-detail.html?id=digital-arrest", "ai-analyzer.html", "learn.html",
  "training.html?module=upi", "fraud-anatomy.html", "detection.html", "schemes.html", "threat-map.html", "emergency.html", "more.html"]) {
  await page3.goto(new URL(s, page3.url()).href); await wait(700);
  if (await content() < 80) empty.push(s);
}
check(empty.length === 0, `offline: every screen loads${empty.length ? " (empty: " + empty.join(", ") + ")" : ""}`);
await page3.goto(new URL("ai-analyzer.html", page3.url()).href); await wait(700);
await page3.fill("#ai-text", "Dear pensioner, your SPARSH account will be BLOCKED today. Click http://sparsh-update.xyz and share the OTP to avoid suspension.");
await page3.click("#ai-run");
await page3.waitForSelector("#ai-output .gauge-num", { timeout: 10000 }).catch(() => {});
const score = +(await page3.textContent("#ai-output .gauge-num").catch(() => "0"));
console.log("offline scan score:", score);
check(score >= 60, "offline: the scanner flags a scam message as fraud");
await shot("6-offline-scan");

check(errors.length === 0, `no script errors${errors.length ? ": " + errors.join(" | ") : ""}`);
await device.close();
console.log(failed ? `${failed} check(s) failed` : "all checks passed");
process.exit(failed ? 1 : 0);
