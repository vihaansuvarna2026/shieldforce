/* Shield Force — More: install, reset progress */
(function () {
  "use strict";
  const inst = SFX.install;
  const row = document.getElementById("m-install");
  const title = document.getElementById("m-install-t");
  const sub = document.getElementById("m-install-s");
  const steps = document.getElementById("m-steps");
  const icon = SFX.icon;

  // current language, in its own script, and the error report addressed with it
  if (!window.SFI || !SFI.multi) {
    // only English is complete so far: nothing to choose or report yet
    document.querySelector("[data-lang-open]")?.remove();
    document.getElementById("m-translation")?.remove();
  } else {
    document.getElementById("m-lang").textContent = SFI.current[2];
    document.getElementById("m-translation").href = "mailto:vihaanssuvarna@gmail.com?subject=" +
      encodeURIComponent(`Shield Force translation error (${SFI.current[1]})`) +
      "&body=" + encodeURIComponent("Screen:\nWhat it says:\nWhat it should say:\n");
  }

  function render() {
    // The store apps are already installed, so there is nothing to offer there.
    if (SFX.native) { row.remove(); steps.remove(); return; }
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
    const ask = "Reset training progress? Your saved quiz scores on this device will be cleared.";
    if (!confirm(window.SFI ? SFI.t(ask) : ask)) return;
    try { localStorage.removeItem("sf-training-v1"); } catch (e) { /* nothing stored */ }
    SFX.toast("Training progress reset");
  });
})();
