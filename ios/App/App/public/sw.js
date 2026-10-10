/* Shield Force — service worker: offline-first app shell
   The shell is precached so the app opens instantly; everything else is warmed in
   the background right after, so the whole app works offline within seconds of the
   first launch. No external service is involved at any point. */
const CACHE = "shieldforce-v9";

/* What the Home screen needs to open. Kept small so first launch is fast. */
const SHELL = [
  "index.html",
  "css/core.css",
  "css/responsive.css",
  "css/pages/home.css",
  "js/main.js",
  "js/home.js",
  "js/data-scams.js",
  "js/data-feed.js",
  "manifest.webmanifest",
  "assets/icons/favicon.svg",
  "assets/icons/icon-192.png"
];

/* Every other screen and asset, fetched after the shell is serving. */
const SECONDARY = [
  // screens
  "scam-intel.html", "scam-detail.html", "ai-analyzer.html", "learn.html", "emergency.html",
  "threat-map.html", "training.html", "fraud-anatomy.html", "detection.html", "schemes.html",
  "scheme-detail.html", "reports.html", "more.html", "contact.html", "privacy.html",
  "terms.html", "404.html",
  // screen logic
  "js/intel.js", "js/analyzer.js", "js/learn.js", "js/sos.js", "js/map.js", "js/quiz.js",
  "js/anatomy.js", "js/detection.js", "js/schemes.js", "js/reports.js", "js/more.js",
  "js/contact.js",
  // screen content
  "js/data-contacts.js", "js/data-schemes.js", "js/data-modules.js",
  "js/data-detection.js", "js/data-anatomy.js", "js/data-reports.js",
  // screen styles
  "css/pages/intel.css", "css/pages/analyzer.css", "css/pages/map.css", "css/pages/quiz.css",
  "css/pages/anatomy.css", "css/pages/detection.css", "css/pages/schemes.css",
  "css/pages/reports.css", "css/pages/emergency.css", "css/pages/legal.css",
  // icons + the downloadable field guides
  "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png", "assets/icons/icon-180.png",
  "assets/reports/shieldforce-family-financial-safety.pdf",
  "assets/reports/shieldforce-red-flag-checklist.pdf",
  "assets/reports/shieldforce-qr-scam-warning.pdf",
  "assets/reports/shieldforce-veteran-pension-fraud-alert.pdf",
  "assets/reports/shieldforce-fraud-awareness-summary.pdf"
];

/* A new release must not be filled from the browser's HTTP cache, or it could keep
   last release's files under this release's name. */
const fresh = (u) => new Request(u, { cache: "reload" });

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map(fresh))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      // warm the rest once live; a failed item must not break activation
      .then(() => caches.open(CACHE).then((c) => Promise.allSettled(SECONDARY.map((u) => c.add(fresh(u))))))
      .catch(() => {})
  );
});

function store(req, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}

/* Screens: served straight from cache so moving between them is instant, then quietly
   refreshed from the network for next time. Offline with nothing cached falls back
   to Home. Other assets: cache-first — they only change with a new release. */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;

  if (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")) {
    // "/" is the same screen as index.html; detail screens share one cached shell
    // whatever their ?id= is, because their content is rendered on the device
    const key = url.pathname.endsWith("/") ? "index.html" : req;
    const update = fetch(req).then((res) => store(key, res)).catch(() => null);
    e.waitUntil(update);
    e.respondWith(
      caches.match(key, { ignoreSearch: true }).then((hit) =>
        hit || update.then((res) => res || caches.match("index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => store(req, res)))
  );
});
