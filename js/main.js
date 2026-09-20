/* ============================================================
   SHIELD FORCE — shared engine
   Nav/footer injection, particle grid, page transitions,
   3D tilt, scroll reveal, counters, toasts, PWA registration.
   ============================================================ */
(function () {
  "use strict";

  const PAGES = [
    ["index.html", "home", "Home"],
    ["scam-intel.html", "intel", "Scam Intel"],
    ["threat-map.html", "map", "Threat Map"],
    ["ai-analyzer.html", "ai", "Shield AI"],
    ["fraud-anatomy.html", "anatomy", "Fraud Anatomy"],
    ["detection.html", "detect", "Detection Lab"],
    ["schemes.html", "schemes", "Schemes"],
    ["training.html", "training", "Training"],
    ["reports.html", "reports", "Reports"],
    ["emergency.html", "sos", "🚨 Emergency"]
  ];

  const page = document.body.dataset.page || "";

  const LOGO_SVG = `<span class="wordmark" aria-label="Shield Force"><b>SHIELD</b><em>FORCE</em><i>®</i></span>`;

  /* ---------------- scaffolding injection ---------------- */
  function inject() {
    // veil + ambience + toast
    document.body.insertAdjacentHTML("afterbegin", `
      <div id="veil"></div>
      <div class="orb orb-a"></div><div class="orb orb-b"></div><div class="orb orb-c"></div>
      <canvas id="bg-canvas"></canvas>`);
    document.body.insertAdjacentHTML("beforeend", `<div id="toast" role="status"></div>`);

    const links = PAGES.map(([href, key, label]) =>
      `<a href="${href}" class="${key === page ? "active" : ""}${key === "sos" ? " nav-sos" : ""}">${label}</a>`).join("");

    document.body.insertAdjacentHTML("afterbegin", `
      <header id="navbar">
        <a class="nav-logo" href="index.html">${LOGO_SVG}</a>
        <nav class="nav-links" aria-label="Primary">${links}</nav>
        <button id="nav-burger" aria-label="Menu"><span></span><span></span><span></span></button>
      </header>
      <nav id="nav-drawer" aria-label="Mobile">${links}</nav>`);

    document.body.insertAdjacentHTML("afterbegin", `
      <div id="splash">
        <div class="splash-inner">
          <div class="splash-load">
            <div class="splash-mark" aria-hidden="true">${LOGO_SVG}</div>
            <div class="splash-bar"><div class="splash-bar-fill"></div></div>
            <p class="splash-status">Initializing Shield Grid…</p>
          </div>
          <div class="splash-gate" role="dialog" aria-modal="true" aria-labelledby="splash-gate-h">
            <span class="kicker">Before you begin</span>
            <h2 id="splash-gate-h">Welcome to Shield Force</h2>
            <ul class="splash-points">
              <li>A community awareness tool for the Indian defence community</li>
              <li>Not an official Government of India / Ministry of Defence service</li>
              <li>No personal data is collected — the Shield AI scanner runs entirely on your device</li>
              <li>Statistics shown are representative training estimates, not live official figures</li>
            </ul>
            <label class="splash-check">
              <input type="checkbox" id="splash-agree-check">
              <span>I have read and agree to the <a href="terms.html" target="_blank" rel="noopener">Terms of Use</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</span>
            </label>
            <button class="btn btn-gold" id="splash-agree-btn" disabled>Agree &amp; Continue</button>
          </div>
        </div>
      </div>`);

    document.querySelector("main")?.insertAdjacentHTML("afterend", `
      <footer>
        <div class="wrap">
          <div class="foot-grid">
            <div class="foot-brand">
              <a class="nav-logo" href="index.html">${LOGO_SVG}</a>
              <p>Protecting the Indian Armed Forces community — serving personnel, veterans and their families — from financial fraud through intelligence, training and rapid response.</p>
            </div>
            <div>
              <h5>Learn</h5>
              <a href="scam-intel.html">Scam Intelligence</a>
              <a href="fraud-anatomy.html">Fraud Anatomy</a>
              <a href="detection.html">Detection Lab</a>
              <a href="schemes.html">Financial Schemes</a>
            </div>
            <div>
              <h5>Act</h5>
              <a href="ai-analyzer.html">Shield AI Analyzer</a>
              <a href="training.html">Training Modules</a>
              <a href="reports.html">Download Reports</a>
              <a href="threat-map.html">Live Threat Map</a>
            </div>
            <div>
              <h5>Report Fraud</h5>
              <a href="tel:1930">📞 Helpline 1930</a>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener">cybercrime.gov.in ↗</a>
              <a href="https://sancharsaathi.gov.in" target="_blank" rel="noopener">Sanchar Saathi ↗</a>
              <a href="emergency.html">Emergency Protocol</a>
            </div>
          </div>
          <div class="foot-base">
            <span>© ${new Date().getFullYear()} Shield Force — community awareness initiative. Not an official Government of India / Ministry of Defence website.</span>
            <span>Statistics &amp; case feeds are representative training data. Always verify via official channels.</span>
            <span><a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms of Use</a> · <a href="mailto:vihaanssuvarna@gmail.com">Contact</a></span>
          </div>
        </div>
      </footer>`);
  }

  /* ---------------- nav behaviour ---------------- */
  function navSetup() {
    const bar = document.getElementById("navbar");
    addEventListener("scroll", () => bar.classList.toggle("scrolled", scrollY > 12), { passive: true });
    bar.classList.toggle("scrolled", scrollY > 12);

    const burger = document.getElementById("nav-burger");
    const drawer = document.getElementById("nav-drawer");
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      drawer.querySelectorAll("a").forEach((a, i) => {
        a.style.transitionDelay = open ? (0.06 + i * 0.045) + "s" : "0s";
      });
    });
    drawer.addEventListener("click", (e) => {
      if (e.target.tagName === "A") document.body.classList.remove("nav-open");
    });
  }

  /* ---------------- page transition veil ---------------- */
  function revealApp() {
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("veil-out")));
  }

  function veilSetup() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") ||
          href.startsWith("mailto:") || a.target === "_blank" || a.hasAttribute("download") ||
          e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      document.body.classList.remove("veil-out");
      document.body.classList.add("veil-in");
      setTimeout(() => { location.href = href; }, 430);
    });
    // bfcache restore
    addEventListener("pageshow", (e) => {
      if (e.persisted) {
        document.body.classList.remove("veil-in");
        document.body.classList.add("veil-out");
      }
    });
  }

  /* ---------------- splash / first-run terms gate ---------------- */
  const TERMS_KEY = "sf_terms_accepted_v1";
  const SESSION_KEY = "sf_splash_done";
  const LOAD_MS = 1400;

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* private mode / storage disabled */ }
  }
  function sessionGet(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function sessionSet(key, val) {
    try { sessionStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }

  function splashSetup() {
    const el = document.getElementById("splash");
    if (!el) { revealApp(); return; }

    const accepted = storageGet(TERMS_KEY) === "1";
    const seenThisSession = sessionGet(SESSION_KEY) === "1";

    if (accepted && seenThisSession) {
      el.remove();
      revealApp();
      return;
    }

    document.body.classList.add("splash-lock");
    document.getElementById("navbar")?.setAttribute("inert", "");
    document.getElementById("nav-drawer")?.setAttribute("inert", "");
    document.querySelector("main")?.setAttribute("inert", "");

    // cosmetic progress bar + status cycling, fixed duration regardless of real asset load
    const bar = el.querySelector(".splash-bar-fill");
    const status = el.querySelector(".splash-status");
    const msgs = ["Initializing Shield Grid…", "Loading threat intelligence…", "Syncing defence network…", "Ready."];
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.transition = `width ${LOAD_MS}ms cubic-bezier(.2,.7,.2,1)`;
      bar.style.width = "100%";
    }));
    let mi = 0;
    const msgTimer = setInterval(() => {
      mi++;
      if (mi >= msgs.length) { clearInterval(msgTimer); return; }
      status.textContent = msgs[mi];
    }, LOAD_MS / msgs.length);

    function unlock() {
      document.body.classList.remove("splash-lock");
      document.getElementById("navbar")?.removeAttribute("inert");
      document.getElementById("nav-drawer")?.removeAttribute("inert");
      document.querySelector("main")?.removeAttribute("inert");
      el.classList.add("splash-out");
      setTimeout(() => el.remove(), 650);
      revealApp();
    }

    setTimeout(() => {
      if (accepted) {
        sessionSet(SESSION_KEY, "1");
        unlock();
        return;
      }
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
    }, LOAD_MS);
  }

  /* ---------------- particle defence grid ---------------- */
  function particles() {
    const cv = document.getElementById("bg-canvas");
    const cx = cv.getContext("2d");
    if (!cx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let W, H, pts = [];
    const mouse = { x: -9999, y: -9999 };
    const DENSITY = page === "home" ? 11000 : 17000;

    function resize() {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      const n = Math.min(150, Math.floor((W * H) / DENSITY));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() < 0.82 ? "125,165,255" : (Math.random() < 0.5 ? "255,165,62" : "46,230,168")
      }));
    }
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

    const LINK = 130;
    (function tick() {
      cx.clearRect(0, 0, W, H);
      for (const p of pts) {
        // gentle mouse repulsion — the "interactive" background
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500 && d2 > 1) {
          const f = 14 / d2;
          p.vx += dx * f; p.vy += dy * f;
        }
        p.vx *= 0.985; p.vy *= 0.985;
        p.vx += (Math.random() - 0.5) * 0.012; p.vy += (Math.random() - 0.5) * 0.012;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, 7);
        cx.fillStyle = `rgba(${p.hue},.55)`;
        cx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            cx.beginPath();
            cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y);
            cx.strokeStyle = `rgba(125,165,255,${0.14 * (1 - d / LINK)})`;
            cx.lineWidth = 1;
            cx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------------- 3D tilt cards ---------------- */
  function tilt() {
    if (matchMedia("(hover: none)").matches) return;
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".card3d");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform =
        `perspective(900px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg) translateY(-4px)`;
      card.style.setProperty("--gx", px * 100 + "%");
      card.style.setProperty("--gy", py * 100 + "%");
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest(".card3d");
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  function reveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    document.querySelectorAll(".rv").forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 0.07 + "s";
      io.observe(el);
    });
  }

  /* ---------------- helpers exported on window.SFX ---------------- */
  function countUp(el, end, fmt) {
    const dur = 1900, t0 = performance.now();
    function frame(t) {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const v = end * e;
      el.innerHTML = format(v, fmt, k === 1);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function format(v, fmt, done) {
    switch (fmt) {
      case "plus": return Math.round(v).toLocaleString("en-IN") + (done ? "<small>+</small>" : "");
      case "crore": return "<small>₹</small>" + Math.round(v).toLocaleString("en-IN") + "<small> Cr</small>";
      case "lakh": return "<small>₹</small>" + v.toFixed(2) + "<small> L</small>";
      case "pct": return Math.round(v) + "<small>%</small>";
      default: return Math.round(v).toLocaleString("en-IN");
    }
  }
  function watchCounters() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        countUp(en.target, parseFloat(en.target.dataset.end), en.target.dataset.fmt);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
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

  window.SFX = { toast, countUp, reveal, addGlares, watchCounters };

  /* ---------------- PWA ---------------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  /* ---------------- boot ---------------- */
  inject();
  navSetup();
  veilSetup();
  splashSetup();
  particles();
  tilt();
  addEventListener("DOMContentLoaded", () => { reveal(); addGlares(); watchCounters(); });
  if (document.readyState !== "loading") { reveal(); addGlares(); watchCounters(); }
})();
