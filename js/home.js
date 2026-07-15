/* Shield Force — home page: ticker, stats, hourly case feed, hero parallax */
(function () {
  "use strict";

  /* ticker (duplicated for seamless loop) */
  const items = SF.ticker.map(t => `<span><b>⚠ ALERT</b> &nbsp;${t}</span>`).join("");
  document.getElementById("ticker-rail").innerHTML = items + items;

  /* stats — editorial hairline band */
  document.getElementById("stat-grid").innerHTML = SF.stats.map(s => `
    <div class="stat rv">
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

  /* hero entrance: masked line reveal after the veil clears */
  setTimeout(() => document.body.classList.add("hero-in"), 350);

  /* seamless scroll parallax: headline, watermark and orbs drift at different depths */
  const mega = document.querySelector(".mega");
  const mark = document.getElementById("hero-mark");
  const lede = document.querySelector(".hero2 .lede");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        if (y < innerHeight * 1.2) {
          if (mega) mega.style.transform = `translateY(${y * 0.18}px)`;
          if (mark) mark.style.transform = `translateY(${y * -0.12}px)`;
          if (lede) lede.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 0.55)));
        }
        ticking = false;
      });
    }, { passive: true });

    /* subtle pointer drift on the watermark for depth */
    if (!matchMedia("(hover: none)").matches && mark) {
      addEventListener("pointermove", (e) => {
        const dx = (e.clientX / innerWidth - 0.5) * -18;
        mark.style.translate = `${dx}px 0`;
      }, { passive: true });
    }
  }

  SFX.reveal(); SFX.addGlares(); SFX.watchCounters();
})();
