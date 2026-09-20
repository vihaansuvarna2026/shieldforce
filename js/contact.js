/* Shield Force — contact page: official channel directory + copy-to-clipboard */
(function () {
  "use strict";

  document.getElementById("contact-grid").innerHTML = SF.contacts.map(c => `
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

  const email = document.getElementById("sf-email").textContent.trim();
  document.getElementById("copy-email").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch (err) {
      // clipboard API unavailable (http, old browser, denied permission) — select the text instead
      const r = document.createRange();
      r.selectNodeContents(document.getElementById("sf-email"));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    }
    btn.textContent = ok ? "✓ Copied" : "Select and copy manually";
    SFX.toast(ok ? `Copied <b>${email}</b>` : "Couldn't copy — the address is selected, press Ctrl/Cmd+C");
    setTimeout(() => { btn.textContent = "📋 Copy address"; }, 2600);
  });

  SFX.reveal(); SFX.addGlares();
})();
