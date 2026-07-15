/* Shield Force — home page: ticker, stats, hourly case feed, hero parallax */
(function () {
  "use strict";

  /* ticker (duplicated for seamless loop) */
  const items = SF.ticker.map(t => `<span><b>⚠ ALERT</b> &nbsp;${t}</span>`).join("");
  document.getElementById("ticker-rail").innerHTML = items + items;

  /* stats */
  document.getElementById("stat-grid").innerHTML = SF.stats.map(s => `
    <div class="card card3d stat rv">
      <div class="ico">${s.ico}</div>
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
    const daysAgo = Math.floor(rnd() * 3) + i; // spread over the past week+
    const d = new Date(Date.now() - daysAgo * 86400000);
    feed.push({
      tpl, city,
      day: d.getDate(), mon: MONTHS[d.getMonth()],
      victim: pick(SF.victims),
      source: pick(SF.sources),
      loss: (Math.floor(rnd() * 46) + 3) * 5000
    });
  }

  document.getElementById("case-feed").innerHTML = feed.map((c, i) => {
    const scam = SF.scamById(c.tpl.s);
    return `
    <a class="case-item rv" href="scam-detail.html?id=${c.tpl.s}" style="text-decoration:none;color:inherit">
      <div class="case-date"><b>${c.day}</b><span>${c.mon}</span></div>
      <div class="case-body">
        <h4>${scam.icon} ${c.tpl.t}</h4>
        <p>${c.victim} targeted • approx. loss ₹${c.loss.toLocaleString("en-IN")} • pattern: ${scam.name}</p>
      </div>
      <div class="case-meta">
        <span class="tag tag-blue">${c.source}</span>
        <span class="case-loc">${c.city.name}, ${c.city.state}</span>
      </div>
    </a>`;
  }).join("");

  /* hero shield parallax */
  const shield = document.getElementById("hero-shield");
  if (shield && !matchMedia("(hover: none)").matches) {
    addEventListener("pointermove", (e) => {
      const rx = (e.clientY / innerHeight - 0.5) * -16;
      const ry = (e.clientX / innerWidth - 0.5) * 20;
      shield.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }, { passive: true });
  }

  SFX.reveal(); SFX.addGlares(); SFX.watchCounters();
})();
