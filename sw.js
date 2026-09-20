/* Shield Force — service worker: offline-first app shell */
const CACHE = "shieldforce-v2";
const ASSETS = [
  "index.html",
  "scam-intel.html", "scam-detail.html",
  "threat-map.html",
  "ai-analyzer.html",
  "fraud-anatomy.html",
  "detection.html",
  "schemes.html", "scheme-detail.html",
  "training.html",
  "reports.html",
  "emergency.html",
  "privacy.html",
  "terms.html",
  "css/styles.css",
  "js/data.js", "js/main.js", "js/home.js", "js/intel.js", "js/map.js",
  "js/analyzer.js", "js/anatomy.js", "js/detection.js", "js/schemes.js",
  "js/quiz.js", "js/reports.js", "js/sos.js",
  "manifest.webmanifest",
  "assets/icons/favicon.svg",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png", "assets/icons/icon-180.png",
  "assets/reports/shieldforce-family-financial-safety.pdf",
  "assets/reports/shieldforce-red-flag-checklist.pdf",
  "assets/reports/shieldforce-qr-scam-warning.pdf",
  "assets/reports/shieldforce-veteran-pension-fraud-alert.pdf",
  "assets/reports/shieldforce-fraud-awareness-summary.pdf"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* cache-first for same-origin, network fallback; navigation falls back to cached page */
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: url.pathname.endsWith(".html") }).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        const copy = res.clone();
        if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match("index.html"))
    )
  );
});
