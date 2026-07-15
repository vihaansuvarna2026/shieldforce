/* Shield Force — interactive 6-phase fraud anatomy diagram */
(function () {
  "use strict";

  const track = document.getElementById("anat-track");
  const prog = document.getElementById("anat-prog");
  const detail = document.getElementById("anat-detail");
  let idx = 0, autoTimer = null;

  track.innerHTML = SF.anatomy.map((p, i) => `
    <div class="anat-node" data-i="${i}" role="button" tabindex="0" aria-label="${p.phase}: ${p.t}">
      <div class="bulb">${p.icon}</div>
      <div class="ph">${p.phase}</div>
      <h4>${p.t}</h4>
    </div>`).join("");
  prog.innerHTML = SF.anatomy.map(() => "<i></i>").join("");

  function show(i, fromAuto) {
    idx = (i + SF.anatomy.length) % SF.anatomy.length;
    const p = SF.anatomy[idx];
    track.querySelectorAll(".anat-node").forEach((n, j) => n.classList.toggle("active", j === idx));
    prog.querySelectorAll("i").forEach((b, j) => b.classList.toggle("on", j <= idx));
    detail.innerHTML = `
      <div class="head">
        <div class="bulb" style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;font-size:1.5rem;background:rgba(255,165,62,.1);border:1px solid rgba(255,165,62,.35)">${p.icon}</div>
        <div>
          <span class="tag tag-gold">${p.phase} of 6</span>
          <h3 style="margin-top:6px">${p.t}</h3>
        </div>
      </div>
      <p>${p.d}</p>
      <div class="anat-shield">🛡 <span><b>Protect yourself:</b> ${p.shield}</span></div>`;
    if (!fromAuto) stopAuto();
  }

  track.addEventListener("click", (e) => {
    const n = e.target.closest(".anat-node");
    if (n) show(+n.dataset.i);
  });
  track.addEventListener("keydown", (e) => {
    const n = e.target.closest(".anat-node");
    if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(+n.dataset.i); }
  });
  document.getElementById("anat-prev").addEventListener("click", () => show(idx - 1));
  document.getElementById("anat-next").addEventListener("click", () => show(idx + 1));

  const autoBtn = document.getElementById("anat-auto");
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; autoBtn.textContent = "▶ Auto-play the fraud"; }
  }
  autoBtn.addEventListener("click", () => {
    if (autoTimer) { stopAuto(); return; }
    autoBtn.textContent = "⏸ Stop auto-play";
    show(0, true);
    autoTimer = setInterval(() => {
      if (idx === SF.anatomy.length - 1) { stopAuto(); return; }
      show(idx + 1, true);
    }, 3400);
  });

  show(0);
  SFX.reveal(); SFX.addGlares();
})();
