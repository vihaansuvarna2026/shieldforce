# Shield Force — Store Submission Runbook

The app is built. This is the order to publish it in, and exactly what to click.

## Where things stand

| | Status |
|---|---|
| Android app (Google Play) | **Built and tested.** Every push builds a test APK and the Play upload file (AAB) on GitHub, and installs the APK on an Android emulator to check the terms screen, tabs, Back button, PDFs and 1930 dialler. |
| iOS app (App Store) | **Built and tested.** Every push compiles it for iPhone/iPad and launches it in the iPhone and iPad Simulators. Signing and uploading must be done in Xcode on a Mac — Apple allows no other way. |
| Store graphics | **Ready**, every required size, in `google-play/` and `app-store/` (list at the end). |
| Store text and form answers | **Ready** in `listing/store-listing.md`. |
| Website (privacy policy, PDFs) | Ready to deploy — see `DEPLOY-NETLIFY.md` in the repository root. |

What only you can do: create the store accounts, create your signing key, and press
upload. Nothing secret is, or should ever be, stored in this repository — it is public.

---

## Step 1 — Accounts (start today; both take days to approve)

| | Cost | Notes |
|---|---|---|
| Google Play Console — play.google.com/console | **US$25 once** | Identity verification takes up to a few days. |
| Apple Developer Program — developer.apple.com/programs | **US$99 / year** | Identity verification, usually 1–2 days. Enrol as an individual unless you have a registered organisation (that needs a D-U-N-S number). |

> **Google Play rule for new personal accounts:** before the app can go public you must
> run a **closed test with at least 12 testers who stay opted in for 14 days in a row**.
> Line up 12+ people with Android phones (family, unit friends) now. Step 4 shows how.

---

## Step 2 — Put the website live (needed by both stores)

Both stores require a working privacy-policy web address, and the apps open the PDF field
guides from the website. Follow `DEPLOY-NETLIFY.md` and name the site **`shieldforce`**,
so the address is `https://shieldforce.netlify.app`.

If that name is taken, pick another and then change the one line `SF.siteUrl` in
`js/data-reports.js` to the new address and push — the apps are rebuilt automatically.

Check on your phone that `https://shieldforce.netlify.app/privacy.html` opens.

---

## Step 3 — Create your Android upload key (once, ever)

Google signs the app for users; you sign each upload with your own *upload key*.

1. Install **Android Studio** (free) — it includes the `keytool` program. On Windows it is at
   `C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe`; on a Mac,
   `/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool`.
