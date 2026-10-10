/* ============================================================
   SHIELD FORCE — app shell
   App bar, bottom tab bar (side rail on wide screens), screen
   navigation and transitions, launch splash + first-run terms
   gate, toasts, counters and install support.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- icons (24px line set, inherit currentColor) ---------------- */
  const ICON_PATHS = {
    home:    '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    shield:  '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    scan:    '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M7 12h10"/>',
    cap:     '<path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    alert:   '<path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    back:    '<path d="M15 5l-7 7 7 7"/>',
    more:    '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    chev:    '<path d="m9 6 6 6-6 6"/>',
    map:     '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5z"/><path d="M9 4v13M15 6.5v13"/>',
    phone:   '<path d="M5 3.5h3l1.6 4.2-2 1.3a11 11 0 0 0 5.4 5.4l1.3-2 4.2 1.6v3A2 2 0 0 1 16.5 19 13.5 13.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
    layers:  '<path d="M12 3 2 8l10 5 10-5z"/><path d="m2 13 10 5 10-5"/>',
    eye:     '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    bank:    '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    doc:     '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    mail:    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    lock:    '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    scale:   '<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
    install: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    reset:   '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    share:   '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"/>',
    pulse:   '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    close:   '<path d="M6 6l12 12M18 6 6 18"/>'
  };
  function icon(name) {
    return `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
      `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;
  }

  const LOGO = `<span class="wordmark" aria-label="Shield Force"><b>SHIELD</b><em>FORCE</em><i>®</i></span>`;

  /* ---------------- where each screen sits in the app ---------------- */
  const TABS = [
    ["home",  "index.html",       "Home",  "home"],
    ["intel", "scam-intel.html",  "Intel", "shield"],
    ["scan",  "ai-analyzer.html", "Scan",  "scan"],
    ["learn", "learn.html",       "Learn", "cap"],
    ["sos",   "emergency.html",   "SOS",   "alert"]
  ];
  // Roots are tab destinations (no back button). Everything else is pushed on top of a
  // parent, which is where Back goes when there is no in-app history to return to.
  const SCREENS = {
    "index":         { tab: "home",  root: true },
    "scam-intel":    { tab: "intel", root: true, title: "Scam Intel" },
    "ai-analyzer":   { tab: "scan",  root: true, title: "Scanner" },
    "learn":         { tab: "learn", root: true, title: "Learn" },
    "emergency":     { tab: "sos",   root: true, title: "Emergency" },
    "scam-detail":   { tab: "intel", parent: "scam-intel.html", fromHeading: true },
    "threat-map":    { tab: "home",  parent: "index.html",   title: "Threat Map" },
    "training":      { tab: "learn", parent: "learn.html",   title: "Training" },
    "fraud-anatomy": { tab: "learn", parent: "learn.html",   title: "Fraud Anatomy" },
    "detection":     { tab: "learn", parent: "learn.html",   title: "Detection Lab" },
    "schemes":       { tab: "learn", parent: "learn.html",   title: "Defence Schemes" },
    "scheme-detail": { tab: "learn", parent: "schemes.html", fromHeading: true },
    "reports":       { tab: "learn", parent: "learn.html",   title: "Field Guides" },
    "more":          { tab: "",      parent: "index.html",   title: "More" },
    "contact":       { tab: "",      parent: "more.html",    title: "Contact & Support" },
    "privacy":       { tab: "",      parent: "more.html",    title: "Privacy Policy" },
    "terms":         { tab: "",      parent: "more.html",    title: "Terms of Use" },
    "404":           { tab: "",      root: true,             title: "Not found" }
  };

  const body = document.body;
  const page = body.dataset.page || "";
  // true inside the store builds (Capacitor injects its bridge before any page script runs)
  const NATIVE = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" &&
                    window.Capacitor.isNativePlatform());
  function stemOf(path) {
    const last = String(path || "").split(/[?#]/)[0].split("/").pop() || "index";
    return last.replace(/\.html?$/i, "") || "index";
  }
  const stem = body.dataset.screen || stemOf(location.pathname);
  const screen = SCREENS[stem] || { tab: "", parent: "index.html" };
  // the not-found screen can be served at any depth, so its links must be root-absolute
  const base = stem === "404" ? "/" : "";
  let parent = screen.parent || "index.html";
  if (stem === "training" && new URLSearchParams(location.search).get("module")) parent = "training.html";

  /* ---------------- storage helpers (private mode can throw) ---------------- */
  function storageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage disabled */ } }
  function sessionGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function sessionDel(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }

  /* ---------------- chrome injection ---------------- */
  function inject() {
    const tabs = TABS.map(([key, href, label, ic]) => {
      const on = key === screen.tab;
      return `<a class="tb-item tb-${key}${on ? " active" : ""}" href="${base}${href}"` +
        `${on ? ' aria-current="page"' : ""}><span class="tb-ico">${icon(ic)}</span>` +
        `<span class="tb-lbl">${label}</span></a>`;
    }).join("");

    const left = screen.root
      ? (stem === "index" ? `<a class="ab-brand" href="${base}index.html" aria-label="Shield Force home">${LOGO}</a>` : "")
      : `<button class="ab-back" type="button" aria-label="Back">${icon("back")}</button>`;
    const right = screen.root && stem !== "404"
      ? `<a class="ab-btn" href="${base}more.html" aria-label="More">${icon("more")}</a>` : "";

    body.insertAdjacentHTML("afterbegin", `
      <header id="appbar" class="${screen.root ? "is-root" : "is-push"}">
        <div class="ab-left">${left}</div>
        <div class="ab-title"></div>
        <div class="ab-right">${right}</div>
      </header>
      <nav id="tabbar" aria-label="Main">
        <a class="tb-brand" href="${base}index.html" aria-label="Shield Force home"><b>S</b><em>F</em></a>
        ${tabs}
      </nav>`);

    // ambience: static everywhere, the animated grid only on Home
    body.insertAdjacentHTML("afterbegin",
      `<div class="orb orb-a"></div><div class="orb orb-b"></div><div class="orb orb-c"></div>` +
      (stem === "index" ? `<canvas id="bg-canvas"></canvas>` : ""));
    body.insertAdjacentHTML("beforeend", `<div id="toast" role="status" aria-live="polite"></div>`);

    body.insertAdjacentHTML("afterbegin", `
      <div id="splash">
        <div class="splash-inner">
          <div class="splash-load">
            <div class="splash-mark" aria-hidden="true">${LOGO}</div>
            <div class="splash-bar"><div class="splash-bar-fill"></div></div>
            <p class="splash-status">Initializing Shield Grid…</p>
          </div>
          <div class="splash-gate" role="dialog" aria-modal="true" aria-labelledby="splash-gate-h">
            <span class="kicker">Before you begin</span>
            <h2 id="splash-gate-h">Welcome to Shield Force</h2>
            <ul class="splash-points">
              <li>A community awareness tool for the Indian defence community</li>
              <li>Not an official Government of India / Ministry of Defence service</li>
              <li>No accounts, no database, no tracking — nothing you type ever leaves your device</li>
              <li>Statistics shown are representative training estimates, not live official figures</li>
            </ul>
            <label class="splash-check">
              <input type="checkbox" id="splash-agree-check">
              <span>I have read and agree to the <a href="${base}terms.html">Terms of Use</a> and <a href="${base}privacy.html">Privacy Policy</a>.</span>
            </label>
            <button class="btn btn-gold" id="splash-agree-btn" disabled>Agree &amp; Continue</button>
          </div>
        </div>
      </div>`);

    // static markup can ask for an icon by name instead of inlining the SVG
    document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

    if (install.standalone()) body.classList.add("is-standalone");
    if (NATIVE) body.classList.add("is-native");
  }

  /* ---------------- navigation ---------------- */
  // The navigation style is handed to the next screen so it can pick a matching
  // transition: push slides in, pop slides back, tab switches cross-fade.
  const VT_KEY = "sf_vt";
  function sameOrigin(u) { try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; } }

  function goBack() {
    sessionSet(VT_KEY, "pop");
    if (history.length > 1 && document.referrer && sameOrigin(document.referrer)) history.back();
    else location.href = base + parent;
  }

  function navSetup() {
    document.querySelector("#appbar .ab-back")?.addEventListener("click", goBack);

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button > 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || /^(#|tel:|mailto:|sms:|https?:|javascript:)/i.test(href)) return;

      const to = stemOf(href);
      // tapping the tab you're on: back to the top, or back to that tab's first screen
      if (a.classList.contains("tb-item") && a.classList.contains("active")) {
        if (screen.root && to === stem) { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); return; }
        sessionSet(VT_KEY, "pop");
        return;
      }
      if (a.classList.contains("tb-item") || (SCREENS[to] && SCREENS[to].root)) sessionSet(VT_KEY, "tab");
      else if (to === stemOf(parent)) sessionSet(VT_KEY, "pop");
      else sessionSet(VT_KEY, "push");
    });

    // Fires on the arriving screen just before its first frame.
    addEventListener("pagereveal", (e) => {
      let type = sessionGet(VT_KEY);
      sessionDel(VT_KEY);
      if (!e.viewTransition) return;
      try {
        if (!type && window.navigation && navigation.activation &&
            navigation.activation.navigationType === "traverse") type = "pop";
        if (type) e.viewTransition.types.add(type);
      } catch (err) { /* types unsupported: default cross-fade still runs */ }
    });
  }

  /* app bar: hairline when content scrolls under it, and the screen title fades in
     once the large on-page heading has scrolled away — the iOS large-title pattern */
  function titleSetup() {
    const bar = document.getElementById("appbar");
    const titleEl = bar.querySelector(".ab-title");
    const big = document.querySelector("main h1");
    let title = screen.title || "";
    if ((screen.fromHeading || !title) && big) title = big.textContent.replace(/\s+/g, " ").trim();
    titleEl.textContent = stem === "index" ? "" : title;

    const onScroll = () => bar.classList.toggle("scrolled", scrollY > 2);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (stem === "index") return;
    if (!big || !("IntersectionObserver" in window)) { bar.classList.add("show-title"); return; }
    const io = new IntersectionObserver(([en]) => bar.classList.toggle("show-title", !en.isIntersecting),
      { rootMargin: `-${bar.offsetHeight}px 0px 0px 0px`, threshold: 0 });
    io.observe(big);
  }

  /* ---------------- launch splash / first-run terms gate ---------------- */
  const TERMS_KEY = "sf_terms_accepted_v1";
  const SESSION_KEY = "sf_splash_done";
  // Floor keeps the splash from flashing past; ceiling stops a slow network from
  // holding someone hostage. Between the two, it leaves as soon as the screen is ready.
  const LOAD_MIN_MS = 550;
  const LOAD_MAX_MS = 1600;
  const LOCKED = ["#appbar", "#tabbar", "main"];

  // People must be able to read what they are agreeing to, so these are never gated.
  const UNGATED = ["terms", "privacy"];

  function splashSetup() {
    const el = document.getElementById("splash");
    if (!el) return;
    const accepted = storageGet(TERMS_KEY) === "1";
    if (UNGATED.includes(stem) || (accepted && (NATIVE || sessionGet(SESSION_KEY) === "1"))) {
      el.remove();
      return;
    }

    body.classList.add("splash-lock");
    LOCKED.forEach((s) => document.querySelector(s)?.setAttribute("inert", ""));

    const bar = el.querySelector(".splash-bar-fill");
    const status = el.querySelector(".splash-status");
    const msgs = ["Initializing Shield Grid…", "Loading threat intelligence…", "Syncing defence network…", "Ready."];
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.transition = `width ${LOAD_MAX_MS}ms cubic-bezier(.2,.7,.2,1)`;
      bar.style.width = "100%";
    }));
    let mi = 0;
    const msgTimer = setInterval(() => {
      if (++mi >= msgs.length) { clearInterval(msgTimer); return; }
      status.textContent = msgs[mi];
    }, 420);

    function unlock() {
      body.classList.remove("splash-lock");
      LOCKED.forEach((s) => document.querySelector(s)?.removeAttribute("inert"));
      el.classList.add("splash-out");
      setTimeout(() => el.remove(), 650);
    }

    const started = Date.now();
    let proceeded = false;
    function proceed() {
      if (proceeded) return;
      proceeded = true;
      clearInterval(msgTimer);
      status.textContent = "Ready.";
      bar.style.transition = "width .25s ease";
      bar.style.width = "100%";
      if (accepted) { sessionSet(SESSION_KEY, "1"); unlock(); return; }
      // first-time user: swap the loading view for the terms gate, in place
      el.classList.add("gate-mode");
      const check = document.getElementById("splash-agree-check");
      const btn = document.getElementById("splash-agree-btn");
      check.addEventListener("change", () => { btn.disabled = !check.checked; });
      btn.addEventListener("click", () => {
        storageSet(TERMS_KEY, "1");
        sessionSet(SESSION_KEY, "1");
        unlock();
      });
      check.focus();
    }
    const minMs = NATIVE ? 0 : LOAD_MIN_MS;
    if (NATIVE) el.classList.add("gate-mode");
    const scheduleProceed = () => setTimeout(proceed, Math.max(0, minMs - (Date.now() - started)));
    if (document.readyState === "complete") scheduleProceed();
    else addEventListener("load", scheduleProceed, { once: true });
    setTimeout(proceed, LOAD_MAX_MS);
  }

  /* ---------------- animated defence grid (Home only) ---------------- */
  function particles() {
    const cv = document.getElementById("bg-canvas");
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let W, H, pts = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      const n = Math.min(110, Math.floor((W * H) / 13000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.6,
        hue: Math.random() < 0.82 ? "125,165,255" : (Math.random() < 0.5 ? "255,165,62" : "46,230,168")
      }));
    }
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

    const LINK = 120;
    let rafId = 0;
    function tick() {
      cx.clearRect(0, 0, W, H);
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500 && d2 > 1) { const f = 14 / d2; p.vx += dx * f; p.vy += dy * f; }
        p.vx *= 0.985; p.vy *= 0.985;
        p.vx += (Math.random() - 0.5) * 0.012; p.vy += (Math.random() - 0.5) * 0.012;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7);
        cx.fillStyle = `rgba(${p.hue},.5)`; cx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y);
            cx.strokeStyle = `rgba(125,165,255,${0.12 * (1 - d / LINK)})`;
            cx.lineWidth = 1; cx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    tick();
    // don't burn battery animating a screen nobody is looking at
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0; }
      else if (!rafId) rafId = requestAnimationFrame(tick);
    });
  }

  /* ---------------- desktop-only card tilt (mouse, never touch) ---------------- */
  function tilt() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".card3d");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 6}deg) rotateX(${(0.5 - py) * 6}deg)`;
      card.style.setProperty("--gx", px * 100 + "%");
      card.style.setProperty("--gy", py * 100 + "%");
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest(".card3d");
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
    });
  }

  /* ---------------- helpers exported on window.SFX ---------------- */
  // Content is shown immediately — an app screen should not wait for scrolling to
  // reveal itself. Kept as a no-op hook because every screen script calls it.
  function reveal() { document.querySelectorAll(".rv").forEach((el) => el.classList.add("in")); }

  function format(v, fmt, done) {
    switch (fmt) {
      case "plus": return Math.round(v).toLocaleString("en-IN") + (done ? "<small>+</small>" : "");
      case "crore": return "<small>₹</small>" + Math.round(v).toLocaleString("en-IN") + "<small> Cr</small>";
      case "lakh": return "<small>₹</small>" + v.toFixed(2) + "<small> L</small>";
      case "pct": return Math.round(v) + "<small>%</small>";
      default: return Math.round(v).toLocaleString("en-IN");
    }
  }
  function countUp(el, end, fmt) {
    const dur = 900, t0 = performance.now();
    (function frame(t) {
      const k = Math.min(1, (t - t0) / dur);
      el.innerHTML = format(end * (1 - Math.pow(1 - k, 3)), fmt, k === 1);
      if (k < 1) requestAnimationFrame(frame);
    })(t0);
  }
  function watchCounters() {
    // safe to call repeatedly: each counter is only ever animated once
    const els = [...document.querySelectorAll("[data-count]:not([data-watched])")];
    els.forEach((el) => { el.dataset.watched = "1"; });
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => { el.innerHTML = format(parseFloat(el.dataset.end), el.dataset.fmt, true); });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        countUp(en.target, parseFloat(en.target.dataset.end), en.target.dataset.fmt);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  let toastTimer;
  function toast(msg, ms = 3200) {
    const t = document.getElementById("toast");
    t.innerHTML = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), ms);
  }

  function addGlares() {
    document.querySelectorAll(".card3d").forEach((c) => {
      if (!c.querySelector(".glare")) c.insertAdjacentHTML("beforeend", `<div class="glare"></div>`);
    });
  }

  /* ---------------- install support ---------------- */
  let deferredPrompt = null;
  const install = {
    standalone: () => NATIVE || matchMedia("(display-mode: standalone)").matches || navigator.standalone === true,
    ios: () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
               (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    available: () => !!deferredPrompt,
    async prompt() {
      if (!deferredPrompt) return null;
      const p = deferredPrompt;
      deferredPrompt = null;
      p.prompt();
      const r = await p.userChoice;
      return r.outcome;
    }
  };
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.dispatchEvent(new Event("sf:installable"));
  });
  addEventListener("appinstalled", () => {
    deferredPrompt = null;
    body.classList.add("is-standalone");
    document.dispatchEvent(new Event("sf:installed"));
  });

  window.SFX = { toast, countUp, reveal, addGlares, watchCounters, icon, install, storageGet, storageSet, native: NATIVE };

  /* ---------------- offline-capable install ---------------- */
  if (!NATIVE && "serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register(base + "sw.js").catch(() => {}));
  }

  /* ---------------- boot ---------------- */
  inject();
  navSetup();
  splashSetup();
  particles();
  tilt();
  const ready = () => { reveal(); addGlares(); watchCounters(); titleSetup(); };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
