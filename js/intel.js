/* Shield Force — scam intel grid + detail briefing */
(function () {
  "use strict";

  const grid = document.getElementById("intel-grid");
  if (grid) {
    grid.innerHTML = SF.scams.map(s => `
      <a class="card card3d intel-card rv" href="scam-detail.html?id=${s.id}" style="text-decoration:none;color:inherit">
        <div class="ico">${s.icon}</div>
        <h3>${s.name}</h3>
        <p>${s.tagline}</p>
        <div class="foot">
          <span class="tag ${s.severity === "Critical" ? "tag-red" : "tag-gold"}">${s.severity}</span>
          <span class="go">Full briefing ⟶</span>
        </div>
      </a>`).join("");
    SFX.reveal(); SFX.addGlares();
    return;
  }

  /* ---- detail page ---- */
  const id = new URLSearchParams(location.search).get("id");
  const scam = SF.scamById(id) || SF.scams[0];
  document.title = `${scam.name} — Shield Force`;

  document.getElementById("d-hero").innerHTML = `
    <div class="ico">${scam.icon}</div>
    <div>
      <span class="tag ${scam.severity === "Critical" ? "tag-red" : "tag-gold"}">${scam.severity} threat</span>
      <h1 style="margin:10px 0 8px">${scam.name}</h1>
      <p class="sub">${scam.tagline}</p>
    </div>`;

  document.getElementById("d-links").innerHTML = `
    <a class="xlink" href="scam-intel.html">⟵ All scam intel</a>
    <a class="xlink gold" href="training.html?module=${scam.module}">🎓 Train against this scam</a>
    <a class="xlink" href="ai-analyzer.html">🤖 Analyze a suspicious message</a>`;

  document.getElementById("d-steps").innerHTML = scam.how.map(([t, d], i) => `
    <div class="step rv">
      <div class="n">${String(i + 1).padStart(2, "0")}</div>
      <div><h4>${t}</h4><p>${d}</p></div>
    </div>`).join("");

  document.getElementById("d-cases").innerHTML = scam.cases.map(c => `
    <div class="case-study rv">
      <div class="meta">${c.meta}</div>
      <h4>${c.title}</h4>
      <p>${c.text} <span class="loss">Loss: ${c.loss}.</span></p>
    </div>`).join("");

  document.getElementById("d-protect").innerHTML =
    scam.protect.map(p => `<div class="protect-item rv">${p}</div>`).join("");

  document.getElementById("d-foot-links").innerHTML = `
    <a class="btn btn-gold btn-sm" href="training.html?module=${scam.module}">Start the ${SF.moduleById(scam.module).title} module ⟶</a>
    <a class="btn btn-ghost btn-sm" href="fraud-anatomy.html">See the 6-phase fraud anatomy</a>
    <a class="btn btn-red btn-sm" href="emergency.html">🚨 Emergency protocol</a>`;

  SFX.reveal(); SFX.addGlares();
})();
