# Shield Force — Store Submission Runbook

Everything in this kit is ready to upload. This document is the order to do it in.

**Read this first — the honest status:**

| Platform | Can I hand you a finished, uploadable binary? | Why |
|---|---|---|
| **Google Play** (`.aab`) | Almost — needs 3 commands on your machine | Needs your signing keystore + live domain. Build itself is free and runs on Windows/Mac/Linux. |
| **Apple App Store** (`.ipa`) | **No — impossible without a Mac** | Apple only permits building and signing iOS apps on macOS with Xcode. This is an Apple restriction, not a limitation of the code. |
| **Windows** (`.exe`) | Yes, one command | Electron wrapper included. |
| **macOS** (`.dmg`) | Build yes, *distribute* needs a Mac | Unsigned Mac builds are blocked by Gatekeeper; signing/notarising requires macOS + Apple Developer account. |
| **Any device, right now, free** | **Yes — already works** | The app is an installable PWA. See Step 1. |

---

## Step 0 — Accounts and costs (do this first, both have waiting periods)

| | Cost | Approval time |
|---|---|---|
| Apple Developer Program | **$99/year** | 24–48h, sometimes longer |
| Google Play Console | **$25 once** | Up to 48h, plus ID verification |

Apple also requires, for a new individual developer account, that you verify your
identity. Start both today — they gate everything else.

---

## Step 1 — Deploy the site (REQUIRED before any store work)

Every store path depends on the app being live at a permanent HTTPS URL. Without this,
the Android TWA cannot verify and both stores reject the privacy-policy link.

**Free option — GitHub Pages (5 minutes):**

1. Go to `github.com/vihaansuvarna2026/shieldforce` → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `claude/military-scam-awareness-site-y1xz1s`, folder: `/ (root)` → **Save**
4. Wait ~2 minutes. Your live URL becomes:
   **`https://vihaansuvarna2026.github.io/shieldforce/`**

**Verify it worked:** open that URL on your phone. You should get the loading screen,
then the terms gate, then the app. Chrome/Safari should offer "Add to Home Screen".

> If you later buy a real domain (e.g. `shieldforce.in`), search-replace the GitHub
> Pages URL in `android-twa/twa-manifest.json` and `listing/store-listing.md`.

**At this point the app already works on every device you asked about** — iPhone, iPad,
Android phone/tablet, Mac, and Windows — installable from the browser, offline-capable,
at zero cost. The store submissions below are optional distribution channels on top.

---

## Step 2 — Google Play (`.aab`)

Run these on your own computer (Windows, Mac or Linux all fine). Needs Node.js 18+ and
a JDK; Bubblewrap offers to install the Android SDK for you.

```bash
npm install -g @bubblewrap/cli

# create a working folder, drop twa-manifest.json from this kit into it, then:
bubblewrap init --manifest https://vihaansuvarna2026.github.io/shieldforce/manifest.webmanifest
bubblewrap build
```

`bubblewrap build` produces **`app-release-bundle.aab`** — that is your Play upload file.

### The keystore — read this, it matters
The build creates `android.keystore`. **Back it up somewhere permanent and private.**
If you lose it you can never update the app on Play again — you'd have to publish a new
listing under a new package name and lose all your installs and reviews. Store it in a
password manager or an encrypted backup, along with the password you set.

### Digital Asset Links (this is what makes the TWA open without a browser bar)
1. Get your signing fingerprint:
   ```bash
   keytool -list -v -keystore android.keystore -alias shieldforce
   ```
2. Copy the **SHA-256** line.
3. Open `android-twa/assetlinks-TEMPLATE.json`, replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT`.
4. Save it to your repo at `.well-known/assetlinks.json`, commit, push.
   It must be reachable at
   `https://vihaansuvarna2026.github.io/shieldforce/.well-known/assetlinks.json`

> Skip this and the app still works, but shows a browser address bar at the top — which
> reviewers often flag as an unpolished web wrapper.

### Upload
Play Console → **Create app** → upload the `.aab` → fill the listing using
`listing/store-listing.md` → upload `screenshots/android/` and
`icons/android/feature-graphic-1024x500.png` + `play-store-icon-512.png` →
complete Data Safety as **"No data collected"** → submit.

