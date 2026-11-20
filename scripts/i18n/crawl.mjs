// Walk the app through every screen and state, in app mode and web mode, and gather what
// js/i18n.js recorded on the way:
//   kind "collect" — every English text unit (to build i18n/en.json)
//   kind "audit"   — every unit shown in English because its translation is missing
// Live content that rotates by the hour (case feed, threat map) is sampled across a year.

const SCREENS = ["index.html", "scam-intel.html", "threat-map.html", "ai-analyzer.html", "learn.html",
  "training.html", "fraud-anatomy.html", "detection.html", "schemes.html", "reports.html", "emergency.html",
  "more.html", "contact.html", "privacy.html", "terms.html", "404.html"];

// text that only appears in situations a browser test can't reach (an installed web app,
// a clipboard refusal, an hour ticking over while the map is open…)
const EXTRA = [
  "Copied <b>moneyville.game@gmail.com</b>",
  "Couldn't copy — the address is selected, press Ctrl/Cmd+C",
  "✓ Copied", "Select and copy manually", "📋 Copy address",
  "🛰 Training grid rotated to this hour's scenarios",
  "Installing Shield Force…", "Installed", "You're using Shield Force as an app — it works offline",
  "Install Shield Force", "Add it to your home screen — works fully offline", "Add it to your home screen — tap for how",
  "Install", "How", "Ready.", "⏸ Stop auto-play", "▶ Auto-play the fraud",
  "⬇ Starting 5 downloads — allow multiple downloads if your browser asks."
];

const SCAN = {
  everything: "URGENT: share the OTP and UPI PIN now. Scan this QR code to receive your advance payment immediately. " +
    "Account will be blocked today. Do not tell anyone, this is confidential. Guaranteed returns, zero risk, 3% daily. " +
    "You are a lucky draw winner — pay the processing fee. Visit http://pay-update.xyz or bit.ly/abc and install update.apk. " +
    "Install AnyDesk for screen share. I am Major Singh posted at the forward area, I cannot come to meet. " +
    "Army welfare fund for a martyr's family, pay rahul99@ybl. You are under digital arrest, stay on the video call with CBI police case " +
    "for illegal parcel. Transfer your savings to the RBI supervised account. Update KYC, send your Aadhaar and account number to verify. " +
    "SPARSH pension will stop, verify life certificate. CSD canteen car quota discount booking. Forward this to 10 groups. " +
    "Send payment screenshot. Only 5 slots left.",
  positive: "Family welfare meeting on Saturday through the exchange. No payment is required. Never share your OTP with anyone.",
  otp: "482910 is your OTP for login to SBI YONO. Do not share it with anyone. -SBI",
  mid: "Dear customer, your KYC is pending. Update immediately via your bank's app.",
  benign: "Hi Didi, reached the station safely. Will call you after dinner tonight."
};

const UAS = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
  androidTab: "Mozilla/5.0 (Linux; Android 15; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  other: "Mozilla/5.0 (X11; FreeBSD amd64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
};

