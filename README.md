# 🛡️ Shield Force — Scam Defence Grid

**Protecting the Indian Armed Forces community — serving personnel, veterans, veer naris and their
families — from financial fraud, through intelligence, training and rapid response.**

Shield Force ships as an **Android app** (Google Play), an **iOS/iPadOS app** (App Store, also
installable on Apple-silicon Macs) and an installable **web app** for every other device. All three
run the same code, contain everything they need, and work fully offline.

**Publishing:** follow [`store-kit/SUBMISSION-RUNBOOK.md`](store-kit/SUBMISSION-RUNBOOK.md).

---

## App structure

Shield Force is built as an app, not a website: a bottom **tab bar** on phones and portrait
tablets (a **side rail** on screens 1024px and wider), an **app bar** with a back button on
pushed screens, native-style screen transitions, and no web footer.

| Tab | Screen | File | Pushed screens |
|---|---|---|---|
| **Home** | Dashboard — scan and SOS actions, alert ticker, quick tiles, 2026 stats, latest cases | `index.html` | Threat map (`threat-map.html`), More (`more.html`) |
| **Intel** | 8 decoded scam families | `scam-intel.html` | Scam briefing (`scam-detail.html?id=…`) |
| **Scan** | On-device message fraud scanner with risk gauge and per-flag explanations | `ai-analyzer.html` | — |
| **Learn** | Hub for everything educational | `learn.html` | Training (`training.html`, quiz via `?module=…`), Fraud anatomy, Detection lab, Defence schemes (+ `scheme-detail.html?id=…`), Field guides (`reports.html`) |
| **SOS** | 1930 dial, the Golden Window, six response steps, contact directory | `emergency.html` | — |

**More** (from the ⋯ button on any tab) holds Install, Field guides, Threat map, Help
(`contact.html`), Privacy (`privacy.html`), Terms (`terms.html`) and *Reset training progress*.

Where each screen sits — its tab, whether it is a root, and where Back goes when there is no
in-app history — is defined once in `SCREENS` in `js/main.js`.

## Project layout

| Path | What it is |
|---|---|
| `*.html`, `css/`, `js/`, `assets/` | The app itself |
| `www/` | Built copy of the app (`npm run build`, git-ignored) — what Netlify serves and the native apps bundle |
| `android/` | Android Studio project (Capacitor 8, target SDK 36) |
| `ios/` | Xcode project (Capacitor 8, iOS 15+, Swift Package Manager); the web app inside it is committed so it opens and builds as-is |
| `scripts/` | Build, icon, store-graphic and PDF generators; CI test drivers in `scripts/ci/` |
| `store-kit/` | Store graphics, listing text and the submission runbook |
| `.github/workflows/apps.yml` | Builds and tests both apps on every push |

## Commands (Node.js 22)

```bash
npm ci                  # once
npm run build           # app → www/
npm run sync            # build, then copy into android/ and ios/
npm run open:android    # open in Android Studio
npm run open:ios        # open in Xcode (on a Mac)
npm run icons           # redraw every icon and splash screen (needs Playwright)
npm run store-assets    # re-capture every store screenshot + feature graphic (needs Playwright)
npm run desktop         # copy the app into store-kit/desktop/ for a Windows/Mac installer
python3 scripts/gen_pdfs.py   # regenerate the PDF field guides
```

To try the web version locally: `npm run build`, then serve `www/` with any static server
(e.g. `python3 -m http.server 8080` inside `www/`).

## Continuous integration

Every push runs `.github/workflows/apps.yml`:

- **Web app** — builds `www/` and fails if the copy inside `ios/` is out of date.
- **Android build** — debug APK plus the release AAB for Google Play (signed when the upload-key
  secrets are set; see the runbook). Both are downloadable from the run.
- **Android emulator test** — installs the APK and checks the terms gate, tabs, system Back,
  safe areas, PDF hand-off, the 1930 dialler and that no script errors occur.
- **iOS build** — compiles for devices and launches the app in the iPhone and iPad Simulators.

## Native behaviour

- Detected with `window.Capacitor.isNativePlatform()` (`SFX.native`): the launch splash shows
  only on first run, install prompts are hidden and no service worker is registered.
- Android system Back walks back through screens (`MainActivity.java`); the status and
  navigation bar sizes come in as `--safe-area-inset-*`.
- The PDF field guides open the hosted copy at `SF.siteUrl` (`js/data-reports.js`) in the system
  browser, because app web views cannot save files.
- Release signing reads the Play upload key from a git-ignored `android/keystore.properties` or
  CI secrets — never from the repository.

## Design system

- Constant colour scheme on every page: deep navy (`#04070e`–`#0d1930`), gold (`#ffa53e`),
  teal (`#2ee6a8`), alert red (`#ff4d5e`), signal blue (`#4d9fff`).
- Shared app shell (`js/main.js`): app bar, tab bar / side rail, screen transitions, launch
  splash and first-run terms gate, toasts, animated counters, particle field on Home.
- App icon: the SF monogram, drawn from vector outlines by `scripts/make-icons.mjs`.
- Fully responsive from 280 px folding phones to 4K desktops; honours `prefers-reduced-motion`.

## Data honesty

Statistics, the case feed and the threat map are **representative training data** generated from
recurring, publicly reported fraud patterns (the app labels them as such). Emergency channels are
real: **1930**, [cybercrime.gov.in](https://cybercrime.gov.in),
[sancharsaathi.gov.in](https://sancharsaathi.gov.in), [SPARSH](https://sparsh.defencepension.gov.in),
[KSB](https://ksb.gov.in). Shield Force is a community awareness initiative and not an official
Government of India / Ministry of Defence website.

## Legal

`privacy.html` and `terms.html` cover data collection (there is none — no database, no backend, no
analytics; the message scanner runs entirely on the device) and the educational-only /
not-an-official-service disclaimers both app stores expect. Both are linked from the More screen
and from the first-launch terms gate.

The app is deliberately serverless: there are no `fetch`/XHR calls anywhere in `js/`, no third-party
scripts, and no API endpoints. The only persistence is `localStorage` for quiz scores and the
terms-accepted flag, which never leaves the device.
