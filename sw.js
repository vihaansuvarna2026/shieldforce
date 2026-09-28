/* Shield Force — service worker: offline-first app shell
   Precache only the shell (what the first screen actually needs). Everything
   else is cached the first time it is visited, so a first-time visitor does
   not pay to download pages and PDFs they may never open. */
const CACHE = "shieldforce-v6";

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

/* Pulled in quietly after the shell is ready, so the app works offline without
   making the user wait for it up front. */
const SECONDARY = [
  "emergency.html", "js/sos.js", "js/data-contacts.js", "css/pages/emergency.css",
  "scam-intel.html", "js/intel.js",
  "ai-analyzer.html", "js/analyzer.js", "css/pages/analyzer.css",
  "threat-map.html", "js/map.js", "css/pages/map.css"
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
