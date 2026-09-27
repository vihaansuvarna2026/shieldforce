/* =============================================================================
   MoneyVille: Life on Allowance — Content Data Layer
   -----------------------------------------------------------------------------
   All scenario content lives here, separate from game logic (GDD §19).
   Each level defines THREE scenarios — one per age band — under
   `configs.{junior, explorer, advanced}`, and each uses a DIFFERENT game
   FORMAT so the three difficulties play as distinct mini-games, not the same
   puzzle rescaled (GDD §8). Formats: sort, budget, pick, savings, tapsave,
   scenario, emergency, shopping, subscription, inflation, business,
   investment, scam, spotflags, final. The engine dispatches on config.format.
   ============================================================================= */
(function (global) {
  "use strict";

  const CONFIG = {
    currency: "AED",
    starThresholds: { three: 85, two: 60, one: 0 },
    xpPerStar: 40,
    saveKey: "moneyville.save.v1",
  };

  const MODES = {
    junior:   { id: "junior",   name: "Junior",   ages: "8–10",  blurb: "Playful sorting, coin jars and simple choices.",        moneyScale: 1, hints: "full", icon: "🐣" },
    explorer: { id: "explorer", name: "Explorer", ages: "11–12", blurb: "Hands-on budgets, shops, subscriptions and businesses.", moneyScale: 1, hints: "some", icon: "🧭" },
    advanced: { id: "advanced", name: "Advanced", ages: "13–14", blurb: "Decision scenarios: investing, inflation, opportunity cost.", moneyScale: 1, hints: "few", icon: "🚀" },
  };

  const BUILDINGS = [
    { id: "home",       name: "Home",                  icon: "🏠", unlockLevel: 0, desc: "Review goals, budgets, badges and your room." },
    { id: "shop",       name: "Shopping Centre",       icon: "🛒", unlockLevel: 1, desc: "Buy items, compare prices, tell needs from wants." },
    { id: "bank",       name: "Bank",                  icon: "🏦", unlockLevel: 2, desc: "Deposit savings, set goals, learn about interest." },
    { id: "business",   name: "Business District",     icon: "🏭", unlockLevel: 7, desc: "Start a business, set prices, track profit." },
    { id: "investment", name: "Investment Centre",     icon: "📈", unlockLevel: 8, desc: "Learn risk, diversify, track simulated returns." },
    { id: "safety",     name: "Digital Safety Centre", icon: "🛡️", unlockLevel: 9, desc: "Spot scams and stay safe online." },
  ];

  const BADGES = {
    first_budget:   { id: "first_budget",   name: "First Budget",         icon: "📋", desc: "Complete your first budgeting level." },
    saved_100:      { id: "saved_100",      name: "First 100 Saved",      icon: "💰", desc: "Save a total of AED 100." },
    goal_getter:    { id: "goal_getter",    name: "Goal Getter",          icon: "🎯", desc: "Reach a complete savings goal." },
    safety_first:   { id: "safety_first",   name: "Safety First",         icon: "🚑", desc: "Handle an emergency the smart way." },
    smart_shopper:  { id: "smart_shopper",  name: "Smart Shopper",        icon: "🛍️", desc: "Ace a value-for-money challenge." },
    sub_manager:    { id: "sub_manager",    name: "Subscription Manager", icon: "🧾", desc: "Cut an unnecessary recurring payment." },
    beat_inflation: { id: "beat_inflation", name: "Beat Inflation",       icon: "📊", desc: "Reach a goal despite rising prices." },
    first_profit:   { id: "first_profit",   name: "First Profit",         icon: "🍋", desc: "Make smart business decisions." },
    balanced_inv:   { id: "balanced_inv",   name: "Balanced Investor",    icon: "⚖️", desc: "Invest with diversification in mind." },
    scam_blocker:   { id: "scam_blocker",   name: "Scam Blocker",         icon: "🚫", desc: "Correctly catch scam messages." },
    money_master:   { id: "money_master",   name: "MoneyVille Master",    icon: "👑", desc: "Complete all ten levels." },
  };

  const LEVELS = [
    /* ================= LEVEL 1 — Needs vs Wants ======================== */
    {
      id: "lvl-01-allowance", number: 1, title: "The First Allowance",
      concept: "Needs versus wants", building: "home", icon: "🪙", type: "budget",
      objective: "Tell needs from wants and use your money wisely.",
      learningOutcome: ["Tell needs from wants.", "Plan money before spending.", "Spending everything at once causes problems."],
      feedback: {
        good: "You clearly know a need from a want — and planned your money well.",
        tradeoff: "Good effort — a couple of choices leaned toward wants over needs.",
        corrective: "Needs come first. Cover the must-haves before the nice-to-haves.",
      },
      xp: 60, badge: "first_budget",
      configs: {
        junior: {
          format: "sort", dashboardKind: "budget", passRatio: 0.7,
          intro: "Sort each thing into what you NEED or what you just WANT.",
          objective: "Put every item in the right basket.",
          binA: { label: "Need", icon: "✅" }, binB: { label: "Want", icon: "💫" },
          items: [
            { id: "food",  name: "Healthy lunch", icon: "🥪", bin: "A", why: "You need food for energy at school." },
            { id: "toy",   name: "New toy",       icon: "🧸", bin: "B", why: "Fun, but not something you need." },
            { id: "shoes", name: "School shoes",  icon: "👟", bin: "A", why: "You need shoes for school." },
            { id: "candy", name: "Candy",         icon: "🍬", bin: "B", why: "A tasty treat — a want." },
            { id: "pencil",name: "Pencils",       icon: "✏️", bin: "A", why: "Needed for classwork." },
            { id: "game",  name: "Video game",    icon: "🎮", bin: "B", why: "Great fun, but a want." },
          ],
        },
        explorer: {
          format: "budget",
          intro: "Your first monthly allowance is AED 100. Split it between school supplies, fun and savings — school supplies are a must.",
          objective: "Cover school supplies and keep something back for savings.",
          income: 100,
          categories: [
            { id: "school", name: "School supplies", icon: "📚", need: true, min: 20, hint: "You must have these for class." },
            { id: "snacks", name: "Snacks",          icon: "🍫", need: false, min: 0 },
            { id: "fun",    name: "Entertainment",   icon: "🎮", need: false, min: 0 },
            { id: "gift",   name: "Birthday gift",   icon: "🎁", need: false, min: 0, hint: "Kind, but optional." },
            { id: "save",   name: "Savings",         icon: "🏦", need: false, min: 0, isSaving: true },
          ],
          twist: { name: "Surprise workbook", desc: "Your teacher asks everyone to buy a AED 15 workbook.", cost: 15 },
        },
        advanced: {
          format: "pick", dashboardKind: "budget",
          intro: "You have AED 250 but can't buy everything. Cover your needs first, then spend the rest where it adds the most value. Every purchase is money you can't use elsewhere (opportunity cost).",
          objective: "Buy all needs and stay within AED 250.",
          budget: 250,
          items: [
            { id: "transport", name: "Bus pass",          icon: "🚌", price: 50, need: true,  value: 5 },
            { id: "lunch",     name: "Month of lunches",  icon: "🍱", price: 70, need: true,  value: 5 },
            { id: "phone",     name: "Phone credit",      icon: "📱", price: 30, need: true,  value: 4 },
            { id: "book",      name: "Revision guide",    icon: "📗", price: 25, need: false, value: 4, note: "Boosts your grades." },
            { id: "hoodie",    name: "New hoodie",        icon: "🧥", price: 80, need: false, value: 3, note: "Nice, not needed." },
            { id: "game",      name: "Video game",        icon: "🎮", price: 60, need: false, value: 2, note: "Fun but pricey." },
            { id: "concert",   name: "Concert ticket",    icon: "🎫", price: 90, need: false, value: 2, note: "One night out." },
          ],
        },
      },
    },

    /* ================= LEVEL 2 — Savings goal ========================== */
    {
      id: "lvl-02-savings-goal", number: 2, title: "Saving for Something Big",
      concept: "Setting and reaching a savings goal", building: "bank", icon: "🚲", type: "savings",
      objective: "Work steadily toward a goal without getting sidetracked.",
      learningOutcome: ["Regular saving builds progress.", "Small buys can delay a bigger goal.", "Long-term goals need priority."],
      feedback: {
        good: "Steady, focused saving got you there. That's exactly how goals are reached.",
        tradeoff: "A tempting detour slowed you down — every small buy has a cost.",
        corrective: "You fell short. Saving a bit more, more consistently, gets you there.",
      },
      xp: 70, badge: "goal_getter",
      configs: {
        junior: {
          format: "tapsave", dashboardKind: "saving", passRatio: 0.9,
          intro: "Fill your jar to buy the toy robot! Each week, drop your coins into the jar.",
          objective: "Save up the full price by dropping coins each week.",
          goalName: "Toy robot", goalIcon: "🤖", goalPrice: 24,
          weeks: 4, weeklyAllowance: 8, perTap: 2,
          tempt: { week: 2, name: "Ice cream van!", icon: "🍦", cost: 4 },
        },
        explorer: {
          format: "savings",
          intro: "Choose a goal and decide how much to save each week for a month. Balance saving with small weekly costs.",
          objective: "Reach at least 90% of your goal by the end of the month.",
          weeklyIncome: 40, weeks: 4, weeklyExpense: 10, targetPercent: 90,
          goals: [
            { id: "bike",   name: "Bicycle",          icon: "🚲", price: 120 },
            { id: "game",   name: "Gaming accessory", icon: "🎮", price: 90 },
            { id: "trip",   name: "School trip",      icon: "🚌", price: 100 },
            { id: "art",    name: "Art kit",          icon: "🎨", price: 70 },
            { id: "sports", name: "Sports equipment", icon: "🏸", price: 110 },
          ],
          twist: { name: "Flash sale!", desc: "A cool gadget is on sale for AED 25 — this week only. Buying it delays your goal.", cost: 25 },
        },
        advanced: {
          format: "scenario", dashboardKind: "saving", passScore: 0.6,
          intro: "You're saving AED 600 for a laptop over a few months. Each month brings a choice that speeds up or slows your goal.",
          objective: "Make choices that keep your savings on track.",
          steps: [
            { situation: "Month 1: You get AED 200. A friend suggests a AED 90 weekend trip.", icon: "🏖️", choices: [
              { text: "Skip the trip, save AED 200", score: 1, outcome: "Great discipline — your laptop fund jumps ahead." },
              { text: "Go, and save AED 110", score: 0.5, outcome: "Fun, but the goal slips a few weeks." },
              { text: "Spend it all, save nothing", score: 0, outcome: "No progress toward the goal this month." },
            ] },
            { situation: "Month 2: Keep savings in a jar at home, or an account paying interest?", icon: "🏦", choices: [
              { text: "Interest-earning account", score: 1, outcome: "Your money grows a little on its own. Smart." },
              { text: "Jar at home", score: 0.5, outcome: "Safe, but it earns nothing." },
            ] },
            { situation: "Month 3: A limited game sale (AED 70) tempts you.", icon: "🎮", choices: [
              { text: "Resist and keep saving", score: 1, outcome: "Goal stays on track." },
              { text: "Buy it", score: 0.3, outcome: "Enjoyable, but the laptop moves further away." },
            ] },
            { situation: "Month 4: You could do a AED 120 side job this month.", icon: "💼", choices: [
              { text: "Take the side job", score: 1, outcome: "Extra earnings push you across the finish line." },
              { text: "Relax instead", score: 0.5, outcome: "Understandable, but slower progress." },
            ] },
          ],
        },
      },
    },

    /* ================= LEVEL 3 — Emergency fund ======================== */
    {
      id: "lvl-03-emergency", number: 3, title: "The Surprise Expense",
      concept: "Emergency funds", building: "bank", icon: "🚑", type: "emergency",
      objective: "Keep something aside so surprises don't derail you.",
      learningOutcome: ["Surprises happen to everyone.", "An emergency fund keeps you calm.", "Without one, surprises hurt your goals."],
      feedback: {
        good: "You handled the surprise calmly because you were prepared. That's the power of a safety fund.",
        tradeoff: "You coped, but it cost you elsewhere. A bigger buffer would have helped.",
        corrective: "The surprise caught you out. Keeping a little aside prevents that.",
      },
      xp: 75, badge: "safety_first",
      configs: {
        junior: {
          format: "sort", dashboardKind: "safety", passRatio: 0.7,
          intro: "Some money should be spent now, and some kept safe for surprises. Sort them!",
          objective: "Decide what to spend now and what to keep safe.",
          binA: { label: "Spend now", icon: "🛍️" }, binB: { label: "Keep safe", icon: "🛟" },
          items: [
            { id: "lunch",  name: "Money for today's lunch", icon: "🥪", bin: "A", why: "You need to eat today." },
            { id: "bus",    name: "Bus fare home",           icon: "🚌", bin: "A", why: "You need it to get home." },
            { id: "snack",  name: "Today's snack",           icon: "🍎", bin: "A", why: "A small need for today." },
            { id: "spare",  name: "Spare coins",             icon: "🪙", bin: "B", why: "Save them for a rainy day." },
            { id: "fund",   name: "Emergency fund",          icon: "🚑", bin: "B", why: "Always good to keep safe." },
            { id: "gift",   name: "Birthday money to save",  icon: "🎁", bin: "B", why: "Tuck it away for surprises." },
          ],
        },
        explorer: {
          format: "emergency",
          intro: "Everything looks normal this month. But life has surprises. Will you keep some money in a safety fund, just in case?",
          objective: "Cover essentials and resolve the surprise expense.",
          income: 100,
          categories: [
            { id: "essentials", name: "Essentials",   icon: "🥪", need: true, min: 25, hint: "Food, transport and school costs." },
            { id: "fun",        name: "Entertainment",icon: "🎮", need: false, min: 0 },
            { id: "goal",       name: "Savings goal", icon: "🎯", need: false, min: 0, isSaving: true },
            { id: "safety",     name: "Safety fund",  icon: "🛟", need: false, min: 0, isSafety: true, hint: "Money set aside for surprises." },
          ],
          twist: { name: "Unexpected expense", options: ["Your backpack strap snapped", "You lost your bus card", "Your football boots tore"], cost: 30 },
        },
        advanced: {
          format: "scenario", dashboardKind: "safety", passScore: 0.6,
          intro: "You kept a AED 120 safety fund. This month throws surprises at you — how you respond shows why an emergency fund matters.",
          objective: "Respond to each surprise the smart way.",
          steps: [
            { situation: "Your phone screen cracks. Repair is AED 90.", icon: "📱", choices: [
              { text: "Pay from the safety fund", score: 1, outcome: "Handled instantly — no stress, no borrowing." },
              { text: "Use a broken phone for now", score: 0.4, outcome: "You cope, but it's risky and inconvenient." },
              { text: "Borrow AED 90 from a friend", score: 0.2, outcome: "Now you owe money over an avoidable gap." },
            ] },
            { situation: "An unexpected AED 40 school fee is due.", icon: "🏫", choices: [
              { text: "Pay from what's left of the fund", score: 1, outcome: "Covered. Exactly what the fund is for." },
              { text: "Cancel your savings-goal deposit", score: 0.5, outcome: "Paid, but your bigger goal slips." },
            ] },
            { situation: "Next month — rebuild the safety fund?", icon: "🔁", choices: [
              { text: "Yes, top it up first", score: 1, outcome: "You're ready for the next surprise." },
              { text: "No, spend on fun", score: 0.3, outcome: "Risky — the next emergency could hurt." },
            ] },
          ],
        },
      },
    },

    /* ================= LEVEL 4 — Smart shopper ========================= */
    {
      id: "lvl-04-smart-shopper", number: 4, title: "Smart Shopper Challenge",
      concept: "Price comparison and value for money", building: "shop", icon: "🛍️", type: "shopping",
      objective: "Spot real value — the cheapest isn't always the best.",
      learningOutcome: ["Cheapest isn't always best value.", "Hidden fees and durability change the real cost.", "Weigh quality and quantity."],
      feedback: {
        good: "Sharp eye for value — you balanced price with quality beautifully.",
        tradeoff: "Decent, but a flimsy bargain or hidden cost slipped through.",
        corrective: "Chasing the lowest price backfired. Value beats price.",
      },
      xp: 80, badge: "smart_shopper",
      configs: {
        junior: {
          format: "sort", dashboardKind: "budget", passRatio: 0.7,
          intro: "Is each one a GOOD deal or a BAD deal? Think about price AND quality.",
          objective: "Sort the good deals from the bad ones.",
          binA: { label: "Good deal", icon: "👍" }, binB: { label: "Bad deal", icon: "👎" },
          items: [
            { id: "juice", name: "Big juice, low price",       icon: "🧃", bin: "A", why: "More for less — good value." },
            { id: "snack", name: "Tiny snack, high price",     icon: "🍪", bin: "B", why: "You pay a lot for very little." },
            { id: "bag",   name: "Sturdy bag on sale",         icon: "🎒", bin: "A", why: "Good quality and cheap — great deal." },
            { id: "toy",   name: "Toy that breaks fast",       icon: "🪀", bin: "B", why: "Cheap but breaks — not worth it." },
            { id: "pens",  name: "2 pens for the price of 1",   icon: "🖊️", bin: "A", why: "Extra free — good value." },
            { id: "drink", name: "Same drink, double the price",icon: "🥤", bin: "B", why: "Paying more for the same thing." },
          ],
        },
        explorer: {
          format: "shopping",
          intro: "You must buy supplies for a school activity. Different stores sell similar things — but watch for delivery fees and flimsy 'bargains'.",
          objective: "Buy all three items and stay under AED 80.",
          budget: 80,
          requiredItems: [
            { id: "notebook", name: "Notebook pack", icon: "📓", options: [
              { store: "QuickMart",  price: 12, quality: 2, durability: 1, delivery: 0, note: "Thin pages, tears easily." },
              { store: "ValueBooks", price: 18, quality: 4, durability: 3, delivery: 0, note: "Solid everyday choice." },
              { store: "PremiumCo",  price: 26, quality: 5, durability: 3, delivery: 4, note: "Great, but AED 4 delivery." },
            ] },
            { id: "pens", name: "Pen set", icon: "🖊️", options: [
              { store: "QuickMart",  price: 8,  quality: 3, durability: 2, delivery: 0, note: "Fine for a term." },
              { store: "ValueBooks", price: 10, quality: 4, durability: 3, delivery: 0, note: "Smooth and reliable." },
              { store: "BargainBin", price: 5,  quality: 1, durability: 1, delivery: 0, note: "Cheap, but often dries out." },
            ] },
            { id: "backpack", name: "Backpack", icon: "🎒", options: [
              { store: "QuickMart",  price: 30, quality: 2, durability: 1, delivery: 0, note: "Straps look weak." },
              { store: "ValueBooks", price: 42, quality: 4, durability: 4, delivery: 0, note: "Sturdy, 2-year warranty." },
              { store: "PremiumCo",  price: 38, quality: 3, durability: 2, delivery: 6, note: "Hidden AED 6 delivery fee!" },
            ] },
          ],
          twist: { name: "The catch", desc: "The cheapest backpack's strap breaks — a replacement costs AED 20. Some 'bargains' hide delivery fees." },
        },
        advanced: {
          format: "pick", dashboardKind: "budget",
          intro: "Kit out for a school trip with AED 150. Prices shown INCLUDE delivery. Buy every essential and spend the rest on the best value — cheap-but-flimsy costs more later.",
          objective: "Buy all essentials within AED 150.",
          budget: 150,
          items: [
            { id: "shoes",   name: "Walking shoes (durable)", icon: "👟", price: 60, need: true,  value: 5 },
            { id: "bottle",  name: "Water bottle",            icon: "🧴", price: 15, need: true,  value: 4 },
            { id: "bag",     name: "Sturdy daypack",          icon: "🎒", price: 45, need: true,  value: 5 },
            { id: "poncho",  name: "Rain poncho",             icon: "🧥", price: 10, need: false, value: 4, note: "Cheap and genuinely useful." },
            { id: "snacks",  name: "Snack pack",              icon: "🍫", price: 12, need: false, value: 3 },
            { id: "cheapbag",name: "Flimsy daypack",          icon: "👝", price: 20, need: false, value: 1, note: "Cheaper, but it'll rip — false economy." },
            { id: "camera",  name: "Disposable camera",       icon: "📷", price: 35, need: false, value: 2 },
          ],
        },
      },
    },

    /* ================= LEVEL 5 — Subscriptions ========================= */
    {
      id: "lvl-05-subscriptions", number: 5, title: "Subscription Trap",
      concept: "Recurring expenses and automatic payments", building: "home", icon: "🧾", type: "subscription",
      objective: "Keep only what's worth it before renewals hit.",
      learningOutcome: ["Small recurring payments add up.", "Free trials need cancelling in time.", "Review subscriptions regularly."],
      feedback: {
        good: "You kept only what you'd use and cut the rest. Wallet stays healthy!",
        tradeoff: "Reasonable, but a plan or two you don't need slipped through.",
        corrective: "Too much kept running. Trials are only free if you cancel in time.",
      },
      xp: 85, badge: "sub_manager",
      configs: {
        junior: {
          format: "sort", dashboardKind: "budget", passRatio: 0.7,
          intro: "Your apps all cost money every month. KEEP the ones worth it, CANCEL the ones you don't really use.",
          objective: "Keep the useful apps and cancel the rest.",
          binA: { label: "Keep", icon: "✅" }, binB: { label: "Cancel", icon: "🚫" },
          items: [
            { id: "learn", name: "Reading app you use daily",   icon: "📖", bin: "A", why: "You use it a lot — worth keeping." },
            { id: "ghost", name: "Game you stopped playing",    icon: "🕹️", bin: "B", why: "Not used — cancel to save money." },
            { id: "music", name: "Music you love",              icon: "🎵", bin: "A", why: "Used often — okay to keep." },
            { id: "dup",   name: "A 2nd video app (you have one)",icon: "📺", bin: "B", why: "You already have one — cut the extra." },
            { id: "trial", name: "Free trial you forgot",       icon: "⏰", bin: "B", why: "Cancel before it starts charging!" },
            { id: "cloud", name: "Photo backup you rely on",    icon: "☁️", bin: "A", why: "Useful — keep it." },
          ],
        },
        explorer: {
          format: "subscription",
          intro: "Loads of apps offer free trials. They feel free now — but at month's end, every active plan renews automatically.",
          objective: "Finish the month with a positive wallet.",
          income: 80,
          services: [
            { id: "video",  name: "Video streaming",   icon: "🎬", price: 20, trial: true,  cosmetic: true, note: "7-day free trial, then AED 20/mo." },
            { id: "gaming", name: "Gaming membership", icon: "🎮", price: 15, trial: false, cosmetic: true, note: "AED 15 every month." },
            { id: "music",  name: "Music subscription",icon: "🎵", price: 12, trial: true,                  note: "Free trial, then AED 12/mo." },
            { id: "learn",  name: "Learning app",      icon: "📖", price: 10, trial: false, useful: true,   note: "AED 10/mo — actually useful!" },
            { id: "cloud",  name: "Cloud storage",     icon: "☁️", price: 8,  trial: true,  useful: true,   note: "Trial, then AED 8/mo." },
            { id: "avatar", name: "Premium avatar",    icon: "😎", price: 18, trial: false, cosmetic: true, note: "AED 18/mo — pure cosmetic." },
          ],
          twist: { name: "Renewal day", desc: "The month ends. Every active plan charges you — and free trials you forgot to cancel become paid." },
        },
        advanced: {
          format: "scenario", dashboardKind: "budget", passScore: 0.6,
          intro: "It's your monthly money check-up. Small recurring charges add up — decide what to do with each.",
          objective: "Trim the recurring costs that don't earn their place.",
          steps: [
            { situation: "A AED 35 streaming plan you watch maybe once a month.", icon: "🎬", choices: [
              { text: "Cancel it", score: 1, outcome: "You barely used it — AED 35/mo saved." },
              { text: "Downgrade to a cheaper tier", score: 0.7, outcome: "Sensible — some saving, some access." },
              { text: "Keep paying full price", score: 0.2, outcome: "You keep paying for something you rarely use." },
            ] },
            { situation: "A free trial ends in 2 days. You forgot about it.", icon: "⏰", choices: [
              { text: "Cancel before it charges", score: 1, outcome: "Nice catch — you avoided a surprise charge." },
              { text: "Ignore it", score: 0.1, outcome: "It auto-renews and charges you. Ouch." },
            ] },
            { situation: "You're paying for two music apps.", icon: "🎵", choices: [
              { text: "Keep one, cancel the other", score: 1, outcome: "No need to pay twice — smart trim." },
              { text: "Keep both", score: 0.3, outcome: "You're paying double for the same thing." },
            ] },
            { situation: "A study app (AED 25) genuinely boosts your grades.", icon: "📚", choices: [
              { text: "Keep it", score: 1, outcome: "Good value — it pays off in results." },
              { text: "Cancel to save money", score: 0.5, outcome: "Saves cash now, but you lose a useful tool." },
            ] },
          ],
        },
      },
    },

    /* ================= LEVEL 6 — Inflation ============================= */
    {
      id: "lvl-06-inflation", number: 6, title: "Beat Inflation",
      concept: "Inflation and purchasing power", building: "bank", icon: "📊", type: "inflation",
      objective: "Keep your saving ahead of rising prices.",
      learningOutcome: ["Prices rise over time.", "The same money buys less later.", "Earning interest helps you keep up."],
      feedback: {
        good: "You stayed ahead of rising prices — smart saving beats inflation.",
        tradeoff: "You kept pace, just. Inflation makes waiting expensive.",
        corrective: "Prices outran your savings. Interest and cutting extras help close the gap.",
      },
      xp: 90, badge: "beat_inflation",
      configs: {
        junior: {
          format: "tapsave", dashboardKind: "saving", passRatio: 0.9,
          intro: "You want a skateboard, but its price goes UP a little each week! Fill your jar fast to beat the rising price.",
          objective: "Save enough before the price climbs too high.",
          goalName: "Skateboard", goalIcon: "🛹", goalPrice: 40,
          weeks: 4, weeklyAllowance: 14, perTap: 2, inflationPerWeek: 2,
        },
        explorer: {
          format: "inflation",
          intro: "You want an item that costs AED 500 today. Over several months its price keeps creeping up. Can your savings keep pace?",
          objective: "Buy the item, or reach the revised target.",
          startPrice: 500, months: 5, monthlyIncome: 130,
          baseInflation: 0.03, highInflationMonth: 3, highInflationRate: 0.09, savingsInterest: 0.02,
          twist: { name: "Inflation spike", desc: "A burst of high inflation makes the item's price jump faster than expected." },
        },
        advanced: {
          format: "scenario", dashboardKind: "saving", passScore: 0.6,
          intro: "Prices are rising fast this year. You're saving for a AED 1,500 item. Each decision affects whether your money keeps up.",
          objective: "Make choices that beat inflation.",
          steps: [
            { situation: "Where do you keep your savings?", icon: "🏦", choices: [
              { text: "Account earning 4% interest", score: 1, outcome: "Your money grows and offsets rising prices." },
              { text: "Cash under the bed", score: 0.3, outcome: "It loses value as prices climb — inflation bites." },
            ] },
            { situation: "Inflation jumps and the item costs more.", icon: "📈", choices: [
              { text: "Increase your monthly saving", score: 1, outcome: "You adapt your plan and stay on track." },
              { text: "Keep saving the same amount", score: 0.5, outcome: "You fall a little behind the rising price." },
              { text: "Give up on the goal", score: 0.1, outcome: "Prices won." },
            ] },
            { situation: "Buy now (you can afford it) or wait and save more?", icon: "💳", choices: [
              { text: "Buy now before prices rise further", score: 0.9, outcome: "Locking today's price is smart when inflation is high." },
              { text: "Wait months and pay a higher price", score: 0.4, outcome: "You paid more later — inflation cost you." },
            ] },
            { situation: "Cut an expense to save faster?", icon: "✂️", choices: [
              { text: "Trim a subscription you don't use", score: 1, outcome: "Freed-up money speeds you to the goal." },
              { text: "Change nothing", score: 0.5, outcome: "Slower progress against rising prices." },
            ] },
          ],
        },
      },
    },

    /* ================= LEVEL 7 — Business ============================== */
    {
      id: "lvl-07-business", number: 7, title: "Lemonade to Launch",
      concept: "Entrepreneurship: costs, revenue and profit", building: "business", icon: "🍋", type: "business",
      objective: "Turn a profit — revenue minus costs.",
      learningOutcome: ["Revenue isn't profit.", "Businesses have costs.", "Price affects demand.", "More sales ≠ more profit."],
      feedback: {
        good: "Great instincts — you priced to sell, controlled costs and made a profit.",
        tradeoff: "You made sales, but thin margins ate the profit. Watch costs, not just revenue.",
        corrective: "The numbers didn't work out. Profit = revenue − costs — keep costs below price.",
      },
      xp: 100, badge: "first_profit",
      configs: {
        junior: {
          format: "pick", dashboardKind: "business",
          intro: "Set up your lemonade stall! You have AED 20 to buy supplies. Pick what you NEED to make and sell lemonade — don't overspend.",
          objective: "Buy the essentials to run your stall within AED 20.",
          budget: 20,
          items: [
            { id: "lemons", name: "Lemons",                    icon: "🍋", price: 6, need: true,  value: 5 },
            { id: "cups",   name: "Cups",                      icon: "🥤", price: 4, need: true,  value: 5 },
            { id: "sugar",  name: "Sugar",                     icon: "🧂", price: 3, need: true,  value: 4 },
            { id: "sign",   name: "A sign to draw customers",  icon: "🪧", price: 3, need: false, value: 4, note: "Cheap and brings customers." },
            { id: "straws", name: "Fancy straws",              icon: "🥤", price: 5, need: false, value: 2, note: "Nice, but not needed." },
            { id: "umbrella",name: "Big umbrella",             icon: "⛱️", price: 9, need: false, value: 2, note: "Costly for a small stall." },
          ],
        },
        explorer: {
          format: "business",
          intro: "Time to start a small business! Choose what to sell, set your price and quality, then adjust each day as customers respond.",
          objective: "Reach AED 80 profit in 5 days.",
          startingCash: 60, days: 5, targetProfit: 80, adEffectiveness: 0.5,
          businesses: [
            { id: "lemonade",  name: "Lemonade stall",   icon: "🍋", unitCost: 2, baseDemand: 30 },
            { id: "bookmark",  name: "Bookmark shop",    icon: "🔖", unitCost: 1, baseDemand: 26 },
            { id: "petwalk",   name: "Pet-walking",      icon: "🐕", unitCost: 1, baseDemand: 18 },
            { id: "stationery",name: "Stationery stall", icon: "✏️", unitCost: 3, baseDemand: 24 },
            { id: "digital",   name: "Digital artwork",  icon: "🖼️", unitCost: 1, baseDemand: 16 },
          ],
          twist: { name: "New competition", desc: "A rival stall opens nearby around day 3, cooling demand. Adjust your price and quality to keep customers." },
        },
        advanced: {
          format: "scenario", dashboardKind: "business", passScore: 0.6,
          intro: "You run a small business for a week. Revenue is what comes in; profit is what's left after costs. Make the calls.",
          objective: "Make decisions that lead to real profit.",
          steps: [
            { situation: "Your product costs AED 3 to make. What price do you set?", icon: "🏷️", choices: [
              { text: "AED 9 — healthy margin, still fair", score: 1, outcome: "Good markup and steady sales — solid profit." },
              { text: "AED 3 — same as cost", score: 0.2, outcome: "You sell lots but make no profit. Revenue ≠ profit." },
              { text: "AED 20 — very high", score: 0.4, outcome: "Big margin, but few customers buy." },
            ] },
            { situation: "Sales are slow. Spend on ads?", icon: "📣", choices: [
              { text: "A small, targeted AED 30 ad", score: 0.9, outcome: "More customers come; the ad pays for itself." },
              { text: "A huge AED 100 ad blast", score: 0.3, outcome: "Costs balloon and eat your profit." },
              { text: "No ads — lower the price a bit", score: 0.7, outcome: "A modest cut lifts sales without big costs." },
            ] },
            { situation: "A competitor opens nearby.", icon: "🏪", choices: [
              { text: "Improve quality, keep loyal customers", score: 1, outcome: "Customers stay for the better product." },
              { text: "Start a price war down to AED 2", score: 0.3, outcome: "You keep customers but lose money on each sale." },
            ] },
            { situation: "You made a profit. What now?", icon: "💰", choices: [
              { text: "Reinvest some to grow", score: 1, outcome: "Smart — reinvesting fuels future profit." },
              { text: "Spend it all immediately", score: 0.4, outcome: "No cushion for slow days ahead." },
            ] },
          ],
        },
      },
    },

    /* ================= LEVEL 8 — Investment ============================ */
    {
      id: "lvl-08-investment", number: 8, title: "Risk and Reward",
      concept: "Investment risk, return and diversification", building: "investment", icon: "📈", type: "investment",
      objective: "Balance risk and reward; spread your money.",
      learningOutcome: ["Higher returns mean higher risk.", "Investments rise and fall.", "Diversifying reduces the damage of any one loss."],
      feedback: {
        good: "Calm, diversified thinking — you balanced risk and reward well.",
        tradeoff: "Some smart moves, but a little too much risk in one place.",
        corrective: "Concentrated bets are dangerous. Spreading your money protects you.",
      },
      xp: 110, badge: "balanced_inv",
      configs: {
        junior: {
          format: "sort", dashboardKind: "invest", passRatio: 0.7,
          intro: "Some places to put money are SAFER (small, steady) and some are RISKIER (could grow a lot — or drop). Sort them!",
          objective: "Sort each option into safer or riskier.",
          binA: { label: "Safer", icon: "🛡️" }, binB: { label: "Riskier", icon: "🎢" },
          items: [
            { id: "piggy",   name: "Piggy bank",           icon: "🐷", bin: "A", why: "Very safe, grows slowly." },
            { id: "bond",    name: "Government bond",       icon: "📜", bin: "A", why: "Low risk, steady." },
            { id: "coin",    name: "Trendy new coin",       icon: "🪙", bin: "B", why: "Can jump or crash — risky." },
            { id: "onestock",name: "One brand-new company", icon: "🏢", bin: "B", why: "Could soar or sink — risky." },
            { id: "savings", name: "Savings account",       icon: "🏦", bin: "A", why: "Safe and predictable." },
            { id: "hype",    name: "'Get rich quick' scheme",icon: "🚀", bin: "B", why: "Very risky — often a scam." },
          ],
        },
        explorer: {
          format: "investment",
          intro: "Here is AED 500 of pretend investment money. Divide it between options with different risk levels, then watch the (fictional) market unfold.",
          objective: "Diversify across the options and complete six months.",
          capital: 500, months: 6, crashMagnitude: -0.35,
          assets: [
            { id: "savings", name: "Savings account", icon: "🏦", risk: "Very low", meanReturn: 0.01, volatility: 0.00 },
            { id: "bond",    name: "Government bond",  icon: "📜", risk: "Low",      meanReturn: 0.02, volatility: 0.02 },
            { id: "fund",    name: "Diversified fund", icon: "🧺", risk: "Medium",   meanReturn: 0.04, volatility: 0.06 },
            { id: "share",   name: "Single company",   icon: "🏢", risk: "High",     meanReturn: 0.06, volatility: 0.16, crashProne: true },
            { id: "trend",   name: "High-risk trend",  icon: "🎢", risk: "Very high", meanReturn: 0.08, volatility: 0.30, crashProne: true },
          ],
          twist: { name: "Market shock", desc: "One high-flying asset suddenly crashes. A diversified portfolio is hurt far less than an all-in bet." },
        },
        advanced: {
          format: "scenario", dashboardKind: "invest", passScore: 0.6,
          intro: "You have AED 1,500 to invest. Higher returns come with higher risk — and spreading your money (diversifying) protects you. Decide as the market moves.",
          objective: "Invest wisely as the market shifts.",
          steps: [
            { situation: "How do you split your money?", icon: "🧺", choices: [
              { text: "Spread across savings, bonds, a fund and one share", score: 1, outcome: "Diversified — no single loss can wipe you out." },
              { text: "All-in on one trendy asset", score: 0.2, outcome: "Huge risk: one bad move and it's gone." },
              { text: "All in a savings account", score: 0.6, outcome: "Very safe, but barely grows." },
            ] },
            { situation: "A 'guaranteed 30% a month' offer appears.", icon: "⚠️", choices: [
              { text: "Avoid it — guaranteed high returns are a red flag", score: 1, outcome: "Wise. No real investment guarantees that." },
              { text: "Put everything in", score: 0, outcome: "It was a scam. Money gone." },
            ] },
            { situation: "The market drops 20% this month.", icon: "📉", choices: [
              { text: "Stay calm, stick to your plan", score: 1, outcome: "Markets recover over time; panic-selling locks in losses." },
              { text: "Sell everything in a panic", score: 0.3, outcome: "You lock in the loss right before a rebound." },
            ] },
            { situation: "One risky asset doubled. What now?", icon: "📈", choices: [
              { text: "Take some profit, stay diversified", score: 1, outcome: "Sensible — you bank gains and stay balanced." },
              { text: "Move everything into it", score: 0.2, outcome: "Chasing past performance is dangerous." },
            ] },
          ],
        },
      },
    },

    /* ================= LEVEL 9 — Scam detective ======================== */
    {
      id: "lvl-09-scam", number: 9, title: "Scam Detective",
      concept: "Fraud awareness and online safety", building: "safety", icon: "🕵️", type: "scam",
      objective: "Tell scams from genuine messages and stay safe.",
      learningOutcome: ["Never share passwords or codes.", "Urgent, pushy language is a warning sign.", "Guaranteed returns and odd links are red flags.", "Ask a trusted adult when unsure."],
      feedback: {
        good: "Sharp eyes! You spotted the scams and kept the genuine messages.",
        tradeoff: "You caught most of them. Double-check senders and links next time.",
        corrective: "A few scams slipped through. Watch for urgency, code requests and odd links.",
      },
      xp: 110, badge: "scam_blocker",
      configs: {
        junior: {
          format: "sort", dashboardKind: "scam", passRatio: 0.7,
          intro: "Is each message SAFE or a SCAM? Watch out for prizes, passwords and 'act now!'.",
          objective: "Sort the safe messages from the scams.",
          binA: { label: "Safe", icon: "✅" }, binB: { label: "Scam", icon: "🚩" },
          items: [
            { id: "s1", name: "“You WON a free phone! Tap here!”",        icon: "🎁", bin: "B", why: "Free prizes from strangers are scams." },
            { id: "s2", name: "“Bring your book tomorrow.” — Teacher",     icon: "📚", bin: "A", why: "A normal, genuine reminder." },
            { id: "s3", name: "“Send me your password for free coins.”",   icon: "🔑", bin: "B", why: "Never share your password." },
            { id: "s4", name: "“Dinner's ready!” — Mum",                   icon: "🍽️", bin: "A", why: "A genuine message from family." },
            { id: "s5", name: "“Your account closes TODAY! Click now!”",    icon: "⏰", bin: "B", why: "Scary, urgent messages are tricks." },
            { id: "s6", name: "“Library book due next week.”",             icon: "📖", bin: "A", why: "A real, normal notice." },
          ],
        },
        explorer: {
          format: "scam",
          intro: "Your inbox is buzzing. Some messages are real, some are scams trying to trick you. Inspect each one and decide.",
          objective: "Correctly identify at least 6 of the 10 messages.",
          requiredCorrect: 6,
          messages: [
            { id: "m1", from: "Prize Team <win@fr3e-phone.co>", text: "🎉 You have WON a free phone! Click http://fr3e-phone.co/claim now before it expires!", scam: true, flags: ["Odd sender address", "Too good to be true", "Urgent link"] },
            { id: "m2", from: "MoneyVille Bank", text: "Your monthly statement is ready. Log in through the official app to view it.", scam: false, flags: [] },
            { id: "m3", from: "Security <verify@bank-secure-help.net>", text: "Send us your banking verification code to keep your account open.", scam: true, flags: ["Asks for a code", "Suspicious address", "Threatens account"] },
            { id: "m4", from: "InvestFast", text: "Invest today and we GUARANTEE you triple your money in a week!", scam: true, flags: ["Guaranteed return", "Unrealistic promise"] },
            { id: "m5", from: "School Office", text: "Reminder: the science trip form is due Friday. See the office if you have questions.", scam: false, flags: [] },
            { id: "m6", from: "Account Team", text: "URGENT: Your account will close TODAY unless you confirm your password here: bit.ly/xy9", scam: true, flags: ["Urgent threat", "Asks for password", "Shortened link"] },
            { id: "m7", from: "Best Friend Sam", text: "Hey it's Sam on a new number — I'm stuck, can you send me AED 50 right now? Don't tell anyone.", scam: true, flags: ["Copied identity", "Secrecy", "Urgent money request"], twist: true },
            { id: "m8", from: "Library", text: "Your book 'Money Basics' is due next week. Renew online or at the desk.", scam: false, flags: [] },
            { id: "m9", from: "Rewards", text: "Your subscription payment failed — update your card at http://paymnt-update.info to avoid loss.", scam: true, flags: ["Misspelt link", "Pressure to pay", "Suspicious address"] },
            { id: "m10", from: "Coach Ahmed", text: "Practice is moved to 5pm tomorrow. Bring your water bottle!", scam: false, flags: [] },
          ],
          twist: { name: "Copied friend", desc: "One scam pretends to be a friend whose account was copied. Real friends don't demand secret, urgent money." },
        },
        advanced: {
          format: "spotflags", dashboardKind: "scam", requiredCorrect: 4,
          intro: "Inspect each message closely. Tap the red flags you spot, then judge it: scam or genuine.",
          objective: "Find the red flags and get at least 4 of 5 verdicts right.",
          messages: [
            { id: "f1", from: "IT Support <it@sch00l-helpdesk.net>", text: "Your login expires in 1 hour. Verify your password at sch00l-helpdesk.net/login", scam: true,
              flags: [{ text: "Lookalike domain (sch00l)", real: true }, { text: "Asks for your password", real: true }, { text: "Creates urgency", real: true }, { text: "Mentions your login", real: false }] },
            { id: "f2", from: "Bank of MoneyVille", text: "We noticed a new login. If this wasn't you, review activity in our official app.", scam: false,
              flags: [{ text: "Mentions a login", real: false }, { text: "Points to official app", real: false }, { text: "No link to click", real: false }] },
            { id: "f3", from: "CryptoDoubler", text: "Send AED 100, get AED 300 back guaranteed in 24h. Only 3 slots left!", scam: true,
              flags: [{ text: "Guaranteed big return", real: true }, { text: "Fake scarcity (3 slots)", real: true }, { text: "Asks you to send money", real: true }, { text: "Mentions 24 hours", real: false }] },
            { id: "f4", from: "Coach Ahmed", text: "Training moved to Saturday 9am. Reply to confirm.", scam: false,
              flags: [{ text: "Asks you to reply", real: false }, { text: "Mentions a time", real: false }] },
            { id: "f5", from: "Rewards", text: "Your payment failed. Update your card at netfliix-billing.com now.", scam: true,
              flags: [{ text: "Misspelt domain (netfliix)", real: true }, { text: "Pressure to act now", real: true }, { text: "Payment-problem claim", real: true }, { text: "Mentions your card", real: false }] },
          ],
        },
      },
    },

    /* ================= LEVEL 10 — One month on your own =============== */
    {
      id: "lvl-10-full-month", number: 10, title: "One Month on Your Own",
      concept: "Complete financial planning", building: "home", icon: "🏆", type: "final",
      objective: "Bring it all together and finish the month strong.",
      learningOutcome: ["Combine budgeting, saving, safety and awareness.", "Balance many priorities at once.", "Handle surprises without failing on essentials."],
      feedback: {
        good: "Outstanding! You balanced every priority and handled the surprises with ease.",
        tradeoff: "A strong month — a couple of areas could be tighter, but essentials held.",
        corrective: "The month got away in places. Cover essentials first, then balance the rest.",
      },
      xp: 150, badge: "money_master",
      configs: {
        junior: {
          format: "pick", dashboardKind: "budget",
          intro: "A whole week on your own with AED 30! Buy what you NEED first, then a little fun — don't run out.",
          objective: "Cover your needs and stay within AED 30.",
          budget: 30,
          items: [
            { id: "food", name: "Food for the week",  icon: "🍎", price: 12, need: true,  value: 5 },
            { id: "bus",  name: "Bus fares",          icon: "🚌", price: 6,  need: true,  value: 5 },
            { id: "save", name: "Put some in savings",icon: "🐷", price: 5,  need: false, value: 5, note: "Saving is a smart choice!" },
            { id: "game", name: "A small game",       icon: "🎮", price: 8,  need: false, value: 3 },
            { id: "candy",name: "Sweets",             icon: "🍬", price: 4,  need: false, value: 2 },
            { id: "toy",  name: "A big toy",          icon: "🧸", price: 20, need: false, value: 2, note: "Fun, but pricey." },
          ],
        },
        explorer: {
          format: "final",
          intro: "This is the big one. A full month, all systems, fewer hints. Balance needs, savings, safety, subscriptions and a surprise or two.",
          objective: "Cover essentials and finish the month in balance.",
          income: 160, startingSavings: 40,
          categories: [
            { id: "essentials", name: "Essentials",   icon: "🥪", need: true, min: 40, hint: "Food, transport, school." },
            { id: "fun",        name: "Entertainment",icon: "🎮", need: false, min: 0 },
            { id: "goal",       name: "Savings goal", icon: "🎯", need: false, min: 0, isSaving: true },
            { id: "safety",     name: "Safety fund",  icon: "🛟", need: false, min: 0, isSafety: true },
            { id: "subs",       name: "Subscriptions",icon: "🧾", need: false, min: 0, hint: "Keep only what you use." },
            { id: "invest",     name: "Investment",   icon: "📈", need: false, min: 0, isGrowth: true },
          ],
          twists: [
            { name: "Unexpected repair", desc: "Your bike needs a AED 25 repair.", cost: 25, need: "safety" },
            { name: "Costly invite", desc: "A friend invites you to a AED 20 outing.", cost: 20, optional: true },
            { name: "Price rise", desc: "Essentials cost AED 10 more this month.", cost: 10, need: "essentials" },
          ],
          titles: [
            { id: "planner",  name: "Prepared Planner",        icon: "📋", basis: "planning" },
            { id: "goal",     name: "Goal Getter",             icon: "🎯", basis: "saving" },
            { id: "shopper",  name: "Smart Shopper",           icon: "🛍️", basis: "spending" },
            { id: "saver",    name: "Safety Saver",            icon: "🛟", basis: "safety" },
            { id: "investor", name: "Young Investor",          icon: "📈", basis: "growth" },
            { id: "balanced", name: "Balanced Decision-Maker", icon: "⚖️", basis: "balance" },
          ],
        },
        advanced: {
          format: "scenario", dashboardKind: "budget", passScore: 0.65,
          intro: "A full month on your own on AED 400. Balance rent, food, saving, safety and surprises. Every choice counts.",
          objective: "Make choices that keep essentials covered and the month balanced.",
          steps: [
            { situation: "Fixed costs: rent AED 150, food AED 90, transport AED 50. How do you handle them?", icon: "🏠", choices: [
              { text: "Pay all essentials first, then budget the rest", score: 1, outcome: "Rock-solid — needs are covered before anything else." },
              { text: "Pay rent, delay food and transport", score: 0.3, outcome: "Risky — skipping essentials causes bigger problems." },
            ] },
            { situation: "AED 110 is left. How do you use it?", icon: "💰", choices: [
              { text: "Split: some savings, some safety fund, a little fun", score: 1, outcome: "Balanced and resilient." },
              { text: "All on entertainment", score: 0.3, outcome: "Fun now, but nothing saved or set aside." },
              { text: "All into savings, no safety fund", score: 0.6, outcome: "Great saving, but a surprise could hurt." },
            ] },
            { situation: "Surprise: a AED 60 laptop repair for schoolwork.", icon: "💻", choices: [
              { text: "Pay from your safety fund", score: 1, outcome: "Exactly why you keep one." },
              { text: "Borrow the money", score: 0.3, outcome: "You go into debt over an avoidable gap." },
            ] },
            { situation: "Friends plan a AED 50 day out, but money's tight.", icon: "🎢", choices: [
              { text: "Suggest a cheaper plan", score: 1, outcome: "You stay social without breaking the budget." },
              { text: "Skip it this time", score: 0.8, outcome: "Sensible when money's tight." },
              { text: "Go and overspend", score: 0.4, outcome: "Fun, but you dip into essentials." },
            ] },
            { situation: "Month end — you have a small surplus.", icon: "🏁", choices: [
              { text: "Save it toward next month", score: 1, outcome: "You end strong and ready. Excellent planning." },
              { text: "Spend it all", score: 0.5, outcome: "A fine month, but nothing carried forward." },
            ] },
          ],
        },
      },
    },
  ];

  global.MV_DATA = { CONFIG, MODES, BUILDINGS, BADGES, LEVELS };
})(window);
