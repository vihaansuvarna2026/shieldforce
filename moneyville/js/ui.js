/* =============================================================================
   MoneyVille — Shared UI Helpers & Components
   -----------------------------------------------------------------------------
   Small, dependency-free helpers for building DOM, formatting currency, and
   the reusable pieces every level needs: HUD, star ratings, toasts, feedback
   cards and the end-of-level results screen (GDD §13 User Interface).
   ============================================================================= */
(function (global) {
  "use strict";

  const { CONFIG, BADGES } = global.MV_DATA;

  /* ---- Tiny DOM builder --------------------------------------------------- */
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k === "text") node.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "dataset" && typeof v === "object") Object.assign(node.dataset, v);
      else node.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    });
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  /* ---- Formatting --------------------------------------------------------- */
  function money(n) {
    const v = Math.round((n + Number.EPSILON) * 100) / 100;
    const s = Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${CONFIG.currency} ${s}`;
  }
  function pct(n) { return `${Math.round(n)}%`; }

  /* ---- Stars -------------------------------------------------------------- */
  function stars(count, max = 3) {
    const wrap = el("span", { class: "stars", "aria-label": `${count} of ${max} stars` });
    for (let i = 1; i <= max; i++) {
      wrap.appendChild(el("span", { class: "star " + (i <= count ? "on" : "off"), text: i <= count ? "★" : "☆" }));
    }
    return wrap;
  }

  /* ---- Toast / announcement ---------------------------------------------- */
  let toastHost;
  function toast(msg, kind = "info", ms = 2600) {
    if (!toastHost) {
      toastHost = el("div", { class: "toast-host" });
      document.body.appendChild(toastHost);
    }
    const t = el("div", { class: `toast toast-${kind}`, html: msg });
    toastHost.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, ms);
  }

  /* ---- Badge popup -------------------------------------------------------- */
  function badgePopup(badgeIds) {
    badgeIds.forEach((id, i) => {
      const b = BADGES[id];
      if (!b) return;
      setTimeout(() => toast(
        `<span class="toast-badge">${b.icon}</span><strong>Badge unlocked!</strong><br>${b.name}`,
        "badge", 3400), i * 600);
    });
  }

  /* ---- Feedback card (GDD §12) ------------------------------------------- */
  function feedbackCard(kind, text) {
    // kind: good | tradeoff | corrective
    const label = { good: "Nice work", tradeoff: "Trade-off", corrective: "Something to learn" }[kind] || "Feedback";
    const icon = { good: "✅", tradeoff: "⚖️", corrective: "💡" }[kind] || "ℹ️";
    return el("div", { class: `feedback feedback-${kind}` }, [
      el("div", { class: "feedback-icon", text: icon }),
      el("div", {}, [
        el("div", { class: "feedback-label", text: label }),
        el("div", { class: "feedback-text", text }),
      ]),
    ]);
  }

  /* ---- Stat pill (used in HUD & elsewhere) ------------------------------- */
  function statPill(icon, label, value, cls = "") {
    return el("div", { class: `stat-pill ${cls}` }, [
      el("span", { class: "stat-icon", text: icon }),
      el("span", { class: "stat-body" }, [
        el("span", { class: "stat-label", text: label }),
        el("span", { class: "stat-value", text: value }),
      ]),
    ]);
  }

  /* ---- Progress bar ------------------------------------------------------- */
  function progressBar(value, max, opts = {}) {
    const p = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    const bar = el("div", { class: "pbar " + (opts.class || "") }, [
      el("div", { class: "pbar-fill", style: { width: p + "%" } }),
    ]);
    if (opts.label) {
      return el("div", { class: "pbar-wrap" }, [
        el("div", { class: "pbar-top" }, [
          el("span", { text: opts.label }),
          el("span", { class: "pbar-num", text: opts.format ? opts.format(value, max) : `${money(value)} / ${money(max)}` }),
        ]),
        bar,
      ]);
    }
    return bar;
  }

  /* ---- End-of-level results screen (GDD §13 End-Level Screen) ------------ */
  function resultsScreen({ level, result, outcome, onReplay, onContinue, extraNodes }) {
    const host = el("div", { class: "results" });

    host.appendChild(el("div", { class: "results-hero" }, [
      el("div", { class: "results-emoji", text: outcome.passed ? "🎉" : "💪" }),
      el("h2", { text: outcome.passed ? "Level complete!" : "Month finished" }),
      el("div", { class: "results-stars" }, [stars(result.stars)]),
      el("div", { class: "results-sub", text: outcome.passed
        ? `You earned ${result.xpEarned} Money XP` : "Give it another go to earn more stars" }),
    ]));

    // Category breakdown.
    const cats = outcome.categories || {};
    if (Object.keys(cats).length) {
      const grid = el("div", { class: "results-cats" });
      for (const [name, v] of Object.entries(cats)) {
        const p = v.max > 0 ? (v.value / v.max) * 100 : 0;
        grid.appendChild(el("div", { class: "results-cat" }, [
          el("div", { class: "results-cat-top" }, [
            el("span", { text: name }),
            el("span", { class: "results-cat-num", text: pct(p) }),
          ]),
          progressBar(v.value, v.max, { class: p >= 66 ? "good" : p >= 33 ? "mid" : "low" }),
        ]));
      }
      host.appendChild(el("h3", { class: "results-h", text: "How you did" }));
      host.appendChild(grid);
    }

    if (extraNodes) (Array.isArray(extraNodes) ? extraNodes : [extraNodes]).forEach((n) => n && host.appendChild(n));

    // Feedback.
    if (outcome.feedback) {
      host.appendChild(el("h3", { class: "results-h", text: "What happened" }));
      host.appendChild(feedbackCard(outcome.feedback.kind, outcome.feedback.text));
    }

    // Learning outcome recap.
    if (level.learningOutcome) {
      host.appendChild(el("div", { class: "learn-recap" }, [
        el("div", { class: "learn-recap-title", text: "💡 What you learned" }),
        el("ul", {}, level.learningOutcome.map((t) => el("li", { text: t }))),
      ]));
    }

    // Actions.
    const actions = el("div", { class: "results-actions" }, [
      el("button", { class: "btn btn-ghost", onClick: onReplay, text: "↺ Replay" }),
      el("button", { class: "btn btn-primary", onClick: onContinue, text: outcome.passed ? "Continue →" : "Back to town" }),
    ]);
    host.appendChild(actions);
    return host;
  }

  /* ---- Modal -------------------------------------------------------------- */
  function modal(contentNode, opts = {}) {
    const overlay = el("div", { class: "modal-overlay" });
    const box = el("div", { class: "modal-box " + (opts.class || "") }, [contentNode]);
    overlay.appendChild(box);
    overlay.addEventListener("click", (e) => { if (e.target === overlay && opts.dismissible !== false) close(); });
    function close() { overlay.classList.remove("show"); setTimeout(() => overlay.remove(), 200); }
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));
    return { close, overlay };
  }

  /* ---- Section intro card ------------------------------------------------- */
  function levelIntro(level, onStart, hint) {
    const host = el("div", { class: "intro" });
    host.appendChild(el("div", { class: "intro-badge", text: level.icon }));
    host.appendChild(el("div", { class: "intro-kicker", text: `Level ${level.number} · ${level.concept}` }));
    host.appendChild(el("h2", { class: "intro-title", text: level.title }));
    host.appendChild(el("p", { class: "intro-text", text: level.intro }));
    host.appendChild(el("div", { class: "intro-objective" }, [
      el("span", { class: "intro-objective-icon", text: "🎯" }),
      el("span", { text: level.objective }),
    ]));
    if (hint) host.appendChild(el("div", { class: "intro-hint", html: hint }));
    host.appendChild(el("button", { class: "btn btn-primary btn-lg", text: "Start level →", onClick: onStart }));
    return host;
  }

  global.MV_UI = {
    el, clear, money, pct, stars, toast, badgePopup, feedbackCard,
    statPill, progressBar, resultsScreen, modal, levelIntro,
  };
})(window);
