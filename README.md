# 🛡️ Shield Force — Scam Defence Grid

**Protecting the Indian Armed Forces community — serving personnel, veterans, veer naris and their
families — from financial fraud, through intelligence, training and rapid response.**

Shield Force is a fully self-contained, installable Progressive Web App (PWA). It runs on phones,
tablets and laptops, works offline after the first visit, and can be packaged for the Google Play
Store and Apple App Store (see [Store packaging](#store-packaging)).

---

## Pages

| # | Page | File | What it does |
|---|------|------|--------------|
| 1 | **Home** | `index.html` | Mission statement for the Indian military & families, interactive particle background, animated 3D shield, live alert ticker, 2026 damage-report statistics (targets, total lost, average loss, unreported-out-of-embarrassment share), hourly-refreshed latest-case feed with date / source / location |
| 2 | **Scam Intel** | `scam-intel.html` → `scam-detail.html?id=…` | 8 decoded scam families; each detail page covers how the scam works step-by-step, case studies and protection drills |
| 3 | **Threat Map** | `threat-map.html` | Stylised India map that re-syncs **every hour**; pulsing incident icons open popups with victim profile, loss and source; legend + hour stats |
| 4 | **Shield AI** | `ai-analyzer.html` | On-device fraud message scanner with risk gauge and per-flag explanations; exemplar buttons for Fake UPI, Investment Pitch, Welfare Fund, Pension KYC, Digital Arrest and a genuine control message |
| 5 | **Fraud Anatomy** | `fraud-anatomy.html` | Interactive 6-phase diagram of how financial frauds unfold, with a protect-yourself tip per phase and auto-play mode |
| 6 | **Detection Lab** | `detection.html` | The seven signs of a scam, then message specimens with red flags highlighted and cross-linked to explanations |
| 7 | **Schemes** | `schemes.html` → `scheme-detail.html?id=…` | 8 genuine defence financial schemes (AGIF, DSOP, SPARSH, ECHS, AFBCWF, PMSS, AWWA, CSD) — key benefits, who is benefited and scam risks |
| 8 | **Training** | `training.html` | 6 quiz modules (one per scam family), multiple choice with instant correct/wrong verdicts and explanations; best scores stored locally |
| 9 | **Reports** | `reports.html` | 5 downloadable PDF documents (generated into `assets/reports/`), device-aware download hints, download-all |
| 10 | **Emergency** | `emergency.html` | 1930 tap-to-call, the Golden Window explained, six response steps in order, contact directory for families and officers with official links |

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

`privacy.html` and `terms.html` cover data collection (there is none — no backend, no analytics,
the Shield AI scanner runs entirely client-side) and the educational-only / not-an-official-service
disclaimers both app stores expect. Both are linked from every page's footer.
