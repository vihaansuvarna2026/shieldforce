/* Shield Force — More: install, reset progress */
(function () {
  "use strict";
  const inst = SFX.install;
  const row = document.getElementById("m-install");
  const title = document.getElementById("m-install-t");
  const sub = document.getElementById("m-install-s");
  const steps = document.getElementById("m-steps");
  const icon = SFX.icon;

  function render() {
    if (inst.standalone()) {
      title.textContent = "Installed";
      sub.textContent = "You're using Shield Force as an app — it works offline";
      row.disabled = true;
      row.querySelector(".li-chev").hidden = true;
      steps.hidden = true;
      return;
    }
    title.textContent = "Install Shield Force";
    sub.textContent = inst.available()
      ? "Add it to your home screen — works fully offline"
      : "Add it to your home screen — tap for how";
  }

  function showSteps() {
    // iOS/iPadOS has no programmatic install; Safari's Share sheet is the only route
    steps.innerHTML = inst.ios()
      ? `<ol>
           <li>Open this page in <b>Safari</b>.</li>
           <li>Tap the <b>Share</b> button ${icon("share")} in the toolbar.</li>
           <li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li>
         </ol>`
      : `<ol>
           <li>Open your browser's menu (<b>⋮</b> or <b>⋯</b>).</li>
           <li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li>
           <li>Confirm — Shield Force appears with your other apps.</li>
         </ol>`;
    steps.hidden = !steps.hidden;
  }

  row.addEventListener("click", async () => {
    if (inst.standalone()) return;
    if (inst.available()) {
      const outcome = await inst.prompt();
      if (outcome === "accepted") SFX.toast("Installing Shield Force…");
      render();
    } else {
      showSteps();
    }
  });
  document.addEventListener("sf:installable", render);
  document.addEventListener("sf:installed", render);
  render();
  if (location.hash === "#install" && !inst.standalone() && !inst.available()) showSteps();

  document.getElementById("m-reset").addEventListener("click", () => {
    if (!confirm("Reset training progress? Your saved quiz scores on this device will be cleared.")) return;
    try { localStorage.removeItem("sf-training-v1"); } catch (e) { /* nothing stored */ }
    SFX.toast("Training progress reset");
  });
})();