2. Run (put the full path in front of `keytool` if your computer can't find it):
   ```
   keytool -genkeypair -v -keystore upload-key.jks -alias shieldforce -keyalg RSA -keysize 2048 -validity 10000
   ```
   Choose a strong password and answer the name questions.
3. **Back up `upload-key.jks` and the password in two private places** (a password
   manager plus an encrypted USB stick). If you lose it, Google can reset it, but only
   after a support request that takes days.
4. **Never** put this file in the repository, email it, or paste it anywhere public.

### Let GitHub sign the Play upload for you
In the repository on GitHub: **Settings → Secrets and variables → Actions → New
repository secret**, and add these four:

| Secret name | Value |
|---|---|
| `SF_UPLOAD_KEYSTORE_BASE64` | the key file as text — see below |
| `SF_UPLOAD_STORE_PASSWORD` | the password you chose |
| `SF_UPLOAD_KEY_ALIAS` | `shieldforce` |
| `SF_UPLOAD_KEY_PASSWORD` | the same password (unless you set a separate key password) |

To turn the key file into text and copy it:
- **Windows (PowerShell):** `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload-key.jks")) | Set-Clipboard`
- **Mac (Terminal):** `base64 -i upload-key.jks | pbcopy`

Secrets are encrypted by GitHub and never shown in logs or to visitors.

*(Prefer to build on your own computer instead? Create `android/keystore.properties` —
the file is git-ignored — containing:*
```
storeFile=/full/path/to/upload-key.jks
storePassword=your password
keyAlias=shieldforce
keyPassword=your password
```
*then run `npm ci` and `npm run sync`, and in the `android` folder `./gradlew bundleRelease`
(`gradlew.bat bundleRelease` on Windows). The AAB appears in
`android/app/build/outputs/bundle/release/`.)*

---

## Step 4 — Google Play

### 4a. Get the upload file
1. On GitHub open **Actions → Build apps**. Click **Run workflow** (or push any change).
2. When it finishes (about 10 minutes, all ticks green), open the run and download
   **`shieldforce-android-aab`**. Unzip it: `app-release.aab` is your upload file.
3. To try the app on your own Android phone first, download **`shieldforce-android-apk`**,
   unzip, copy `app-debug.apk` to the phone and open it (allow "install unknown apps").

Each run numbers the build automatically, so every new upload is accepted as newer.

### 4b. Create the app
Play Console → **Create app** → name **Shield Force**, language English (India), **App**,
**Free**, accept the declarations.

### 4c. Fill in "App content" and the listing
Use `listing/store-listing.md` — every form answer is in the "Google Play Console"
table. Then **Grow → Store presence → Main store listing**:

| Field | File in this kit |
|---|---|
| App icon (512 × 512) | `google-play/app-icon-512.png` |
| Feature graphic (1024 × 500) | `google-play/feature-graphic-1024x500.png` |
| Phone screenshots (1080 × 1920) | `google-play/screenshots/phone/` — all 6 |
| 7-inch tablet screenshots (1224 × 2176) | `google-play/screenshots/tablet-7in/` — all 6 |
| 10-inch tablet screenshots (2560 × 1440) | `google-play/screenshots/tablet-10in/` — all 6 |
| Chromebook screenshots (1920 × 1080) | `google-play/screenshots/chromebook/` — all 6 |

Short and full description: copy from `listing/store-listing.md`.

### 4d. Closed test (required for new personal accounts)
1. **Test and release → Testing → Closed testing → Create track**.
2. Add your testers' Gmail addresses (at least 12) as an email list.
3. **Create release** → upload `app-release.aab` → release name `1.0.0` → roll out.
4. Send testers the opt-in link from the track page; they must install and stay opted in.
5. After **14 days**, Play Console shows **Apply for production**. Answer the short
   questionnaire (how you tested, what feedback you got) and submit.

When production access is granted: **Production → Create release** → upload the newest
AAB → **Send for review**. Review usually takes 1–7 days.

---

## Step 5 — Apple App Store (needs a Mac)

You need a Mac with **Xcode 26 or newer** (free in the Mac App Store). No Mac? Borrow one
for an afternoon or rent one online (for example MacinCloud, about US$1/hour).

### 5a. Open the project
1. On the Mac, download the repository (GitHub → **Code → Download ZIP**, branch
   `claude/military-scam-awareness-site-y1xz1s`) and unzip it.
2. Double-click **`ios/App/App.xcodeproj`**. The app is already inside — no other
   software is needed. Xcode fetches the Capacitor library by itself the first time.
3. Xcode → **Settings → Accounts** → add your Apple ID.

### 5b. Sign it
Click **App** in the left sidebar → target **App** → **Signing & Capabilities** →
tick **Automatically manage signing** → **Team**: your developer account. The bundle
identifier is already `in.shieldforce.app`.

### 5c. Create the App Store record
App Store Connect (appstoreconnect.apple.com) → **Apps → +  New App** → iOS, name
**Shield Force**, language English (U.K.) or English (India), bundle ID
`in.shieldforce.app` (it appears after step 5b), SKU `shieldforce-1`.

### 5d. Upload
In Xcode: top bar device menu → **Any iOS Device (arm64)** → **Product → Archive** →
when the Organizer opens: **Distribute App → App Store Connect → Distribute**. Wait
10–30 minutes for it to finish processing.

Try it first on your own iPhone: in App Store Connect → **TestFlight**, add yourself as a
tester and install through the TestFlight app.

### 5e. Fill in the listing
In App Store Connect, version 1.0.0:

| Field | Source |
|---|---|
| iPhone 6.9" screenshots (1320 × 2868) | `app-store/screenshots/iphone-6.9in/` — all 6 |
| iPad 13" screenshots (2064 × 2752) | `app-store/screenshots/ipad-13in/` — all 6 |
| Promotional text, description, keywords, support URL, marketing URL | `listing/store-listing.md` |
| App Privacy, age rating, content rights | "App Store Connect answers" table in `listing/store-listing.md` |
| Build | pick the one you uploaded |
| App Review notes | "Notes for the reviewer" in `listing/store-listing.md` |

The App Store icon comes from the app itself; `app-store/app-icon-1024.png` is a copy for
reference. Apple uses the 6.9" and 13" sets for every smaller iPhone and iPad.
Then **Add for Review → Submit**. Review usually takes 1–3 days.

**Mac users:** leave "Make this app available on Apple silicon Macs" switched on and the
same app installs on M-series Macs from the Mac App Store, with nothing extra to build.

### If Apple pushes back
Guideline **4.2 (minimum functionality)** is the usual question for apps built with web
technology. Shield Force answers it: it works fully offline, scans messages on the
device, saves training progress, and dials the helpline. Reply in the Resolution Center
pointing to those, using the reviewer notes; don't resubmit unchanged.

---

## Step 6 — Windows and other computers

- **Easiest:** open `https://shieldforce.netlify.app` in Edge or Chrome → the install icon
  in the address bar → it installs as a desktop app that works offline. Free, nothing to sign.
- **Installer file:** `npm run desktop` (copies the app into `store-kit/desktop/site/`),
  then in `store-kit/desktop/`: `npm install` and `npm run build:win` (Windows `.exe`) or
  `npm run build:mac` (on a Mac). Unsigned installers show a SmartScreen / Gatekeeper
  warning; code-signing certificates cost extra.

---

## Updating the app later

1. Edit the files (screens are the `.html` files, content is in `js/data-*.js`).
2. Run `npm run sync` (needs Node.js 22) and commit — or just commit, and the GitHub
   check tells you if the iOS copy needs syncing.
3. GitHub builds a new AAB with a higher build number → upload it in Play Console.
4. On the Mac, download the new version, bump **Version** in Xcode (e.g. 1.0.1), archive
   and upload again.

Changed the icon design or the screens? `npm run icons` redraws every icon and splash
screen; `npm run store-assets` re-captures every store screenshot and the feature graphic.

---

## Before you press submit

- [ ] `https://shieldforce.netlify.app/privacy.html` and `/terms.html` open on a phone
- [ ] A PDF field guide opens from the app (More → Field guides) when online
- [ ] The test APK installs and runs on a real Android phone; the TestFlight build on an iPhone
- [ ] 1930 opens the phone dialler
- [ ] The support email is one you read — both stores send rejections there and won't chase you
- [ ] `upload-key.jks` and its password are backed up in two private places

---

## What's in this kit

```
store-kit/
├── SUBMISSION-RUNBOOK.md            ← you are here
├── listing/store-listing.md         ← all text and every store form answer
├── google-play/
│   ├── app-icon-512.png             512 × 512
│   ├── feature-graphic-1024x500.png 1024 × 500
│   └── screenshots/
│       ├── phone/                   6 × 1080 × 1920
│       ├── tablet-7in/              6 × 1224 × 2176
│       ├── tablet-10in/             6 × 2560 × 1440
│       └── chromebook/              6 × 1920 × 1080
├── app-store/
│   ├── app-icon-1024.png            1024 × 1024 (reference copy)
│   └── screenshots/
│       ├── iphone-6.9in/            6 × 1320 × 2868
│       └── ipad-13in/               6 × 2064 × 2752
├── icons/                           every icon size, for other tools
├── source/feature-graphic.html      source of the feature graphic
└── desktop/                         Windows / Mac / Linux installer project
```

All images are flattened RGB PNGs (no transparency, which both stores reject), captured
from the real app exactly as it looks in the store builds.
