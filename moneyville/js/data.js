/* =============================================================================
   MoneyVille: Life on Allowance — Content Data Layer
   -----------------------------------------------------------------------------
   All scenario content lives here, separate from game logic (GDD §19). Each of
   the ten levels defines THREE completely different scenarios — one per age
   band — under `configs.{junior, explorer, advanced}`. The engine resolves the
   config for the player's current difficulty mode, so Junior, Explorer and
   Advanced players face different items, amounts, choices and twists, not the
   same puzzle rescaled (GDD §8 Age-Based Difficulty).
   ============================================================================= */
(function (global) {
  "use strict";

  /* ---- Global config ------------------------------------------------------ */
  const CONFIG = {
    currency: "AED",
    starThresholds: { three: 85, two: 60, one: 0 },
    xpPerStar: 40,
    saveKey: "moneyville.save.v1",
  };

  /* ---- Difficulty modes (GDD §8) ------------------------------------------
     moneyScale is 1 for every mode now: each mode's config carries its own
     age-appropriate absolute amounts, so nothing is auto-rescaled. -----------*/
  const MODES = {
    junior: {
      id: "junior", name: "Junior", ages: "8–10",
      blurb: "Small amounts, few simple choices, lots of guidance.",
      moneyScale: 1, hints: "full", icon: "🐣",
    },
    explorer: {
      id: "explorer", name: "Explorer", ages: "11–12",
      blurb: "Monthly budgets, discounts, subscriptions and simple interest.",
      moneyScale: 1, hints: "some", icon: "🧭",
    },
    advanced: {
      id: "advanced", name: "Advanced", ages: "13–14",
      blurb: "Bigger budgets, inflation, investment risk and opportunity cost.",
      moneyScale: 1, hints: "few", icon: "🚀",
    },
  };

  /* ---- Buildings / town map (GDD §5) -------------------------------------- */
  const BUILDINGS = [
    { id: "home",       name: "Home",                  icon: "🏠", unlockLevel: 0,  desc: "Review goals, budgets, badges and your room." },
    { id: "shop",       name: "Shopping Centre",       icon: "🛒", unlockLevel: 1,  desc: "Buy items, compare prices, tell needs from wants." },
    { id: "bank",       name: "Bank",                  icon: "🏦", unlockLevel: 2,  desc: "Deposit savings, set goals, learn about interest." },
    { id: "business",   name: "Business District",     icon: "🏭", unlockLevel: 7,  desc: "Start a business, set prices, track profit." },
    { id: "investment", name: "Investment Centre",     icon: "📈", unlockLevel: 8,  desc: "Learn risk, diversify, track simulated returns." },
    { id: "safety",     name: "Digital Safety Centre", icon: "🛡️", unlockLevel: 9,  desc: "Spot scams and stay safe online." },
  ];

  /* ---- Badges (GDD §11) --------------------------------------------------- */
  const BADGES = {
    first_budget:   { id: "first_budget",   name: "First Budget",        icon: "📋", desc: "Complete your first monthly budget." },
    saved_100:      { id: "saved_100",      name: "First 100 Saved",     icon: "💰", desc: "Save a total of AED 100." },
    goal_getter:    { id: "goal_getter",    name: "Goal Getter",         icon: "🎯", desc: "Reach a complete savings goal." },
    safety_first:   { id: "safety_first",   name: "Safety First",        icon: "🚑", desc: "Successfully use an emergency fund." },
    smart_shopper:  { id: "smart_shopper",  name: "Smart Shopper",       icon: "🛍️", desc: "Finish a shopping challenge under budget." },
    sub_manager:    { id: "sub_manager",    name: "Subscription Manager",icon: "🧾", desc: "Cancel an unnecessary recurring payment." },
    beat_inflation: { id: "beat_inflation", name: "Beat Inflation",      icon: "📊", desc: "Reach a goal despite a price increase." },
    first_profit:   { id: "first_profit",   name: "First Profit",        icon: "🍋", desc: "Earn a profit from a business." },
    balanced_inv:   { id: "balanced_inv",   name: "Balanced Investor",   icon: "⚖️", desc: "Create a diversified portfolio." },
    scam_blocker:   { id: "scam_blocker",   name: "Scam Blocker",        icon: "🚫", desc: "Correctly report scam messages." },
    money_master:   { id: "money_master",   name: "MoneyVille Master",   icon: "👑", desc: "Complete all ten levels." },
  };

  /* ---- Levels (GDD §9) ---------------------------------------------------- */
  const LEVELS = [
    /* ================= LEVEL 1 — The First Allowance ==================== */
    {
      id: "lvl-01-allowance", number: 1, title: "The First Allowance",
      concept: "Needs versus wants", building: "home", icon: "🪙", type: "budget",
      objective: "Cover the essentials, then share out the rest and keep a little spare.",
      learningOutcome: [
        "Tell the difference between needs and wants.",
        "Plan money before spending it.",
        "See why spending everything at once causes problems.",
      ],
      feedback: {
        good: "You covered every essential and still set money aside. That is exactly how a budget should feel.",
        tradeoff: "You had fun, but leaving nothing spare made the surprise a squeeze.",
        corrective: "Spending everything early left no room for the surprise. Planning first keeps you safe.",
      },
      xp: 60, badge: "first_budget",
      configs: {
        junior: {
          intro: "You have AED 20 of pocket money this week. Buy your lunch first, then choose one treat and pop a little into savings.",
          objective: "Make sure lunch is paid for and save at least a coin or two.",
          income: 20,
          categories: [
            { id: "lunch",  name: "Lunch",   icon: "🥪", need: true, min: 8, hint: "You need this every school day." },
            { id: "toy",    name: "A toy",   icon: "🧸", need: false, min: 0 },
            { id: "save",   name: "Savings", icon: "🐷", need: false, min: 0, isSaving: true },
          ],
          twist: { name: "Oops — a lost pencil", desc: "You need a new pencil for class. It costs AED 3.", cost: 3 },
        },
        explorer: {
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
          intro: "You now get AED 300 a month (allowance plus a small part-time job) — but you also cover more of your own costs. Transport, phone credit and lunch are all needs.",
          objective: "Cover all three needs, then balance wants, savings and opportunity cost.",
          income: 300,
          categories: [
            { id: "transport", name: "Transport",     icon: "🚌", need: true, min: 50, hint: "Bus pass to get to school." },
            { id: "phone",     name: "Phone credit",  icon: "📱", need: true, min: 30, hint: "Needed to stay reachable." },
            { id: "lunch",     name: "Lunches",       icon: "🍱", need: true, min: 60, hint: "Food for the month." },
            { id: "clothes",   name: "New clothes",   icon: "👕", need: false, min: 0 },
            { id: "streaming", name: "Streaming & fun",icon: "🎬", need: false, min: 0 },
            { id: "save",      name: "Savings",       icon: "🏦", need: false, min: 0, isSaving: true },
          ],
          twist: { name: "Textbook needed", desc: "A set textbook is required this month: AED 45. Every dirham spent on wants was a dirham that couldn't cover it.", cost: 45 },
        },
      },
    },

    /* ================= LEVEL 2 — Saving for Something Big =============== */
    {
      id: "lvl-02-savings-goal", number: 2, title: "Saving for Something Big",
      concept: "Setting and reaching a savings goal", building: "bank", icon: "🚲", type: "savings",
      objective: "Pick a goal and save toward it week by week without going broke.",
      learningOutcome: [
        "Regular saving builds real progress.",
        "Small purchases can delay a bigger goal.",
        "Long-term goals need patience and priority.",
      ],
      feedback: {
        good: "Steady saving paid off — you reached your goal by staying focused week after week.",
        tradeoff: "A tempting buy was fun, but it pushed your main goal back. Every small purchase has a cost.",
        corrective: "Saving too little each week left the goal out of reach. Try setting aside a bit more next time.",
      },
      xp: 70, badge: "goal_getter",
      configs: {
        junior: {
          intro: "Pick one small thing to save for. You get AED 10 each week — save what you can over 3 weeks.",
          objective: "Save up the full price of your chosen item.",
          weeklyIncome: 10, weeks: 3, weeklyExpense: 2, targetPercent: 100,
          goals: [
            { id: "car",   name: "Toy car",       icon: "🚗", price: 18 },
            { id: "book",  name: "Colouring book",icon: "🖍️", price: 15 },
            { id: "ball",  name: "Bouncy ball",   icon: "⚽", price: 12 },
          ],
          twist: { name: "Sticker sale!", desc: "A shiny sticker pack is on sale for AED 5. Buying it slows your saving.", cost: 5 },
        },
        explorer: {
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
          intro: "You're saving for something big over six weeks, earning AED 80 a week but with AED 25 of weekly costs. Choose wisely — the pricier goals need real discipline.",
          objective: "Reach at least 85% of your goal across six weeks.",
          weeklyIncome: 80, weeks: 6, weeklyExpense: 25, targetPercent: 85,
          goals: [
            { id: "laptop",  name: "Laptop",           icon: "💻", price: 480 },
            { id: "phone",   name: "New phone",        icon: "📱", price: 600 },
            { id: "camera",  name: "Camera",           icon: "📷", price: 520 },
            { id: "course",  name: "Online course",    icon: "🎓", price: 350 },
            { id: "concert", name: "Concert + travel", icon: "🎫", price: 400 },
          ],
          twist: { name: "Front-row upgrade", desc: "A better version tempts you for an extra AED 60 now (opportunity cost!). Spending it delays the real goal.", cost: 60 },
        },
      },
    },

    /* ================= LEVEL 3 — The Surprise Expense ================== */
    {
      id: "lvl-03-emergency", number: 3, title: "The Surprise Expense",
      concept: "Emergency funds", building: "bank", icon: "🚑", type: "emergency",
      objective: "Split your money wisely — and keep a safety fund for the unexpected.",
      learningOutcome: [
        "Unexpected expenses happen to everyone.",
        "An emergency fund lets you handle them calmly.",
        "Without one, emergencies eat into your other goals.",
      ],
      feedback: {
        good: "Your safety fund covered the surprise instantly — no goals harmed, no stress.",
        tradeoff: "You handled the surprise, but had to dip into savings because the safety fund was thin.",
        corrective: "With nothing set aside, the surprise forced you to cancel other plans. A safety fund prevents that.",
      },
      xp: 75, badge: "safety_first",
      configs: {
        junior: {
          intro: "You have AED 20 this week. Pay for snacks, have a little fun, save a bit — and maybe keep a coin aside 'just in case'.",
          objective: "Cover your snacks and handle the little surprise.",
          income: 20,
          categories: [
            { id: "snacks", name: "Snacks",     icon: "🍎", need: true, min: 6, hint: "Your food for the week." },
            { id: "fun",    name: "Fun",        icon: "🎈", need: false, min: 0 },
            { id: "save",   name: "Savings",    icon: "🐷", need: false, min: 0, isSaving: true },
            { id: "safety", name: "Just-in-case",icon: "🛟", need: false, min: 0, isSafety: true, hint: "Money for surprises." },
          ],
          twist: { name: "Uh oh!", options: ["Your balloon popped", "You lost a coin", "Your snack got squashed"], cost: 6 },
        },
        explorer: {
          intro: "Everything looks normal this month. But life has surprises. Will you keep some money in a safety fund, just in case?",
          objective: "Cover essentials and resolve the surprise expense.",
          income: 100,
          categories: [
            { id: "essentials", name: "Essentials",  icon: "🥪", need: true, min: 25, hint: "Food, transport and school costs." },
            { id: "fun",        name: "Entertainment",icon: "🎮", need: false, min: 0 },
            { id: "goal",       name: "Savings goal", icon: "🎯", need: false, min: 0, isSaving: true },
            { id: "safety",     name: "Safety fund",  icon: "🛟", need: false, min: 0, isSafety: true, hint: "Money set aside for surprises." },
          ],
          twist: { name: "Unexpected expense", options: ["Your backpack strap snapped", "You lost your bus card", "Your football boots tore"], cost: 30 },
        },
        advanced: {
          intro: "You manage AED 250 this month with real costs to cover. Emergencies get pricier as you get older — how big a safety net will you build?",
          objective: "Cover transport and food, and absorb a large surprise expense.",
          income: 250,
          categories: [
            { id: "transport", name: "Transport",    icon: "🚇", need: true, min: 60, hint: "Getting around all month." },
            { id: "food",      name: "Food",         icon: "🍲", need: true, min: 50, hint: "Meals for the month." },
            { id: "fun",       name: "Entertainment",icon: "🎬", need: false, min: 0 },
            { id: "goal",      name: "Savings goal", icon: "🎯", need: false, min: 0, isSaving: true },
            { id: "safety",    name: "Safety fund",  icon: "🛟", need: false, min: 0, isSafety: true, hint: "The bigger the surprise, the more you'll want here." },
          ],
          twist: { name: "Costly surprise", options: ["Your phone screen cracked", "A dental fee arrived", "Your laptop charger died"], cost: 90 },
        },
      },
    },

    /* ================= LEVEL 4 — Smart Shopper Challenge =============== */
    {
      id: "lvl-04-smart-shopper", number: 4, title: "Smart Shopper Challenge",
      concept: "Price comparison and value for money", building: "shop", icon: "🛍️", type: "shopping",
      objective: "Buy every required item, staying under budget and choosing the best value.",
      learningOutcome: [
        "The cheapest product is not always the best value.",
        "Delivery fees and durability change the real cost.",
        "Compare quality, quantity and hidden charges.",
      ],
      feedback: {
        good: "Smart choices! You balanced price with quality and stayed comfortably under budget.",
        tradeoff: "You saved money up front, but a flimsy pick cost more once it broke. Value beats price.",
        corrective: "Chasing the lowest price led to breakages and hidden fees that pushed you over budget.",
      },
      xp: 80, badge: "smart_shopper",
      configs: {
        junior: {
          intro: "You need two things for school and have AED 20. Pick the option that's good value — cheap things that break aren't a bargain!",
          objective: "Buy both items and stay under AED 20.",
          budget: 20,
          requiredItems: [
            { id: "case", name: "Pencil case", icon: "✏️", options: [
              { store: "QuickShop", price: 5, quality: 2, durability: 1, delivery: 0, note: "Zip looks weak." },
              { store: "GoodBuy",   price: 8, quality: 4, durability: 3, delivery: 0, note: "Sturdy and roomy." },
            ] },
            { id: "bottle", name: "Water bottle", icon: "🧴", options: [
              { store: "QuickShop", price: 6,  quality: 3, durability: 2, delivery: 0, note: "Fine for now." },
              { store: "GoodBuy",   price: 9,  quality: 4, durability: 3, delivery: 0, note: "Leak-proof lid." },
            ] },
          ],
          twist: { name: "The catch", desc: "A very cheap pencil case with a weak zip may break and need replacing." },
        },
        explorer: {
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
          intro: "You're kitting out for a tech project with a AED 200 budget. Weigh price against warranty, durability and delivery — the real cost is more than the sticker price.",
          objective: "Buy all four items and stay under AED 200.",
          budget: 200,
          requiredItems: [
            { id: "headphones", name: "Headphones", icon: "🎧", options: [
              { store: "TechLow",  price: 45, quality: 2, durability: 1, delivery: 0, note: "No warranty, thin cable." },
              { store: "SoundPro", price: 70, quality: 4, durability: 4, delivery: 0, note: "1-year warranty." },
              { store: "MegaTech", price: 62, quality: 3, durability: 2, delivery: 12, note: "Hidden AED 12 delivery." },
            ] },
            { id: "usb", name: "USB drive", icon: "💾", options: [
              { store: "TechLow",  price: 15, quality: 2, durability: 1, delivery: 0, note: "Slow, may corrupt." },
              { store: "SoundPro", price: 22, quality: 4, durability: 4, delivery: 0, note: "Fast and reliable." },
              { store: "MegaTech", price: 18, quality: 3, durability: 2, delivery: 0, note: "Middle of the road." },
            ] },
            { id: "calc", name: "Calculator", icon: "🧮", options: [
              { store: "TechLow",  price: 20, quality: 2, durability: 1, delivery: 0, note: "Buttons stick." },
              { store: "SoundPro", price: 35, quality: 4, durability: 4, delivery: 0, note: "Exam-approved, robust." },
              { store: "MegaTech", price: 28, quality: 3, durability: 3, delivery: 5, note: "AED 5 delivery." },
            ] },
            { id: "case", name: "Laptop sleeve", icon: "💼", options: [
              { store: "TechLow",  price: 25, quality: 2, durability: 1, delivery: 0, note: "Thin padding." },
              { store: "SoundPro", price: 40, quality: 4, durability: 4, delivery: 0, note: "Protective, snug fit." },
              { store: "MegaTech", price: 33, quality: 3, durability: 2, delivery: 8, note: "Hidden AED 8 delivery." },
            ] },
          ],
          twist: { name: "The catch", desc: "Low-durability picks fail and need a AED 20 replacement each, and hidden delivery fees add up fast. Value and warranty matter." },
        },
      },
    },

    /* ================= LEVEL 5 — Subscription Trap ===================== */
    {
      id: "lvl-05-subscriptions", number: 5, title: "Subscription Trap",
      concept: "Recurring expenses and automatic payments", building: "home", icon: "🧾", type: "subscription",
      objective: "Enjoy some services, but finish the month with money still in your wallet.",
      learningOutcome: [
        "Small recurring payments add up fast.",
        "Free trials often need cancelling before they charge.",
        "Review subscriptions regularly.",
      ],
      feedback: {
        good: "You kept only what you'd use and cancelled the rest before renewal. Wallet still healthy!",
        tradeoff: "A couple of forgotten plans renewed. Handy reminder to review subscriptions each month.",
        corrective: "Too many auto-renewals drained your wallet. Trials are only free if you cancel in time.",
      },
      xp: 85, badge: "sub_manager",
      configs: {
        junior: {
          intro: "Three apps are switched on with a free trial. You only get AED 20 this month — keep the ones you'll really use and cancel the rest before they charge.",
          objective: "Finish the month with money left in your wallet.",
          income: 20,
          services: [
            { id: "cartoon", name: "Cartoon streaming", icon: "📺", price: 8, trial: true,  cosmetic: true,  note: "Fun, but AED 8/mo after the trial." },
            { id: "gamepass",name: "Game pass",         icon: "🎮", price: 7, trial: false, cosmetic: true,  note: "AED 7 every month." },
            { id: "reading", name: "Reading app",       icon: "📖", price: 4, trial: false, useful: true,   note: "AED 4/mo — helps your reading." },
          ],
          twist: { name: "Renewal day", desc: "The month ends and every app still switched on charges you." },
        },
        explorer: {
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
          intro: "You manage AED 200 and eight tempting services, some with student or family plans. Auto-renewals are silent — decide what actually earns its place.",
          objective: "Finish the month positive, keeping only what's worth it.",
          income: 200,
          services: [
            { id: "video",   name: "Video streaming",    icon: "🎬", price: 35, trial: true,  cosmetic: true, note: "Trial, then AED 35/mo." },
            { id: "music",   name: "Music (student)",    icon: "🎵", price: 15, trial: true,                  note: "Student plan, AED 15/mo." },
            { id: "gaming",  name: "Gaming membership",  icon: "🎮", price: 30, trial: false, cosmetic: true, note: "AED 30/mo." },
            { id: "cloud",   name: "Cloud storage",      icon: "☁️", price: 12, trial: true,  useful: true,   note: "Trial, then AED 12/mo." },
            { id: "learn",   name: "Study platform",     icon: "📚", price: 25, trial: false, useful: true,   note: "AED 25/mo — boosts grades." },
            { id: "fitness", name: "Fitness app",        icon: "🏋️", price: 20, trial: true,                  note: "Trial, then AED 20/mo." },
            { id: "news",    name: "News+ subscription", icon: "📰", price: 18, trial: false, cosmetic: true, note: "AED 18/mo." },
            { id: "avatar",  name: "Premium cosmetics",  icon: "😎", price: 22, trial: false, cosmetic: true, note: "AED 22/mo — looks only." },
          ],
          twist: { name: "Renewal day", desc: "Every active plan renews — including any trials you didn't cancel. Small monthly fees become a big total." },
        },
      },
    },

    /* ================= LEVEL 6 — Beat Inflation ======================== */
    {
      id: "lvl-06-inflation", number: 6, title: "Beat Inflation",
      concept: "Inflation and purchasing power", building: "bank", icon: "📊", type: "inflation",
      objective: "Buy the item before rising prices put it out of reach.",
      learningOutcome: [
        "Prices can rise over time (inflation).",
        "The same money buys less in the future.",
        "Saving in an account that earns interest helps you keep up.",
      ],
      feedback: {
        good: "You out-saved inflation by depositing money to earn interest and trimming extras. Well judged!",
        tradeoff: "You reached a revised target as prices climbed. Inflation makes waiting expensive.",
        corrective: "Prices rose faster than your savings. Earning interest and cutting extras helps close the gap.",
      },
      xp: 90, badge: "beat_inflation",
      configs: {
        junior: {
          intro: "You want a AED 50 toy. Each month its price creeps up a little. Save your AED 25 and try to buy it before it costs too much!",
          objective: "Buy the toy before the price runs away.",
          startPrice: 50, months: 3, monthlyIncome: 25,
          baseInflation: 0.02, highInflationMonth: 2, highInflationRate: 0.05, savingsInterest: 0.02,
          twist: { name: "Prices went up", desc: "One month the toy's price jumps a bit more than usual." },
        },
        explorer: {
          intro: "You want an item that costs AED 500 today. Over several months its price keeps creeping up. Can your savings keep pace?",
          objective: "Buy the item, or reach the revised target.",
          startPrice: 500, months: 5, monthlyIncome: 130,
          baseInflation: 0.03, highInflationMonth: 3, highInflationRate: 0.09, savingsInterest: 0.02,
          twist: { name: "Inflation spike", desc: "A burst of high inflation makes the item's price jump faster than expected." },
        },
        advanced: {
          intro: "Your target costs AED 1,500 today, and inflation is running hot. You earn AED 320/month — depositing to earn 3% interest is the only way to keep up.",
          objective: "Beat a fast-rising price by saving smart and cutting extras.",
          startPrice: 1500, months: 6, monthlyIncome: 320,
          baseInflation: 0.04, highInflationMonth: 4, highInflationRate: 0.12, savingsInterest: 0.03,
          twist: { name: "Inflation surge", desc: "A high-inflation month sends the price sharply upward. Interest and lower spending matter more than ever." },
        },
      },
    },

    /* ================= LEVEL 7 — Lemonade to Launch ==================== */
    {
      id: "lvl-07-business", number: 7, title: "Lemonade to Launch",
      concept: "Entrepreneurship: costs, revenue and profit", building: "business", icon: "🍋", type: "business",
      objective: "Run your business for several days and reach the target profit without going broke.",
      learningOutcome: [
        "Revenue is not the same as profit.",
        "Businesses have operating costs.",
        "Price affects how many customers buy.",
        "Higher sales don't always mean higher profit.",
      ],
      feedback: {
        good: "Great instincts — you priced to sell, controlled costs and turned a healthy profit.",
        tradeoff: "You made sales, but thin margins and ad spending ate the profit. Watch costs, not just revenue.",
        corrective: "Prices or costs were off and the business lost money. Remember: profit = revenue − costs.",
      },
      xp: 100, badge: "first_profit",
      configs: {
        junior: {
          intro: "Start a tiny stall with AED 20. Choose what to sell, set a fair price, and try to make AED 20 profit over 3 days.",
          objective: "Reach AED 20 profit in 3 days.",
          startingCash: 20, days: 3, targetProfit: 20, adEffectiveness: 0.5,
          businesses: [
            { id: "lemonade", name: "Lemonade stall", icon: "🍋", unitCost: 1, baseDemand: 20 },
            { id: "cookies",  name: "Cookie stand",   icon: "🍪", unitCost: 1, baseDemand: 18 },
            { id: "bracelets",name: "Friendship bands",icon: "🧵", unitCost: 1, baseDemand: 16 },
          ],
          twist: { name: "A friend copies you", desc: "On day 2 a friend sets up a similar stall, so fewer customers come to you. Adjust your price!" },
        },
        explorer: {
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
          intro: "You're launching a real venture with AED 200 of capital over 7 days. Manage price, quality, production and advertising to clear AED 300 profit — and survive a market shift.",
          objective: "Reach AED 300 profit in 7 days without running out of cash.",
          startingCash: 200, days: 7, targetProfit: 300, adEffectiveness: 0.55,
          businesses: [
            { id: "coffee",  name: "Coffee cart",     icon: "☕", unitCost: 5, baseDemand: 40 },
            { id: "print",   name: "Print shop",      icon: "🖨️", unitCost: 4, baseDemand: 34 },
            { id: "tutoring",name: "Tutoring service",icon: "📐", unitCost: 2, baseDemand: 22 },
            { id: "craft",   name: "Craft store",     icon: "🎁", unitCost: 6, baseDemand: 30 },
            { id: "app",     name: "Digital app",     icon: "📱", unitCost: 2, baseDemand: 20 },
          ],
          twist: { name: "Market shift", desc: "Around day 3 a competitor and a demand dip hit at once. Reinvest, re-price, and protect your margin." },
        },
      },
    },

    /* ================= LEVEL 8 — Risk and Reward ======================= */
    {
      id: "lvl-08-investment", number: 8, title: "Risk and Reward",
      concept: "Investment risk, return and diversification", building: "investment", icon: "📈", type: "investment",
      objective: "Spread your money across fictional options and ride out several simulated months.",
      learningOutcome: [
        "Higher returns usually mean higher risk.",
        "Investments rise and fall — no return is guaranteed.",
        "Diversifying reduces the damage from any one loss.",
      ],
      feedback: {
        good: "A well-diversified mix rode out the shock and grew steadily. That's smart, calm investing.",
        tradeoff: "You made some gains, but concentrating in risky assets made the ride bumpy.",
        corrective: "Putting most money into one risky bet meant the crash hurt a lot. Diversifying spreads the risk.",
      },
      xp: 110, badge: "balanced_inv",
      configs: {
        junior: {
          intro: "Here's AED 100 of pretend money. Spread it across three options — a safe piggy bank, a steady bond, and a mixed fund — then watch four months pass.",
          objective: "Spread your money out and finish the period.",
          capital: 100, months: 4, crashMagnitude: -0.15,
          assets: [
            { id: "piggy", name: "Piggy bank",  icon: "🐷", risk: "Very low", meanReturn: 0.01, volatility: 0.00 },
            { id: "bond",  name: "Savings bond",icon: "📜", risk: "Low",      meanReturn: 0.02, volatility: 0.015 },
            { id: "fund",  name: "Mixed fund",  icon: "🧺", risk: "Medium",   meanReturn: 0.035, volatility: 0.05, crashProne: true },
          ],
          twist: { name: "A little dip", desc: "The mixed fund dips one month. If you spread your money, you barely feel it." },
        },
        explorer: {
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
          intro: "You control AED 1,500 across seven fictional assets over eight months. Chase the high-return bets and a crash could wipe out your gains — diversification is your shield.",
          objective: "Build a genuinely diversified portfolio and survive the shock.",
          capital: 1500, months: 8, crashMagnitude: -0.4,
          assets: [
            { id: "savings", name: "Savings account", icon: "🏦", risk: "Very low", meanReturn: 0.01, volatility: 0.00 },
            { id: "bond",    name: "Government bond",  icon: "📜", risk: "Low",      meanReturn: 0.02, volatility: 0.02 },
            { id: "index",   name: "Index fund",      icon: "📊", risk: "Medium",   meanReturn: 0.045, volatility: 0.06 },
            { id: "fund",    name: "Diversified fund", icon: "🧺", risk: "Medium",   meanReturn: 0.04, volatility: 0.05 },
            { id: "share",   name: "Single company",   icon: "🏢", risk: "High",     meanReturn: 0.06, volatility: 0.16, crashProne: true },
            { id: "trend",   name: "Trend asset",     icon: "🎢", risk: "Very high", meanReturn: 0.09, volatility: 0.30, crashProne: true },
            { id: "startup", name: "Startup bet",     icon: "🚀", risk: "Very high", meanReturn: 0.10, volatility: 0.34, crashProne: true },
          ],
          twist: { name: "Major correction", desc: "The riskiest assets crash together mid-way. Concentrated bets take heavy damage; a spread portfolio holds up." },
        },
      },
    },

    /* ================= LEVEL 9 — Scam Detective ======================== */
    {
      id: "lvl-09-scam", number: 9, title: "Scam Detective",
      concept: "Fraud awareness and online safety", building: "safety", icon: "🕵️", type: "scam",
      objective: "Sort genuine messages from scams. Report the fakes and keep the real ones.",
      learningOutcome: [
        "Never share passwords or verification codes.",
        "Urgent, pushy language is a warning sign.",
        "Guaranteed returns and odd links are red flags.",
        "When unsure, check with a trusted adult.",
      ],
      feedback: {
        good: "Sharp eyes! You spotted the scams — including the sneaky ones — and kept the genuine messages.",
        tradeoff: "You caught most scams. Double-check senders and links on the ones you missed.",
        corrective: "A few scams slipped through. Watch for urgency, code requests and odd links, and ask an adult when unsure.",
      },
      xp: 110, badge: "scam_blocker",
      configs: {
        junior: {
          intro: "Your inbox has five messages. Some are real, some are tricks. Keep the real ones and report the tricks!",
          objective: "Correctly sort at least 3 of the 5 messages.",
          requiredCorrect: 3,
          messages: [
            { id: "j1", from: "Toy Club <win@free-toyz.co>", text: "🎁 You WON a free toy! Tap here to claim: free-toyz.co", scam: true, flags: ["Odd link", "Too good to be true"] },
            { id: "j2", from: "Mum", text: "Dinner's ready — come downstairs!", scam: false, flags: [] },
            { id: "j3", from: "Game Helper", text: "Send me your game password and I'll give you free coins!", scam: true, flags: ["Asks for your password", "Free reward trick"] },
            { id: "j4", from: "Teacher Ms Rae", text: "Reminder: bring your reading book tomorrow.", scam: false, flags: [] },
            { id: "j5", from: "Prize Bot", text: "Click NOW or your account closes today!!!", scam: true, flags: ["Urgent threat", "Pressure to act fast"] },
          ],
          twist: { name: "Free stuff isn't free", desc: "Messages that promise free prizes or ask for your password are almost always tricks." },
        },
        explorer: {
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
          intro: "Twelve messages, and the scams are sophisticated — lookalike domains, fake investments, QR codes and a spoofed friend. Inspect senders, links and requests carefully.",
          objective: "Correctly identify at least 8 of the 12 messages.",
          requiredCorrect: 8,
          messages: [
            { id: "a1", from: "IT Support <it@sch00l-helpdesk.net>", text: "Your school login expires in 1 hour. Verify your password at sch00l-helpdesk.net/login", scam: true, flags: ["Lookalike domain (sch00l)", "Password request", "Urgency"] },
            { id: "a2", from: "Bank of MoneyVille", text: "We noticed a new login. If this wasn't you, review activity in our official app.", scam: false, flags: [] },
            { id: "a3", from: "CryptoDoubler", text: "Send AED 100 and receive AED 300 back, guaranteed within 24h. Limited slots!", scam: true, flags: ["Guaranteed return", "Get-rich-quick", "Scarcity pressure"] },
            { id: "a4", from: "Parcel Service", text: "Your parcel is held. Pay a small AED 2 customs fee here: track-parcel.info/pay", scam: true, flags: ["Small-fee bait", "Suspicious link"] },
            { id: "a5", from: "Coach Ahmed", text: "Match moved to Saturday 9am. Reply to confirm you can make it.", scam: false, flags: [] },
            { id: "a6", from: "Remote Jobs", text: "Earn AED 500/day from home! Just pay a AED 50 registration fee to start.", scam: true, flags: ["Upfront fee", "Unrealistic pay"] },
            { id: "a7", from: "Layla (friend)", text: "Lost my phone, this is my new number. Send the group the new link — and lend me AED 80 quick, I'll repay tonight.", scam: true, flags: ["Spoofed identity", "New number", "Urgent money"], twist: true },
            { id: "a8", from: "MoneyVille Support", text: "Your support ticket #4821 was resolved. No action needed.", scam: false, flags: [] },
            { id: "a9", from: "Rewards Centre", text: "Scan this QR to claim your cashback before midnight!", scam: true, flags: ["QR-code scam", "Urgency", "Vague reward"] },
            { id: "a10", from: "Streaming", text: "Your payment failed. Update your card at netfliix-billing.com to avoid cancellation.", scam: true, flags: ["Misspelt domain (netfliix)", "Payment pressure"] },
            { id: "a11", from: "Library", text: "Your reserved book is ready for pickup this week.", scam: false, flags: [] },
            { id: "a12", from: "AI Invest Club", text: "Our AI bot guarantees 20% weekly returns. DM your wallet seed phrase to auto-invest.", scam: true, flags: ["Asks for seed phrase", "Guaranteed return", "AI hype"] },
          ],
          twist: { name: "Sophisticated fakes", desc: "Lookalike domains and a spoofed friend are designed to fool you. Verify the exact sender and never share codes, passwords or seed phrases." },
        },
      },
    },

    /* ================= LEVEL 10 — One Month on Your Own ================ */
    {
      id: "lvl-10-full-month", number: 10, title: "One Month on Your Own",
      concept: "Complete financial planning", building: "home", icon: "🏆", type: "final",
      objective: "Manage a whole month using everything you've learned. Cover essentials and finish strong.",
      learningOutcome: [
        "Bring together budgeting, saving, safety, spending and awareness.",
        "Balance many priorities at once.",
        "Handle surprises without failing on essentials.",
      ],
      feedback: {
        good: "Outstanding! You balanced every priority and handled the surprises without dropping the essentials.",
        tradeoff: "A strong month overall — a couple of areas could be tighter, but you kept the essentials covered.",
        corrective: "The month got away in places. Cover essentials first, then balance goals, safety and extras.",
      },
      xp: 150, badge: "money_master",
      configs: {
        junior: {
          intro: "A whole week on your own! You have AED 40 plus AED 10 saved. Cover your food, have a little fun, save, and keep a bit aside for surprises.",
          objective: "Cover food and handle the little surprises.",
          income: 40, startingSavings: 10,
          categories: [
            { id: "food",   name: "Food",       icon: "🍎", need: true, min: 15, hint: "Your meals — a must." },
            { id: "fun",    name: "Fun",        icon: "🎈", need: false, min: 0 },
            { id: "save",   name: "Savings",    icon: "🐷", need: false, min: 0, isSaving: true },
            { id: "safety", name: "Just-in-case",icon: "🛟", need: false, min: 0, isSafety: true },
          ],
          twists: [
            { name: "Small repair", desc: "Your bag zip breaks — AED 6 to fix.", cost: 6, need: "safety" },
            { name: "Friend's treat", desc: "A friend invites you for a AED 5 ice cream.", cost: 5, optional: true },
            { name: "Prices up", desc: "Snacks cost AED 4 more this week.", cost: 4, need: "food" },
          ],
          titles: [
            { id: "planner", name: "Prepared Planner", icon: "📋", basis: "planning" },
            { id: "saver",   name: "Safety Saver",     icon: "🛟", basis: "safety" },
            { id: "goal",    name: "Goal Getter",      icon: "🎯", basis: "saving" },
            { id: "balanced",name: "Balanced Kid",     icon: "⚖️", basis: "balance" },
          ],
        },
        explorer: {
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
          intro: "A full independent month on AED 400 plus AED 100 saved. Rent, food and transport are all needs. Balance saving, safety, subscriptions and investing — and weather three surprises.",
          objective: "Cover every need and absorb the surprises without failing essentials.",
          income: 400, startingSavings: 100,
          categories: [
            { id: "rent",      name: "Rent share",   icon: "🏠", need: true, min: 100, hint: "Your biggest fixed cost." },
            { id: "food",      name: "Food",         icon: "🍲", need: true, min: 60,  hint: "Meals for the month." },
            { id: "transport", name: "Transport",    icon: "🚇", need: true, min: 40,  hint: "Getting to school/work." },
            { id: "fun",       name: "Entertainment",icon: "🎬", need: false, min: 0 },
            { id: "goal",      name: "Savings goal", icon: "🎯", need: false, min: 0, isSaving: true },
            { id: "safety",    name: "Safety fund",  icon: "🛟", need: false, min: 0, isSafety: true },
            { id: "subs",      name: "Subscriptions",icon: "🧾", need: false, min: 0 },
            { id: "invest",    name: "Investment",   icon: "📈", need: false, min: 0, isGrowth: true },
          ],
          twists: [
            { name: "Emergency repair", desc: "Your laptop needs a AED 60 repair for schoolwork.", cost: 60, need: "safety" },
            { name: "Expensive invite", desc: "Friends plan a AED 50 day out.", cost: 50, optional: true },
            { name: "Rent & prices rise", desc: "Costs climb AED 30 this month.", cost: 30, need: "rent" },
          ],
          titles: [
            { id: "planner",  name: "Prepared Planner",        icon: "📋", basis: "planning" },
            { id: "goal",     name: "Goal Getter",             icon: "🎯", basis: "saving" },
            { id: "shopper",  name: "Smart Spender",           icon: "🛍️", basis: "spending" },
            { id: "saver",    name: "Safety Saver",            icon: "🛟", basis: "safety" },
            { id: "investor", name: "Young Investor",          icon: "📈", basis: "growth" },
            { id: "balanced", name: "Balanced Decision-Maker", icon: "⚖️", basis: "balance" },
          ],
        },
      },
    },
  ];

  global.MV_DATA = { CONFIG, MODES, BUILDINGS, BADGES, LEVELS };
})(window);
