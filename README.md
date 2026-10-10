# 🛡️ Shield Force — Scam Defence Grid

**Protecting the Indian Armed Forces community — serving personnel, veterans, veer naris and their
families — from financial fraud, through intelligence, training and rapid response.**

Shield Force is a fully self-contained, installable Progressive Web App (PWA). It runs on phones,
tablets and laptops, works offline after the first visit, and can be packaged for the Google Play
Store and Apple App Store (see [Store packaging](#store-packaging)).

---

## App structure

Shield Force is built as an app, not a website: a bottom **tab bar** on phones and portrait
tablets (a **side rail** on screens 1024px and wider), an **app bar** with a back button on
pushed screens, native-style screen transitions, and no web footer.

| Tab | Screen | File | Pushed screens |
|---|---|---|---|
| **Home** | Dashboard — scan and SOS actions, live alerts, quick tiles, 2026 stats, latest cases | `index.html` | Threat map (`threat-map.html`), More (`more.html`) |
| **Intel** | 8 decoded scam families | `scam-intel.html` | Scam briefing (`scam-detail.html?id=…`) |
| **Scan** | On-device message fraud scanner with risk gauge and per-flag explanations | `ai-analyzer.html` | — |
| **Learn** | Hub for everything educational | `learn.html` | Training (`training.html`, quiz via `?module=…`), Fraud anatomy, Detection lab, Defence schemes (+ `scheme-detail.html?id=…`), Field guides (`reports.html`) |
| **SOS** | 1930 dial, the Golden Window, six response steps, contact directory | `emergency.html` | — |

**More** (from the ⋯ button on any tab) holds Install, Field guides, Threat map, Help
(`contact.html`), Privacy (`privacy.html`), Terms (`terms.html`) and *Reset training progress*.

Where each screen sits — its tab, whether it is a root, and where Back goes when there is no
in-app history — is defined once in `SCREENS` in `js/main.js`.

## Running locally

It's a static site — any web server works:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

(Service worker + PWA installability need http(s); opening files directly with `file://` also works
for browsing, minus offline support.)

## Regenerating assets

The PDF reports and app icons are generated, dependency-free, by:

```bash
python3 scripts/gen_pdfs.py    # → assets/reports/*.pdf
python3 scripts/gen_icons.py   # → assets/icons/*.png
```

## Store packaging

The app is a compliant PWA (manifest + service worker + offline shell + maskable icons + iOS/Android
meta tags + safe-area-aware layout), so it can be shipped to stores without rewriting:

- **Google Play**: wrap with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) /
  PWABuilder as a Trusted Web Activity (TWA). In Play Console's **Data safety** form, declare
  "No data collected" (accurate — see [Data honesty](#data-honesty) below). Set the wrapper
  project's `targetSdkVersion` to whatever Play Console currently requires at build time (Google
  raises this annually).
- **Apple App Store**: wrap with PWABuilder's iOS package or a thin WKWebView shell.
  `assets/icons/icon-1024-appstore.png` is a ready 1024×1024 source for the App Store Connect
  product icon (flatten to remove the alpha channel if your upload tool insists on none). In App
  Store Connect's **App Privacy** section, declare "Data Not Collected."
- **Both stores** require a public **Privacy Policy URL** and a **support contact** in their
  console/Connect listings — point them at this site's `privacy.html` / `terms.html` once deployed,
  and use the contact email in those pages.
- **Desktop**: installable directly from Chrome/Edge ("Install Shield Force"), or wrap with Electron/Tauri.

## Design system

- Constant colour scheme on every page: deep navy (`#04070e`–`#0d1930`), gold (`#ffa53e`),
  teal (`#2ee6a8`), alert red (`#ff4d5e`), signal blue (`#4d9fff`).
- Shared engine (`js/main.js`): interactive particle defence-grid canvas, page-transition veil,
  3D tilt cards with glare, scroll-reveal, animated counters, glass navbar + mobile drawer, toasts.
- Fully responsive from 320 px phones to widescreen desktops; honours `prefers-reduced-motion`.

## Data honesty

Statistics, the case feed and map telemetry are **representative training data** generated from
recurring, publicly reported fraud patterns (the site labels them as such). Emergency channels are
real: **1930**, [cybercrime.gov.in](https://cybercrime.gov.in),
[sancharsaathi.gov.in](https://sancharsaathi.gov.in), [SPARSH](https://sparsh.defencepension.gov.in),
[KSB](https://ksb.gov.in). Shield Force is a community awareness initiative and not an official
Government of India / Ministry of Defence website.

## Legal

`privacy.html` and `terms.html` cover data collection (there is none — no database, no backend, no
analytics; the Shield AI scanner runs entirely client-side) and the educational-only /
not-an-official-service disclaimers both app stores expect. Both are linked from the More screen
and from the first-launch terms gate.

The app is deliberately serverless: there are no `fetch`/XHR calls anywhere in `js/`, no third-party
scripts, and no API endpoints. The only persistence is `localStorage` for quiz scores and the
terms-accepted flag, which never leaves the device.
