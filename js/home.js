/* Shield Force — Home: alert strip, stats, hourly case feed, install prompt */
(function () {
  "use strict";

  /* alert strip (duplicated so the loop is seamless) */
  const items = SF.ticker.map(t => `<span><b>⚠ ALERT</b> &nbsp;${t}</span>`).join("");
  document.getElementById("ticker-rail").innerHTML = items + items;

  /* stats */
  document.getElementById("stat-grid").innerHTML = SF.stats.map(s => `
    <div class="stat">
      <div class="num" data-count data-end="${s.end}" data-fmt="${s.fmt}">0</div>
      <div class="lbl">${s.lbl}</div>
      <span class="delta ${s.dir}">${s.delta}</span>
    </div>`).join("");

  /* hourly-seeded latest case feed */
  const hourSeed = Math.floor(Date.now() / 3600000);
  const rnd = SF.mulberry32(hourSeed * 7919);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const feed = [];
  const usedCity = new Set();
  for (let i = 0; i < 6; i++) {
    const tpl = SF.caseTemplates[Math.floor(rnd() * SF.caseTemplates.length)];
    let city = pick(SF.cities);
    let guard = 0;
    while (usedCity.has(city.name) && guard++ < 10) city = pick(SF.cities);
    usedCity.add(city.name);
    const d = new Date(Date.now() - (Math.floor(rnd() * 3) + i) * 86400000);
    feed.push({
      tpl, city,
      day: d.getDate(), mon: MONTHS[d.getMonth()],
      victim: pick(SF.victims),
      source: pick(SF.sources),
      loss: (Math.floor(rnd() * 46) + 3) * 5000
    });
  }

  const chev = SFX.icon("chev");
  document.getElementById("case-feed").innerHTML = feed.map((c) => {
    const scam = SF.scamById(c.tpl.s);
    return `
    <a class="case-item" href="scam-detail.html?id=${c.tpl.s}">
      <div class="case-date"><b>${c.day}</b><span>${c.mon}</span></div>
      <div class="case-body">
        <h4>${scam.icon} ${c.tpl.t}</h4>
        <p>${c.victim} · approx. ₹${c.loss.toLocaleString("en-IN")} · ${c.source}</p>
        <span class="case-loc">📍 ${c.city.name}, ${c.city.state}</span>
      </div>
      <span class="case-chev">${chev}</span>
    </a>`;
  }).join("");

  /* install prompt: only when the app isn't installed yet and the user hasn't dismissed it */
  const row = document.getElementById("install-row");
  const DISMISS_KEY = "sf_install_dismissed";
  const inst = SFX.install;
  function updateInstallRow() {
    const show = !inst.standalone() && SFX.storageGet(DISMISS_KEY) !== "1" && (inst.available() || inst.ios());
    row.hidden = !show;
    // iOS has no install prompt to trigger; send people to the step-by-step instructions
    document.getElementById("install-btn").textContent = inst.available() ? "Install" : "How";
  }
  document.getElementById("install-btn").addEventListener("click", async () => {
    if (inst.available()) {
      const outcome = await inst.prompt();
      if (outcome === "accepted") row.hidden = true;
      else updateInstallRow();
    } else {
      location.href = "more.html#install";
    }
  });
  document.getElementById("install-dismiss").addEventListener("click", () => {
    SFX.storageSet(DISMISS_KEY, "1");
    row.hidden = true;
  });
  document.addEventListener("sf:installable", updateInstallRow);
  document.addEventListener("sf:installed", () => { row.hidden = true; });
  updateInstallRow();

  SFX.watchCounters();
})();
