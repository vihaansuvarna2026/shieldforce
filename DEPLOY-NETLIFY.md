# Deploying Shield Force to Netlify

Two ways. **Option A takes about 60 seconds and needs no account setup beyond a login.**
Option B is better long-term because every future `git push` redeploys automatically.

---

## Option A — Drag and drop (fastest)

1. Unzip `shieldforce-netlify.zip` (sent to you separately) so you have a folder
   containing `index.html` at its top level.
2. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**
3. **Drag the folder** onto the drop zone.
4. Done — Netlify gives you a live URL immediately, something like
   `https://spontaneous-kitten-a1b2c3.netlify.app`

> Drag the **folder itself**, not the .zip, and make sure `index.html` sits at the top
> level of it — not nested inside another folder. If the site loads blank, that nesting
> is almost always why.

### Give it a proper name
Netlify assigns a random subdomain. To change it:
**Site configuration → Site details → Change site name** → enter `shieldforce`
→ your URL becomes **`https://shieldforce.netlify.app`**

(If that name is taken, try `shield-force`, `shieldforce-in`, `shieldforce-india`.)

---

## Option B — Connect the GitHub repo (auto-deploys on every push)

1. Go to **[app.netlify.com](https://app.netlify.com)** → **Add new site** → **Import an existing project**
2. Choose **GitHub**, authorise Netlify, pick **`vihaansuvarna2026/shieldforce`**
3. Set:
   - **Branch to deploy:** `claude/military-scam-awareness-site-y1xz1s`
   - **Build command:** *leave empty*
   - **Publish directory:** `.` (just a dot)
4. **Deploy site**

`netlify.toml` in the repo already sets the correct headers, so there is nothing else to
configure. From then on, any push to that branch redeploys the site automatically.

---

## After it's live — 4 checks

Open the URL on your phone and confirm:

- [ ] Loading screen → terms gate appears on first visit
- [ ] Browser offers **Add to Home Screen** / install
- [ ] Tapping **1930** opens the dialler
- [ ] A PDF downloads from the Reports page

Then, to test offline: open the site, turn on airplane mode, reopen it. It should still work.

---

## What `netlify.toml` already handles

| Setting | Why |
|---|---|
| `sw.js` set to always revalidate | Otherwise a cached service worker pins users to an old build forever — the single most common PWA deployment bug |
| `.webmanifest` content type + revalidation | Some hosts serve it as plain text, which silently breaks installability |
| HTML revalidated, `/assets/*` cached a year | Content edits go live instantly; icons and PDFs stay fast |
| `X-Frame-Options`, `nosniff`, `Referrer-Policy` | Standard hardening |
| `Permissions-Policy` denying camera/mic/geolocation | The app requests none of these; this enforces it at the edge and backs up the privacy policy |

---

## Custom domain (optional, later)

If you buy a domain (e.g. `shieldforce.in`, ~₹800/yr):
**Domain management → Add a domain** → follow the DNS steps. Netlify issues the HTTPS
certificate free and automatically.

**If you do this after submitting to the app stores**, remember to update the URL in your
store listings and in `store-kit/android-twa/twa-manifest.json`, and re-generate
`.well-known/assetlinks.json` for the new domain — otherwise the Android app will show a
browser address bar.

---

## Note for the app-store step

`store-kit/android-twa/twa-manifest.json` is already pointed at
`https://shieldforce.netlify.app`. **If your actual Netlify subdomain ends up different,
search-replace it in that file** before running Bubblewrap, or the Android build will
verify against the wrong host.

For Digital Asset Links, the file must end up served at:
`https://<your-subdomain>.netlify.app/.well-known/assetlinks.json`
Put it at `.well-known/assetlinks.json` in the repo root and Netlify serves it as-is.
