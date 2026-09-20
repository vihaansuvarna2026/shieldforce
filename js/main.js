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
  function veilSetup() {
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("veil-out")));
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
  particles();
  tilt();
  addEventListener("DOMContentLoaded", () => { reveal(); addGlares(); watchCounters(); });
  if (document.readyState !== "loading") { reveal(); addGlares(); watchCounters(); }
})();
