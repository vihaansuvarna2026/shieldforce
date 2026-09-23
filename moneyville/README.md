# 🏙️ MoneyVille: Life on Allowance

A **financial literacy game for children aged 8–14**, built as a self-contained web
app from the *MoneyVille* Game Design Document. Players manage an allowance, save for
goals, shop smart, run a small business, learn about investing, and spot scams — by
**experiencing the consequences of real-world money decisions** rather than reading
lectures or taking quizzes.

> *Gamified budgeting and investment learning through real-world financial decisions.*

The GDD suggests Unity for native WebGL/Android builds. This implementation targets the
same **WebGL/browser platform** with plain HTML/CSS/JavaScript, so it runs anywhere, is
installable as a PWA on phones and tablets, and works offline for classrooms — no build
step, no dependencies.

---

## ▶️ Run it

It's a static site. Any of these work:

```bash
# From this folder:
python3 -m http.server 8000
#   then open http://localhost:8000/

# …or just open index.html in a browser.
```

Progress is saved to `localStorage` on the device. A service worker caches everything
for **offline play**, and the web manifest makes it **installable** on Android/tablets.

---

## 🎮 What's in it (MVP scope, GDD §18)

| Feature | Status |
|---|---|
| Ten complete levels | ✅ |
| Three age-based difficulty modes (Junior / Explorer / Advanced) | ✅ |
| MoneyVille town map with unlockable buildings | ✅ |
| Budgeting, savings-goal & emergency-fund systems | ✅ |
| Shopping comparison, subscriptions, inflation simulation | ✅ |
| Business mini-game & fictional investment simulation | ✅ |
| Scam-detection mini-game | ✅ |
| Money XP, badges, cosmetic unlocks (all free — no real-money purchases) | ✅ |
| Star ratings, consequence-based feedback, replayable levels | ✅ |
| Teacher/parent dashboard + classroom join codes | ✅ |
| Local progress saving | ✅ |

### The ten levels (GDD §9)

1. **The First Allowance** — needs vs wants (budget allocation)
2. **Saving for Something Big** — setting & reaching a savings goal
3. **The Surprise Expense** — emergency funds
4. **Smart Shopper Challenge** — price comparison & value for money
5. **Subscription Trap** — recurring payments & auto-renewals
6. **Beat Inflation** — inflation & purchasing power
7. **Lemonade to Launch** — costs, revenue & profit
8. **Risk and Reward** — investment risk, return & diversification
9. **Scam Detective** — fraud awareness & online safety
10. **One Month on Your Own** — combines every system, awards a final title

Each level follows the **core gameplay loop** (GDD §4): receive money → review
responsibilities → make decisions → experience a twist → review results with a plain
explanation of consequences → unlock XP, badges and the next level.

---

## 🧭 Design principles honoured (GDD §22)

- **Teach through decisions, not lectures.** Every concept is a choice with a visible outcome.
- **Show consequences, never shame.** Feedback is positive / trade-off / corrective — respectful and non-patronising (GDD §12).
- **Reward balance, not just wealth.** Scores come from Planning, Saving, Safety, Smart Spending, Growth and Awareness — never from "most money".
- **Fictional investments only.** No real financial products or advice.
- **Age-appropriate complexity.** Each of the three difficulty modes has its *own* scenarios — different items, amounts, number of choices and twists — not the same puzzle rescaled:
  - **Junior (8–10):** small amounts, 2–3 simple choices, gentle surprises (e.g. AED 20 pocket money: lunch, a toy, savings).
  - **Explorer (11–12):** monthly budgets, subscriptions, simple interest (e.g. AED 100: school supplies, snacks, entertainment, gift, savings).
  - **Advanced (13–14):** larger budgets, multiple needs, inflation, investment risk, opportunity cost (e.g. AED 300: transport, phone credit, lunches, wants, savings).
- **Safe for classrooms.** No public chat, no player-to-player messaging; usernames are the player's own nickname; leaderboards focus on learning.

---

## 🏗️ Architecture

Plain ES5-friendly modules attached to a small global namespace, loaded in order via
`<script>` tags (works from `file://`, no bundler):

```
moneyville/
├── index.html              # app shell + PWA registration
├── manifest.webmanifest    # installable PWA metadata
├── sw.js                   # offline cache
├── icon.svg                # app icon
├── css/
│   └── moneyville.css       # full design system
└── js/
    ├── data.js             # ← CONTENT: all levels, badges, config (GDD §19)
    ├── state.js            # game state, persistence, scoring, badges (GDD §6,§7)
    ├── ui.js               # shared UI components (HUD, stars, results, toasts)
    ├── levels.js           # the 10 level mini-games
    └── app.js              # router, town map, dashboard, onboarding
```

### Content management (GDD §19)

All scenario content lives in **`js/data.js`**, fully separated from game logic. Each
level defines its id, number, concept, learning objective, feedback text, XP and badge
rewards, plus **three** level-specific scenarios under `configs.{junior, explorer,
advanced}` — each with its own items, amounts, choices and twist. The engine resolves
the config for the player's current difficulty mode. Renderers read only `level.config`
and score from category *flags* (need / saving / safety / growth), so they work with any
content set. **New scenarios or whole new difficulty variants can be added by editing
data only** — no engine changes required.

### Systems (GDD §20)

The engine mirrors the GDD's recommended managers: Game/Level routing (`app.js`),
Scenario content (`data.js`), Currency/Budget/Savings/Investment/Business scoring and
the Achievement, Progress-Save and Dashboard-Data managers (`state.js`).

---

## 👩‍🏫 Teacher / parent dashboard (GDD §16)

A private, read-only summary — **no chats or unnecessary personal data**. Shows levels
completed, time spent, Money XP, lifetime savings, and per-topic understanding
(budgeting, saving, emergency preparedness, business, investment risk, scam
recognition), plus **topics that need more practice** and a **classroom join code**.

---

## ♿ Notes

- Works on phones, tablets and desktop (responsive).
- Fully client-side; all data stays on the device.
- Money is fictional throughout; nothing here is financial advice.
