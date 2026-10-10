/* Shield Force — Learn: show training progress saved on this device */
(function () {
  "use strict";
  const TOTAL = 6;
  let done = 0;
  try { done = Object.keys(JSON.parse(localStorage.getItem("sf-training-v1") || "{}") || {}).length; } catch (e) { done = 0; }
  if (done > 0) {
    document.getElementById("learn-progress").textContent =
      done >= TOTAL ? `All ${TOTAL} modules completed — retake any to beat your score`
                    : `${done} of ${TOTAL} modules completed`;
  }
})();
