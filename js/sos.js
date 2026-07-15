/* Shield Force — emergency page: steps + contact directory */
(function () {
  "use strict";

  document.getElementById("sos-steps").innerHTML = SF.goldenSteps.map(([t, d], i) => `
    <div class="step rv">
      <div class="n" style="${i === 0 ? "border-color:rgba(255,77,94,.6);color:var(--red);background:rgba(255,77,94,.08)" : ""}">${String(i + 1).padStart(2, "0")}</div>
      <div><h4>${t}</h4><p>${d}</p></div>
    </div>`).join("");

  document.getElementById("sos-contacts").innerHTML = SF.contacts.map(c => `
    <div class="card card3d contact-card rv">
      <span class="who">${c.who}</span>
      <h3>${c.name}</h3>
      ${c.tel
        ? `<a class="dial" href="tel:${c.tel}" style="text-decoration:none">📞 ${c.dial}</a>`
        : `<span class="dial" style="font-size:1.05rem">${c.dial}</span>`}
      <p>${c.desc}</p>
      <div class="links">
        ${c.tel ? `<a class="xlink red" href="tel:${c.tel}">Call now</a>` : ""}
        ${c.links.map(([label, url]) => `<a class="xlink" href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join("")}
      </div>
    </div>`).join("");

  SFX.reveal(); SFX.addGlares();
})();