export async function crawl(browser, base, { kind = "collect", lang = "en", quick = false, log = () => {} } = {}) {
  const found = {};
  const flag = kind === "collect" ? "sf_i18n_collect" : "sf_i18n_audit";
  const prop = kind === "collect" ? "__sfUnits" : "__sfMissing";
  const errors = [];

  async function ctx({ app = true, accepted = true, splash = false, ua, w = 390, h = 844, offsetMs = 0 } = {}) {
    const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900,
      serviceWorkers: "block", userAgent: ua });
    await c.addInitScript(([app, accepted, splash, flag, lang, offsetMs]) => {
      if (offsetMs) { const real = Date.now; Date.now = () => real() + offsetMs; }
      if (app) window.Capacitor = { isNativePlatform: () => true };
      try {
        localStorage.setItem(flag, "1"); localStorage.setItem("sf_lang", lang);
        if (accepted) localStorage.setItem("sf_terms_accepted_v1", "1");
        if (!splash) sessionStorage.setItem("sf_splash_done", "1");
      } catch (e) { /* storage off */ }
    }, [app, accepted, splash, flag, lang, offsetMs]);
    c.on("page", (p) => p.on("pageerror", (e) => errors.push(e.message)));
    const page = await c.newPage();
    page.on("dialog", (d) => d.accept());
    return { c, page };
  }
  const harvest = async (page) => {
    const got = await page.evaluate((prop) => window[prop] || {}, prop).catch(() => ({}));
    for (const [h, v] of Object.entries(got)) if (!found[h]) found[h] = v;
  };
  const go = async (page, url) => { await harvest(page); await page.goto(base + url, { waitUntil: "load" }); await page.waitForTimeout(250); };
  const tapAll = async (page, sel, after) => {
    const n = await page.locator(sel).count();
    for (let i = 0; i < n; i++) { await page.locator(sel).nth(i).click({ force: true }).catch(() => {}); await page.waitForTimeout(120); if (after) await after(i); }
  };

  /* ---- first launch: splash statuses, terms screen, language picker ---- */
  for (const app of [true, false]) {
    const { c, page } = await ctx({ app, accepted: false, splash: true });
    await go(page, "index.html");
    await page.waitForTimeout(3200);
    await page.evaluate(() => window.SFI && SFI.open());
    await page.waitForTimeout(300);
    await page.fill(".ls-search", "zzzz").catch(() => {});
    await page.waitForTimeout(200);
    await harvest(page); await c.close();
  }
  log("first launch");

  /* ---- every screen, both modes, phone and wide screens ---- */
  for (const [app, w, h] of [[true, 390, 844], [false, 390, 844], [false, 1366, 900]]) {
    const { c, page } = await ctx({ app, w, h });
    for (const s of SCREENS) await go(page, s);
    // every scam and scheme briefing
    await go(page, "scam-intel.html");
    const scams = await page.evaluate(() => SF.scams.map((s) => s.id));
    for (const id of scams) await go(page, "scam-detail.html?id=" + id);
    await go(page, "schemes.html");
    const schemes = await page.evaluate(() => SF.schemes.map((s) => s.id));
    for (const id of schemes) await go(page, "scheme-detail.html?id=" + id);
    await harvest(page); await c.close();
    if (quick) break;
  }
  log("screens");

  /* ---- training: every question right and wrong, every result, every progress state ---- */
  {
    const { c, page } = await ctx();
    await go(page, "learn.html");
    await go(page, "training.html");
    const mods = await page.evaluate(() => SF.modules.map((m) => ({ id: m.id, answers: m.questions.map((q) => q.a) })));
    // plan: right answers count per run → 5 (perfect), 4, 3, 0
    const runs = [];
    mods.forEach((m, k) => runs.push({ m, right: k === 0 ? m.answers.length : 0 }));
    runs.push({ m: mods[1], right: mods[1].answers.length - 1 }, { m: mods[2], right: Math.ceil(mods[2].answers.length * 0.6) },
      { m: mods[3], right: mods[3].answers.length });
    for (const [n, { m, right }] of runs.entries()) {
      await go(page, "training.html?module=" + m.id);
      for (let qi = 0; qi < m.answers.length; qi++) {
        const pick = qi < right ? m.answers[qi] : (m.answers[qi] + 1) % 4;
        await page.locator(".quiz-opt").nth(pick).click({ force: true }).catch(() => {});
        await page.waitForTimeout(80);
        await page.click("#quiz-next", { force: true }).catch(() => {});
        await page.waitForTimeout(80);
      }
      await page.waitForTimeout(150);
      if (n === 2) { await go(page, "learn.html"); await go(page, "training.html"); }
    }
    await go(page, "training.html");
    await go(page, "learn.html");
    // every module done
    await page.evaluate((ids) => localStorage.setItem("sf-training-v1", JSON.stringify(Object.fromEntries(ids.map((i) => [i, 5])))), mods.map((m) => m.id));
    await go(page, "learn.html");
    await go(page, "training.html");
    await harvest(page); await c.close();
  }
  log("training");

  /* ---- fraud anatomy and the detection lab ---- */
  {
    const { c, page } = await ctx();
    await go(page, "fraud-anatomy.html");
    await tapAll(page, ".anat-node");
    await page.click("#anat-auto", { force: true }).catch(() => {}); await page.waitForTimeout(300);
    await page.click("#anat-auto", { force: true }).catch(() => {}); await page.waitForTimeout(200);
    await go(page, "detection.html");
    await tapAll(page, ".lab-tab", async () => { await tapAll(page, ".rf-item"); });
    await harvest(page); await c.close();
  }
  log("anatomy, detection");

  /* ---- the scanner: every flag, every verdict, the toasts ---- */
  {
    const { c, page } = await ctx();
    await go(page, "ai-analyzer.html");
    await page.click("#ai-run", { force: true });                 // empty → "paste a message first"
    await page.waitForTimeout(200);
    await tapAll(page, "[data-ex]", async () => {
      await page.click("#ai-run", { force: true }); await page.waitForTimeout(800);
    });
    for (const text of Object.values(SCAN)) {
      await page.fill("#ai-text", text); await page.click("#ai-run", { force: true }); await page.waitForTimeout(800);
    }
    await page.click("#ai-clear", { force: true });
    await harvest(page); await c.close();
  }
  log("scanner");

  /* ---- live content across a year of hours: case feed, ticker, threat map ---- */
  for (let k = 0; k < (quick ? 3 : 40); k++) {
    const { c, page } = await ctx({ offsetMs: k * 217 * 3600000 + k * 3600000 });
    await go(page, "index.html");
    await go(page, "threat-map.html");
    if (k < 6) await tapAll(page, ".map-marker");
    await harvest(page); await c.close();
  }
  log("live content");

  /* ---- web version on each kind of device: install help, download notes ---- */
  for (const [name, ua, w, h] of [["iphone", UAS.iphone, 390, 844], ["ipad", UAS.ipad, 820, 1180],
    ["android", UAS.android, 412, 900], ["androidTab", UAS.androidTab, 800, 1280], ["windows", UAS.windows, 1366, 900],
    ["mac", UAS.mac, 1440, 900], ["linux", UAS.linux, 1366, 900], ["other", UAS.other, 1366, 900]]) {
    const { c, page } = await ctx({ app: false, ua, w, h });
    await go(page, "index.html");
    await go(page, "reports.html");
    await go(page, "more.html");
    await page.click("#m-install", { force: true }).catch(() => {}); await page.waitForTimeout(200);
    if (name === "windows") {
      await page.click("#m-reset", { force: true }).catch(() => {}); await page.waitForTimeout(300);
      await go(page, "contact.html");
      await page.click("[id*=copy], .copy-btn, button:has-text('Copy')", { force: true }).catch(() => {}); await page.waitForTimeout(300);
      await go(page, "reports.html");
      await page.click("#dl-all", { force: true }).catch(() => {}); await page.waitForTimeout(300);
    }
    await harvest(page); await c.close();
    if (quick) break;
  }
  log("devices");

  /* ---- everything else ---- */
  {
    const { c, page } = await ctx();
    await go(page, "index.html");
    await page.evaluate((list) => {
      for (const html of list) { const d = document.createElement("div"); d.innerHTML = html; document.body.appendChild(d); }
    }, EXTRA);
    await page.waitForTimeout(300);
    // a dialog string built in code
    await page.evaluate(() => window.SFI && SFI.t("Reset training progress? Your saved quiz scores on this device will be cleared."));
    await harvest(page); await c.close();
  }
  log("extras");

  return { found, errors };
}