---

## Step 3 — Apple App Store (`.ipa`) — requires a Mac

Pick one:

- **You have a Mac:** install Xcode (free, from the Mac App Store).
- **You don't:** rent a cloud Mac — [MacInCloud](https://www.macincloud.com) (~$1/hr),
  or use GitHub Actions' free `macos-latest` runners, or borrow one for an afternoon.

Then:

1. Go to **[pwabuilder.com](https://www.pwabuilder.com)**, enter
   `https://vihaansuvarna2026.github.io/shieldforce/`
2. Click **Package for stores** → **iOS** → download the generated Xcode project.
3. Open it in Xcode on the Mac.
4. Set **Bundle Identifier** to `in.shieldforce.app`, select your Apple Developer team.
5. Replace the icon set with `icons/ios/` from this kit.
6. **Product → Archive** → **Distribute App** → **App Store Connect** → Upload.
7. In App Store Connect: create the app record, paste the copy from
   `listing/store-listing.md`, upload `screenshots/ios/`, set **App Privacy →
   Data Not Collected**, then submit for review.

### Apple's likely pushback and the answer
Apple guideline **4.2 (Minimum Functionality)** rejects apps that are "just a website".
Shield Force is defensible — it works fully offline, has on-device analysis, interactive
training with stored progress, and an emergency dialler. Use the prepared text in
`listing/store-listing.md` → "Review notes" section, which makes exactly this case.
If rejected anyway, reply in Resolution Center pointing to offline capability and the
on-device scanner; do not just resubmit unchanged.

---

## Step 4 — Windows and macOS desktop apps

Two paths:

**Free and instant (recommended):** on Windows or Mac, open the live URL in Chrome or
Edge → click the **install icon** in the address bar → it installs as a real desktop app
with its own window and icon. Nothing to build, nothing to sign.

**Installable `.exe` / `.dmg`:**
```bash
# copy the whole site into desktop/site/ first, then:
cd desktop
npm install
npm run build:win     # -> dist/*.exe   (works from Windows or Linux)
npm run build:mac     # -> dist/*.dmg   (must be run ON a Mac)
```
Icons expected at `desktop/build/icon.ico` (Windows), `icon.icns` (Mac), `icon.png`
(Linux) — convert from `icons/ios/AppIcon-1024-AppStore.png` with any online converter.

Unsigned Windows builds show a SmartScreen warning; unsigned Mac builds are blocked
unless the user right-clicks → Open. Code-signing certificates cost extra
(~$100–400/yr Windows, included with Apple Developer for Mac).

---

## Step 5 — Pre-submission checklist

- [ ] Live URL loads on a real iPhone and a real Android phone
- [ ] "Add to Home Screen" works and launches without a browser bar
- [ ] Terms gate appears on first launch, and only the first launch
- [ ] 1930 button opens the dialler on a real phone
- [ ] All 5 PDFs download on phone and desktop
- [ ] `privacy.html` and `terms.html` load at their public URLs
- [ ] Support email in the listing is one you actually monitor —
      **both stores email rejections there and will not chase you**
- [ ] Keystore backed up in two separate places

---

## What's in this kit

```
store-kit/
├── SUBMISSION-RUNBOOK.md          ← you are here
├── listing/store-listing.md       ← all copy, keywords, privacy answers, review notes
├── screenshots/
│   ├── ios/      6 × iPhone 6.7" (1290×2796) + 6 × iPad 12.9" (2048×2732)
│   └── android/  6 × phone (1080×1920) + 6 × 10" tablet (2560×1600)
├── icons/
│   ├── ios/      13 sizes incl. 1024×1024 App Store icon
│   └── android/  Play 512 icon, 5 mipmap densities, adaptive foreground,
│                 feature graphic 1024×500
├── android-twa/  twa-manifest.json + assetlinks template
└── desktop/      Electron wrapper (package.json + main.js)
```

All screenshots were captured from the real running app at the exact pixel dimensions
each store requires — they can be uploaded as-is.
