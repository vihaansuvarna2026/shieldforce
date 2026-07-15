/* Shield Force — schemes grid + scheme detail briefing */
(function () {
  "use strict";

  const grid = document.getElementById("scheme-grid");
  if (grid) {
    grid.innerHTML = SF.schemes.map(s => `
      <a class="card card3d scheme-card rv" href="scheme-detail.html?id=${s.id}" style="text-decoration:none;color:inherit">
        <span class="abbr">${s.abbr}</span>
        <h3>${s.name}</h3>
        <p>${s.tagline}</p>
        <div class="foot" style="display:flex;justify-content:space-between;align-items:center">
          <span class="tag tag-blue">${s.category}</span>
          <span class="go" style="color:var(--teal);font-weight:800;font-size:.8rem">Details ⟶</span>
        </div>
      </a>`).join("");
    SFX.reveal(); SFX.addGlares();
    return;
  }

  /* detail */
  const id = new URLSearchParams(location.search).get("id");
  const s = SF.schemeById(id) || SF.schemes[0];
  document.title = `${s.abbr} — ${s.name} — Shield Force`;

  document.getElementById("s-hero").innerHTML = `
    <div class="ico" style="font-size:1.2rem;font-weight:900;letter-spacing:.08em;color:var(--teal);background:linear-gradient(145deg,rgba(46,230,168,.16),rgba(46,230,168,.04));border-color:rgba(46,230,168,.4);box-shadow:var(--glow-teal)">${s.abbr}</div>
    <div>
      <span class="tag tag-blue">${s.category}</span>
      <h1 style="margin:10px 0 8px">${s.name}</h1>
      <p class="sub">${s.tagline}</p>
    </div>`;

  document.getElementById("s-benefits").innerHTML =
    s.benefits.map(b => `<li class="rv">${b}</li>`).join("");
  document.getElementById("s-who").innerHTML =
    s.who.map(w => `<span>${w}</span>`).join("");
  document.getElementById("s-risks").innerHTML =
    s.risks.map(r => `<li class="rv">${r}</li>`).join("");

  document.getElementById("s-links").innerHTML = `
    <a class="btn btn-gold btn-sm" href="training.html">🎓 Train against these frauds</a>
    <a class="btn btn-ghost btn-sm" href="reports.html">📄 Download related PDF alerts</a>
    <a class="btn btn-red btn-sm" href="emergency.html">🚨 Emergency protocol</a>`;

  SFX.reveal(); SFX.addGlares();
})();
