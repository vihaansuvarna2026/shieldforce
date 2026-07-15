/* Shield Force — detection lab: seven signs + interactive red-flag dissection */
(function () {
  "use strict";

  /* seven signs */
  document.getElementById("signs-grid").innerHTML = SF.signs.map((s, i) => `
    <div class="card card3d sign-card rv">
      <span class="n">SIGN ${String(i + 1).padStart(2, "0")}</span>
      <h4>${s.t}</h4>
      <p>${s.d}</p>
    </div>`).join("");

  /* lab */
  const KEY_LABELS = {
    urgency: "Manufactured urgency", link: "Suspicious link", otp: "OTP harvesting",
    threat: "Threat language", identity: "Unverifiable identity", meet: "Refuses to meet",
    qr: "QR / PIN trap", fee: "Advance-fee demand"
  };

  const tabs = document.getElementById("lab-tabs");
  const msgBox = document.getElementById("lab-msg");
  const flagBox = document.getElementById("lab-flags");

  tabs.innerHTML = SF.labExamples.map((ex, i) =>
    `<button class="lab-tab ${i === 0 ? "active" : ""}" data-i="${i}">${ex.label}</button>`).join("");

  function load(i) {
    const ex = SF.labExamples[i];
    let flagIdx = 0;
    const flags = [];
    const html = ex.parts.map(part => {
      if (typeof part === "string") return part;
      const id = flagIdx++;
      flags.push({ id, ...part });
      return `<mark class="rf" data-f="${id}">${part.t}</mark>`;
    }).join("");
    msgBox.innerHTML = `<div class="from">FROM: ${ex.from}</div>${html}`;
    flagBox.innerHTML = flags.map((f, j) => `
      <div class="rf-item" data-f="${f.id}" style="animation:flagIn .4s ${j * 0.08}s ease backwards">
        <span class="k">🚩 ${String(f.id + 1).padStart(2, "0")}</span>
        <span><b>${KEY_LABELS[f.k] || f.k}</b><p>${f.why}</p></span>
      </div>`).join("");
    wire();
  }

  function wire() {
    const light = (id, on) => {
      document.querySelectorAll(`[data-f="${id}"]`).forEach(el => el.classList.toggle("lit", on));
    };
    document.querySelectorAll("mark.rf, .rf-item").forEach(el => {
      const id = el.dataset.f;
      el.addEventListener("mouseenter", () => light(id, true));
      el.addEventListener("mouseleave", () => light(id, false));
      el.addEventListener("click", () => {
        document.querySelectorAll(".lit").forEach(x => x.classList.remove("lit"));
        light(id, true);
        const target = el.classList.contains("rf-item")
          ? document.querySelector(`mark.rf[data-f="${id}"]`)
          : document.querySelector(`.rf-item[data-f="${id}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  tabs.addEventListener("click", (e) => {
    const b = e.target.closest(".lab-tab");
    if (!b) return;
    tabs.querySelectorAll(".lab-tab").forEach(t => t.classList.remove("active"));
    b.classList.add("active");
    load(+b.dataset.i);
  });

  load(0);
  SFX.reveal(); SFX.addGlares();
})();
