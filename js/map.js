/* Shield Force — hourly-syncing India threat map */
(function () {
  "use strict";

  /* Stylised low-poly outline of India (620x700 viewBox) */
  const INDIA = [
    [205, 34], [236, 44], [262, 60], [288, 70], [282, 92], [262, 104],
    [258, 124], [282, 140], [306, 158], [330, 172], [372, 196], [412, 214],
    [438, 210], [448, 218], [470, 214], [496, 220], [522, 210], [556, 196],
    [592, 206], [576, 226], [556, 232], [566, 252], [556, 282], [540, 304],
    [524, 288], [514, 258], [496, 248], [470, 250], [462, 232], [448, 226],
    [444, 248], [458, 286], [452, 316], [430, 334], [398, 356], [372, 384],
    [360, 400], [340, 432], [330, 458], [322, 484], [316, 508], [302, 548],
    [285, 578], [272, 602], [262, 622], [252, 602], [240, 568], [232, 528],
    [222, 492], [210, 452], [196, 414], [182, 384], [176, 364], [166, 342],
    [170, 326], [158, 330], [138, 338], [116, 332], [102, 318], [98, 300],
    [110, 286], [130, 280], [144, 288], [152, 276], [128, 272], [102, 268],
    [86, 254], [92, 240], [114, 234], [142, 240], [156, 232], [162, 208],
    [178, 186], [196, 164], [206, 144], [198, 122], [206, 100], [192, 78],
    [198, 54]
  ];

  const TYPE_COLORS = {
    "fake-upi": "#ffa53e",
    "otp-phishing": "#4d9fff",
    "pension": "#ff4d5e",
    "investment": "#2ee6a8",
    "impersonation": "#9d7bff",
    "welfare": "#ffd166",
    "loan-identity": "#ff8fab",
    "digital-arrest": "#ff6b4d"
  };

  const svgNS = "http://www.w3.org/2000/svg";
  const panel = document.getElementById("map-panel");
  const gLand = document.getElementById("map-land");
  const gCities = document.getElementById("map-cities");
  const gMarkers = document.getElementById("map-markers");
  let popup = null;

  /* land */
  const d = "M" + INDIA.map(p => p.join(" ")).join(" L") + " Z";
  gLand.innerHTML = `
    <path class="land-inner" d="${d}"/>
    <path class="land" d="${d}" fill="url(#landGlow)" stroke-linejoin="round"/>`;

  /* faint city dots + labels for a few anchors */
  gCities.innerHTML = SF.cities.map(c => `
    <circle cx="${c.x}" cy="${c.y}" r="2.2" fill="rgba(150,180,230,.35)"/>
  `).join("") + ["New Delhi", "Mumbai", "Kolkata", "Chennai", "Srinagar", "Guwahati"]
    .map(n => {
      const c = SF.cities.find(x => x.name === n);
      return `<text x="${c.x + 7}" y="${c.y + 3}" fill="rgba(150,180,230,.5)" font-size="11" font-family="inherit">${n}</text>`;
    }).join("");

  /* ---------------- hourly incident generation ---------------- */
  function buildIncidents(hourSeed) {
    const rnd = SF.mulberry32(hourSeed * 104729 + 7);
    const n = 9 + Math.floor(rnd() * 5); // 9–13 markers
    const incidents = [];
    const used = new Set();
    for (let i = 0; i < n; i++) {
      let ci = Math.floor(rnd() * SF.cities.length), guard = 0;
      while (used.has(ci) && guard++ < 30) ci = Math.floor(rnd() * SF.cities.length);
      used.add(ci);
      const city = SF.cities[ci];
      const scam = SF.scams[Math.floor(rnd() * SF.scams.length)];
      const minsAgo = Math.floor(rnd() * 55) + 3;
      incidents.push({
        city, scam,
        victim: SF.victims[Math.floor(rnd() * SF.victims.length)],
        source: SF.sources[Math.floor(rnd() * SF.sources.length)],
        loss: (Math.floor(rnd() * 58) + 2) * 5000,
        minsAgo,
        frozen: rnd() < 0.35
      });
    }
    return incidents;
  }

  function renderMarkers(incidents) {
    gMarkers.innerHTML = "";
    closePopup();
    incidents.forEach((inc, i) => {
      const col = TYPE_COLORS[inc.scam.id] || "#ffa53e";
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "map-marker");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Incident in ${inc.city.name}: ${inc.scam.name}`);
      g.innerHTML = `
        <circle class="pulse" cx="${inc.city.x}" cy="${inc.city.y}" r="9" fill="none" stroke="${col}" stroke-width="2" style="animation-delay:${(i % 5) * .4}s"/>
        <circle class="core" cx="${inc.city.x}" cy="${inc.city.y}" r="6.5" fill="${col}" stroke="rgba(5,9,18,.9)" stroke-width="2"/>
        <text x="${inc.city.x}" y="${inc.city.y + 3.2}" text-anchor="middle" font-size="7.5" font-weight="900" fill="#04070e">!</text>`;
      const open = () => openPopup(inc, col);
      g.addEventListener("click", (e) => { e.stopPropagation(); open(); });
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      gMarkers.appendChild(g);
    });
  }

  function openPopup(inc, col) {
    closePopup();
    const svg = document.getElementById("india-map");
    const pt = svg.createSVGPoint();
    pt.x = inc.city.x; pt.y = inc.city.y;
    const sp = pt.matrixTransform(svg.getScreenCTM());
    const pr = panel.getBoundingClientRect();
    popup = document.createElement("div");
    popup.className = "map-pop";
    popup.innerHTML = `
      <h4><span>${inc.scam.icon} ${inc.scam.name}</span><span class="x" role="button" aria-label="Close">✕</span></h4>
      <p>${inc.victim} targeted near <b style="color:var(--blue)">${inc.city.name}, ${inc.city.state}</b> — pattern intercepted ${inc.minsAgo} min into the hour. Source: ${inc.source}.</p>
      <div class="row"><span>Reported loss</span><b>₹${inc.loss.toLocaleString("en-IN")}</b></div>
      <div class="row"><span>Golden-window action</span><b style="color:${inc.frozen ? "var(--teal)" : "var(--red)"}">${inc.frozen ? "Funds freeze initiated" : "Reported late"}</b></div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <a class="xlink gold" style="font-size:.7rem;padding:6px 12px" href="scam-detail.html?id=${inc.scam.id}">Full briefing ⟶</a>
        <a class="xlink red" style="font-size:.7rem;padding:6px 12px" href="emergency.html">Report ⟶</a>
      </div>`;
    let left = sp.x - pr.left, top = sp.y - pr.top;
    left = Math.max(140, Math.min(pr.width - 140, left));
    popup.style.left = left + "px";
    popup.style.top = Math.max(150, top) + "px";
    popup.style.borderTop = `2px solid ${col}`;
    popup.querySelector(".x").addEventListener("click", closePopup);
    panel.appendChild(popup);
  }
  function closePopup() { if (popup) { popup.remove(); popup = null; } }
  document.addEventListener("click", (e) => {
    if (popup && !popup.contains(e.target) && !e.target.closest(".map-marker")) closePopup();
  });

  /* ---------------- side panels ---------------- */
  function renderSide(incidents) {
    const counts = {};
    incidents.forEach(i => { counts[i.scam.id] = (counts[i.scam.id] || 0) + 1; });
    document.getElementById("map-legend").innerHTML = Object.entries(TYPE_COLORS)
      .filter(([id]) => counts[id])
      .map(([id, col]) => {
        const s = SF.scamById(id);
        return `<div class="legend-row"><i style="background:${col};box-shadow:0 0 10px ${col}"></i>${s.name} <b style="margin-left:auto;color:var(--txt)">${counts[id]}</b></div>`;
      }).join("");

    const total = incidents.reduce((a, i) => a + i.loss, 0);
    const frozen = incidents.filter(i => i.frozen).length;
    const states = {};
    incidents.forEach(i => { states[i.city.state] = (states[i.city.state] || 0) + 1; });
    const hot = Object.entries(states).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("map-stats").innerHTML = `
      <div class="map-stat-row"><span>Active incident markers</span><b>${incidents.length}</b></div>
      <div class="map-stat-row"><span>Combined reported loss</span><b>₹${(total / 100000).toFixed(1)} L</b></div>
      <div class="map-stat-row"><span>Golden-window freezes</span><b style="color:var(--teal)">${frozen}</b></div>
      <div class="map-stat-row"><span>Hottest zone</span><b>${hot ? hot[0] : "—"}</b></div>`;
  }

  /* ---------------- sync clock ---------------- */
  const HOUR = 3600000;
  let currentSeed = -1;

  function sync() {
    const seed = Math.floor(Date.now() / HOUR);
    if (seed !== currentSeed) {
      currentSeed = seed;
      const inc = buildIncidents(seed);
      renderMarkers(inc);
      renderSide(inc);
      const last = new Date(seed * HOUR);
      document.getElementById("map-last").textContent =
        last.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      if (window.SFX && seedInitDone) SFX.toast("🛰 Threat grid re-synced with the latest hourly picture");
    }
    seedInitDone = true;
  }
  let seedInitDone = false;

  function clock() {
    const now = Date.now();
    const into = now % HOUR;
    const remain = HOUR - into;
    const m = Math.floor(remain / 60000), s = Math.floor((remain % 60000) / 1000);
    document.getElementById("map-next").textContent = `${m}m ${String(s).padStart(2, "0")}s`;
    document.querySelector("#map-refresh-bar i").style.width = (into / HOUR * 100).toFixed(2) + "%";
    sync();
  }

  sync();
  clock();
  setInterval(clock, 1000);

  SFX.reveal(); SFX.addGlares();
})();
