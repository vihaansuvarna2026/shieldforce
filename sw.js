/* Shield Force — service worker: offline-first app shell
   Precache only the shell (what the first screen actually needs). Everything
   else is cached the first time it is visited, so a first-time visitor does
   not pay to download pages and PDFs they may never open. */
const CACHE = "shieldforce-v7";

/* Kept deliberately small: the landing page and the files every page uses. */
const SHELL = [
  "index.html",
  "css/core.css",
  "css/responsive.css",
  "css/pages/home.css",
  "css/pages/intel.css",
  "js/main.js",
  "js/home.js",
  "js/data-scams.js",
  "js/data-feed.js",
  "manifest.webmanifest",
  "assets/icons/favicon.svg",
  "assets/icons/icon-192.png"
];

/* Everything else, warmed in the background AFTER the shell is serving — so the
   first paint is never delayed, but within a few seconds of the first visit the
   whole app (every page, the scanner, the quizzes and the PDFs) works with no
   network at all, permanently and with no external service involved. */
const SECONDARY = [
  // pages
  "emergency.html", "scam-intel.html", "scam-detail.html", "ai-analyzer.html",
  "threat-map.html", "fraud-anatomy.html", "detection.html", "schemes.html",
  "scheme-detail.html", "training.html", "reports.html", "contact.html",
  "privacy.html", "terms.html", "404.html",
  // page logic
  "js/sos.js", "js/intel.js", "js/analyzer.js", "js/map.js", "js/anatomy.js",
  "js/detection.js", "js/schemes.js", "js/quiz.js", "js/reports.js", "js/contact.js",
  // page content
  "js/data-contacts.js", "js/data-schemes.js", "js/data-modules.js",
  "js/data-detection.js", "js/data-anatomy.js", "js/data-reports.js",
  // page styles
  "css/pages/emergency.css", "css/pages/analyzer.css", "css/pages/map.css",
  "css/pages/anatomy.css", "css/pages/detection.css", "css/pages/schemes.css",
  "css/pages/quiz.css", "css/pages/reports.css", "css/pages/legal.css",
  // icons + the downloadable field documents
  "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png", "assets/icons/icon-180.png",
  "assets/reports/shieldforce-family-financial-safety.pdf",
  "assets/reports/shieldforce-red-flag-checklist.pdf",
  "assets/reports/shieldforce-qr-scam-warning.pdf",
  "assets/reports/shieldforce-veteran-pension-fraud-alert.pdf",
  "assets/reports/shieldforce-fraud-awareness-summary.pdf"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      // warm the rest once we're live; failures here must not break activation
      .then(() => caches.open(CACHE).then((c) =>
        Promise.allSettled(SECONDARY.map((u) => c.add(u)))
      ))
      .catch(() => {})
  );
});

/* Same-origin only. HTML: network-first so content edits appear immediately,
   falling back to cache (then the home page) when offline. Everything else:
   cache-first, since those files change only with a release. */
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  const isPage = e.request.mode === "navigate" || url.pathname.endsWith(".html");

  if (isPage) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request, { ignoreSearch: true })
            .then((hit) => hit || caches.match("index.html"))
        )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
    )
  );
});
