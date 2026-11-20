/* Shield Force — screen transitions. Loaded in <head> so it is listening before the
   arriving screen's first frame; js/main.js records which way the user is moving. */
(function () {
  "use strict";
  const KEY = "sf_vt";
  // A transition is skipped when screens change faster than it can play. That is
  // expected, so its promises must not surface as errors.
  const quiet = (vt) => { for (const p of [vt.ready, vt.finished, vt.updateCallbackDone]) if (p) p.catch(() => {}); };

  addEventListener("pageswap", (e) => { if (e.viewTransition) quiet(e.viewTransition); });

  addEventListener("pagereveal", (e) => {
    let type = null;
    try { type = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (err) { /* storage off */ }
    if (!e.viewTransition) return;
    quiet(e.viewTransition);
    try {
      if (!type && window.navigation && navigation.activation &&
          navigation.activation.navigationType === "traverse") type = "pop";
      if (type) e.viewTransition.types.add(type);   // push / pop / tab → slide direction
    } catch (err) { /* types unsupported: the default cross-fade still runs */ }
  });
})();
