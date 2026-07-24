/* =============================================================================
   MoneyVille: Life on Allowance — Content Data Layer
   -----------------------------------------------------------------------------
   All scenario content lives here, separate from game logic, so new levels and
   scenarios can be added without touching engine code (see GDD §19 Content
   Management). Each level carries: id, number, concept, learning objective,
   twist, feedback, XP reward, badge reward, and a level-specific `config`
   consumed by its mini-game renderer.
   ============================================================================= */
(function (global) {
  "use strict";

  /* ---- Global config ------------------------------------------------------ */
  const CONFIG = {
    currency: "AED",
    starThresholds: { three: 85, two: 60, one: 0 }, // % of max score
    xpPerStar: 40,
    saveKey: "moneyville.save.v1",
  };

  /* ---- Difficulty modes (GDD §8 Age-Based Difficulty) --------------------- */
  const MODES = {
    junior: {
      id: "junior",
      name: "Junior",
      ages: "8–10",
      blurb: "Smaller amounts, fewer choices, more guidance.",
      moneyScale: 1,
      hints: "full",
      icon: "🐣",
    },
    explorer: {
      id: "explorer",
      name: "Explorer",
      ages: "11–12",
      blurb: "Monthly budgets, subscriptions, simple interest.",
      moneyScale: 2,
      hints: "some",
      icon: "🧭",
    },
    advanced: {
      id: "advanced",
      name: "Advanced",
      ages: "13–14",
      blurb: "Inflation, investment risk, opportunity cost.",
      moneyScale: 3,
      hints: "few",
      icon: "🚀",
    },
  };

  /* ---- Buildings / town map (GDD §5 Game World) --------------------------- */
  const BUILDINGS = [
    { id: "home",       name: "Home",                  icon: "🏠", unlockLevel: 0,  desc: "Review goals, budgets, badges and your room." },
    { id: "shop",       name: "Shopping Centre",       icon: "🛒", unlockLevel: 1,  desc: "Buy items, compare prices, tell needs from wants." },
    { id: "bank",       name: "Bank",                  icon: "🏦", unlockLevel: 2,  desc: "Deposit savings, set goals, learn about interest." },
    { id: "business",   name: "Business District",     icon: "🏭", unlockLevel: 7,  desc: "Start a business, set prices, track profit." },
    { id: "investment", name: "Investment Centre",     icon: "📈", unlockLevel: 8,  desc: "Learn risk, diversify, track simulated returns." },
    { id: "safety",     name: "Digital Safety Centre", icon: "🛡️", unlockLevel: 9,  desc: "Spot scams and stay safe online." },
  ];

  /* ---- Badges (GDD §11 Badge System) -------------------------------------- */
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

  /* ---- Helper to scale money by mode -------------------------------------- */
  // Levels store base (junior) numbers; engine multiplies by mode.moneyScale.

  /* ---- Levels (GDD §9 Level Design) --------------------------------------- */
  const LEVELS = [
    /* ================= LEVEL 1 — The First Allowance ==================== */
    {
      id: "lvl-01-allowance",
      number: 1,
      title: "The First Allowance",
      concept: "Needs versus wants",
      building: "home",
      icon: "🪙",
      type: "budget",
      objective: "Divide your allowance so every essential is covered and something is left over.",
      intro:
        "You just received your first monthly allowance. Decide how to split it between things you need and things you want — and keep a little aside.",
      learningOutcome: [
        "Tell the difference between needs and wants.",
        "Plan money before spending it.",
        "See why spending everything at once causes problems.",
      ],
      config: {
        income: 100,
        categories: [
          { id: "school",        name: "School supplies", icon: "📚", need: true,  min: 20, hint: "You must have these for class." },
          { id: "snacks",        name: "Snacks",          icon: "🍫", need: false, min: 0 },
          { id: "entertainment", name: "Entertainment",   icon: "🎮", need: false, min: 0 },
          { id: "gift",          name: "Birthday gift",   icon: "🎁", need: false, min: 0, hint: "A kind gesture — but optional." },
          { id: "savings",       name: "Savings",         icon: "🏦", need: false, min: 0, isSaving: true },
        ],
        twist: {
          name: "Surprise school item",
          desc: "Your teacher asks everyone to buy a AED 15 workbook before the month ends.",
          cost: 15,
        },
      },
      feedback: {
        good: "You covered every essential and still set money aside. That is exactly how a budget should feel.",
        tradeoff: "You had fun, but leaving nothing spare made the surprise workbook a squeeze.",
        corrective: "Spending the whole allowance early left no room for the school item. Planning first keeps you safe.",
      },
      xp: 60,
      badge: "first_budget",
    },

    /* ================= LEVEL 2 — Saving for Something Big =============== */
    {
      id: "lvl-02-savings-goal",
      number: 2,
      title: "Saving for Something Big",
      concept: "Setting and reaching a savings goal",
      building: "bank",
      icon: "🚲",
      type: "savings",
      objective: "Pick a goal and save toward it over four weeks without going broke.",
      intro:
        "There is something you really want. Choose your goal, then decide how much to set aside each week.",
      learningOutcome: [
        "Regular saving builds real progress.",
        "Small purchases can delay a bigger goal.",
        "Long-term goals need patience and priority.",
      ],
      config: {
        weeklyIncome: 40,
        weeks: 4,
        goals: [
          { id: "bike",   name: "Bicycle",          icon: "🚲", price: 120 },
          { id: "game",   name: "Gaming accessory", icon: "🎮", price: 90 },
          { id: "trip",   name: "School trip",      icon: "🚌", price: 100 },
          { id: "art",    name: "Art kit",          icon: "🎨", price: 70 },
          { id: "sports", name: "Sports equipment", icon: "⚽", price: 110 },
        ],
        weeklyExpense: 10, // unavoidable small weekly costs
        targetPercent: 90, // completion: reach this % of goal
        twist: {
          name: "Flash sale!",
          desc: "A cool gadget you like is on sale for AED 25 — but only this week. Buying it delays your goal.",
          cost: 25,
        },
      },
      feedback: {
        good: "Steady saving paid off — you reached your goal by staying focused week after week.",
        tradeoff: "The flash-sale gadget was fun, but it pushed your main goal back. Every small buy has a cost.",
        corrective: "Saving too little each week left the goal out of reach. Try setting aside a bit more next time.",
      },
      xp: 70,
      badge: "goal_getter",
    },

    /* ================= LEVEL 3 — The Surprise Expense ================== */
    {
      id: "lvl-03-emergency",
      number: 3,
      title: "The Surprise Expense",
      concept: "Emergency funds",
      building: "bank",
      icon: "🚑",
      type: "emergency",
      objective: "Split your money wisely — and keep a safety fund for the unexpected.",
      intro:
        "Everything looks normal this month. But life has surprises. Will you keep some money in a safety fund, just in case?",
      learningOutcome: [
        "Unexpected expenses happen to everyone.",
        "An emergency fund lets you handle them calmly.",
        "Without one, emergencies eat into your other goals.",
      ],
      config: {
        income: 100,
        categories: [
          { id: "essentials",    name: "Essentials",    icon: "🥪", need: true, min: 25, hint: "Food, transport and school costs." },
          { id: "entertainment", name: "Entertainment", icon: "🎮", need: false, min: 0 },
          { id: "goal",          name: "Savings goal",  icon: "🎯", need: false, min: 0, isSaving: true },
          { id: "safety",        name: "Safety fund",   icon: "🛟", need: false, min: 0, isSafety: true, hint: "Money set aside for surprises." },
        ],
        twist: {
          name: "Unexpected expense",
          options: [
            "Your backpack strap snapped",
            "You lost your bus card",
            "Your football boots tore",
          ],
          cost: 30,
        },
      },
      feedback: {
        good: "Your safety fund covered the surprise instantly — no goals harmed, no stress.",
        tradeoff: "You handled the surprise, but had to dip into savings because the safety fund was thin.",
        corrective: "With nothing set aside, the surprise forced you to cancel other plans. A safety fund prevents that.",
      },
      xp: 75,
      badge: "safety_first",
    },

    /* ================= LEVEL 4 — Smart Shopper Challenge =============== */
    {
      id: "lvl-04-smart-shopper",
      number: 4,
      title: "Smart Shopper Challenge",
      concept: "Price comparison and value for money",
      building: "shop",
      icon: "🛍️",
      type: "shopping",
      objective: "Buy every required item, staying under budget and choosing the best value.",
      intro:
        "You need supplies for a school activity. Different stores sell similar things at different prices — but the cheapest is not always the best value.",
      learningOutcome: [
        "The cheapest product is not always the best value.",
        "Delivery fees and durability change the real cost.",
        "Compare quality, quantity and hidden charges.",
      ],
      config: {
        budget: 80,
        requiredItems: [
          {
            id: "notebook",
            name: "Notebook pack",
            icon: "📓",
            options: [
              { store: "QuickMart",  price: 12, quality: 2, durability: 1, delivery: 0, note: "Thin pages, tears easily." },
              { store: "ValueBooks", price: 18, quality: 4, durability: 3, delivery: 0, note: "Solid everyday choice." },
              { store: "PremiumCo",  price: 26, quality: 5, durability: 3, delivery: 4, note: "Great, but AED 4 delivery." },
            ],
          },
          {
            id: "pens",
            name: "Pen set",
            icon: "🖊️",
            options: [
              { store: "QuickMart",  price: 8,  quality: 3, durability: 2, delivery: 0, note: "Fine for a term." },
              { store: "ValueBooks", price: 10, quality: 4, durability: 3, delivery: 0, note: "Smooth and reliable." },
              { store: "BargainBin", price: 5,  quality: 1, durability: 1, delivery: 0, note: "Cheap, but often dries out." },
            ],
          },
          {
            id: "backpack",
            name: "Backpack",
            icon: "🎒",
            options: [
              { store: "QuickMart",  price: 30, quality: 2, durability: 1, delivery: 0, note: "Straps look weak." },
              { store: "ValueBooks", price: 42, quality: 4, durability: 4, delivery: 0, note: "Sturdy, 2-year warranty." },
              { store: "PremiumCo",  price: 38, quality: 3, durability: 2, delivery: 6, note: "Hidden AED 6 delivery fee!" },
            ],
          },
        ],
        twist: {
          name: "The catch",
          desc: "The cheapest backpack's strap breaks — a replacement costs AED 20. Some 'bargains' hide delivery fees.",
        },
      },
      feedback: {
        good: "Smart choices! You balanced price with quality and stayed comfortably under budget.",
        tradeoff: "You saved money up front, but a flimsy pick cost more once it broke. Value beats price.",
        corrective: "Chasing the lowest price led to breakages and hidden fees that pushed you over budget.",
      },
      xp: 80,
      badge: "smart_shopper",
    },

    /* ================= LEVEL 5 — Subscription Trap ===================== */
    {
      id: "lvl-05-subscriptions",
      number: 5,
      title: "Subscription Trap",
      concept: "Recurring expenses and automatic payments",
      building: "home",
      icon: "🧾",
      type: "subscription",
      objective: "Enjoy some services, but finish the month with money still in your wallet.",
      intro:
        "Loads of apps offer free trials. They feel free now — but at month's end, every active plan renews automatically.",
      learningOutcome: [
        "Small recurring payments add up fast.",
        "Free trials often need cancelling before they charge.",
        "Review subscriptions regularly.",
      ],
      config: {
        income: 80,
        services: [
          { id: "video",   name: "Video streaming",   icon: "🎬", price: 20, trial: true,  note: "7-day free trial, then AED 20/mo." },
          { id: "gaming",  name: "Gaming membership", icon: "🎮", price: 15, trial: false, note: "AED 15 every month." },
          { id: "music",   name: "Music subscription",icon: "🎵", price: 12, trial: true,  note: "Free trial, then AED 12/mo." },
          { id: "learn",   name: "Learning app",      icon: "📖", price: 10, trial: false, note: "AED 10/mo — actually useful!" },
          { id: "cloud",   name: "Cloud storage",     icon: "☁️", price: 8,  trial: true,  note: "Trial, then AED 8/mo." },
          { id: "avatar",  name: "Premium avatar",    icon: "😎", price: 18, trial: false, note: "AED 18/mo — pure cosmetic." },
        ],
        twist: {
          name: "Renewal day",
          desc: "The month ends. Every active plan charges you — and free trials you forgot to cancel become paid.",
        },
      },
      feedback: {
        good: "You picked only what you'd use and cancelled the rest before renewal. Wallet still healthy!",
        tradeoff: "A couple of forgotten trials renewed. Handy reminder to review subscriptions each month.",
        corrective: "Too many auto-renewals drained your wallet. Trials are only free if you cancel in time.",
      },
      xp: 85,
      badge: "sub_manager",
    },

    /* ================= LEVEL 6 — Beat Inflation ======================== */
    {
      id: "lvl-06-inflation",
      number: 6,
      title: "Beat Inflation",
      concept: "Inflation and purchasing power",
      building: "bank",
      icon: "📊",
      type: "inflation",
      objective: "Buy the item before rising prices put it out of reach.",
      intro:
        "You want an item that costs AED 500 today. But over the next few months its price keeps creeping up. Can your savings keep pace?",
      learningOutcome: [
        "Prices can rise over time (inflation).",
        "The same money buys less in the future.",
        "Saving in an account that earns interest helps you keep up.",
      ],
      config: {
        startPrice: 500,
        months: 5,
        monthlyIncome: 130,
        baseInflation: 0.03,     // 3% per month
        highInflationMonth: 3,   // spike here
        highInflationRate: 0.09,
        savingsInterest: 0.02,   // deposit earns 2%/mo
        actions: {
          depositReturn: 0.02,
        },
        twist: {
          name: "Inflation spike",
          desc: "A burst of high inflation makes the item's price jump faster than expected.",
        },
      },
      feedback: {
        good: "You out-saved inflation by depositing money to earn interest and trimming extras. Well judged!",
        tradeoff: "You reached a revised target as prices climbed. Inflation makes waiting expensive.",
        corrective: "Prices rose faster than your savings. Earning interest and cutting extras helps close the gap.",
      },
      xp: 90,
      badge: "beat_inflation",
    },

    /* ================= LEVEL 7 — Lemonade to Launch ==================== */
    {
      id: "lvl-07-business",
      number: 7,
      title: "Lemonade to Launch",
      concept: "Entrepreneurship: costs, revenue and profit",
      building: "business",
      icon: "🍋",
      type: "business",
      objective: "Run your stall for several days and reach the target profit without going broke.",
      intro:
        "Time to start a small business! Choose what to sell, set your price and quality, then adjust each day as customers respond.",
      learningOutcome: [
        "Revenue is not the same as profit.",
        "Businesses have operating costs.",
        "Price affects how many customers buy.",
        "Higher sales don't always mean higher profit.",
      ],
      config: {
        startingCash: 60,
        days: 5,
        targetProfit: 80,
        businesses: [
          { id: "lemonade", name: "Lemonade stall",   icon: "🍋", unitCost: 2, baseDemand: 30 },
          { id: "bookmark", name: "Bookmark shop",    icon: "🔖", unitCost: 1, baseDemand: 26 },
          { id: "petwalk",  name: "Pet-walking",      icon: "🐕", unitCost: 1, baseDemand: 18 },
          { id: "stationery", name: "Stationery stall", icon: "✏️", unitCost: 3, baseDemand: 24 },
          { id: "digital",  name: "Digital artwork",  icon: "🖼️", unitCost: 1, baseDemand: 16 },
        ],
        adEffectiveness: 0.5, // extra customers per AED of ads (diminishing)
        twist: {
          name: "New competition",
          desc: "A rival stall opens nearby around day 3, cooling demand. Adjust your price and quality to keep customers.",
        },
      },
      feedback: {
        good: "Great instincts — you priced to sell, controlled costs and turned a healthy profit.",
        tradeoff: "You made sales, but thin margins and ad spending ate the profit. Watch costs, not just revenue.",
        corrective: "Prices or costs were off and the stall lost money. Remember: profit = revenue − costs.",
      },
      xp: 100,
      badge: "first_profit",
    },

    /* ================= LEVEL 8 — Risk and Reward ======================= */
    {
      id: "lvl-08-investment",
      number: 8,
      title: "Risk and Reward",
      concept: "Investment risk, return and diversification",
      building: "investment",
      icon: "📈",
      type: "investment",
      objective: "Spread AED 500 across fictional options and ride out several simulated months.",
      intro:
        "Here is AED 500 of pretend investment money. Divide it between options with different risk levels, then watch the (fictional) market unfold.",
      learningOutcome: [
        "Higher returns usually mean higher risk.",
        "Investments rise and fall — no return is guaranteed.",
        "Diversifying reduces the damage from any one loss.",
      ],
      config: {
        capital: 500,
        months: 6,
        assets: [
          { id: "savings", name: "Savings account",   icon: "🏦", risk: "Very low", meanReturn: 0.01, volatility: 0.00 },
          { id: "bond",    name: "Government bond",    icon: "📜", risk: "Low",      meanReturn: 0.02, volatility: 0.02 },
          { id: "fund",    name: "Diversified fund",   icon: "🧺", risk: "Medium",   meanReturn: 0.04, volatility: 0.06 },
          { id: "share",   name: "Single company",     icon: "🏢", risk: "High",     meanReturn: 0.06, volatility: 0.16 },
          { id: "trend",   name: "High-risk trend",    icon: "🎢", risk: "Very high", meanReturn: 0.08, volatility: 0.30 },
        ],
        twist: {
          name: "Market shock",
          desc: "One high-flying asset suddenly crashes. A diversified portfolio is hurt far less than an all-in bet.",
        },
      },
      feedback: {
        good: "A well-diversified mix rode out the shock and grew steadily. That's smart, calm investing.",
        tradeoff: "You made some gains, but concentrating in risky assets made the ride bumpy.",
        corrective: "Putting most money into one risky bet meant the crash hurt a lot. Diversifying spreads the risk.",
      },
      xp: 110,
      badge: "balanced_inv",
    },

    /* ================= LEVEL 9 — Scam Detective ======================== */
    {
      id: "lvl-09-scam",
      number: 9,
      title: "Scam Detective",
      concept: "Fraud awareness and online safety",
      building: "safety",
      icon: "🕵️",
      type: "scam",
      objective: "Sort genuine messages from scams. Report the fakes and keep the real ones.",
      intro:
        "Your inbox is buzzing. Some messages are real, some are scams trying to trick you. Inspect each one and decide.",
      learningOutcome: [
        "Never share passwords or verification codes.",
        "Urgent, pushy language is a warning sign.",
        "Guaranteed returns and odd links are red flags.",
        "When unsure, check with a trusted adult.",
      ],
      config: {
        requiredCorrect: 6,
        messages: [
          { id: "m1", from: "Prize Team <win@fr3e-phone.co>", text: "🎉 You have WON a free phone! Click http://fr3e-phone.co/claim now before it expires!", scam: true,
            flags: ["Odd sender address", "Too good to be true", "Urgent link"] },
          { id: "m2", from: "MoneyVille Bank", text: "Your monthly statement is ready. Log in through the official app to view it.", scam: false,
            flags: [] },
          { id: "m3", from: "Security <verify@bank-secure-help.net>", text: "Send us your banking verification code to keep your account open.", scam: true,
            flags: ["Asks for a code", "Suspicious address", "Threatens account"] },
          { id: "m4", from: "InvestFast", text: "Invest today and we GUARANTEE you triple your money in a week!", scam: true,
            flags: ["Guaranteed return", "Unrealistic promise"] },
          { id: "m5", from: "School Office", text: "Reminder: the science trip form is due Friday. See the office if you have questions.", scam: false,
            flags: [] },
          { id: "m6", from: "Account Team", text: "URGENT: Your account will close TODAY unless you confirm your password here: bit.ly/xy9", scam: true,
            flags: ["Urgent threat", "Asks for password", "Shortened link"] },
          { id: "m7", from: "Best Friend Sam", text: "Hey it's Sam on a new number — I'm stuck, can you send me AED 50 right now? Don't tell anyone.", scam: true,
            flags: ["Copied identity", "Secrecy", "Urgent money request"], twist: true },
          { id: "m8", from: "Library", text: "Your book 'Money Basics' is due next week. Renew online or at the desk.", scam: false,
            flags: [] },
          { id: "m9", from: "Rewards", text: "Your subscription payment failed — update your card at http://paymnt-update.info to avoid loss.", scam: true,
            flags: ["Misspelt link", "Pressure to pay", "Suspicious address"] },
          { id: "m10", from: "Coach Ahmed", text: "Practice is moved to 5pm tomorrow. Bring your water bottle!", scam: false,
            flags: [] },
        ],
        twist: {
          name: "Copied friend",
          desc: "One scam pretends to be a friend whose account was copied. Real friends don't demand secret, urgent money.",
        },
      },
      feedback: {
        good: "Sharp eyes! You spotted the scams — including the copied friend — and kept the genuine messages.",
        tradeoff: "You caught most scams. Double-check senders and links on the ones you missed.",
        corrective: "A few scams slipped through. Watch for urgency, code requests and odd links, and ask an adult when unsure.",
      },
      xp: 110,
      badge: "scam_blocker",
    },

    /* ================= LEVEL 10 — One Month on Your Own ================ */
    {
      id: "lvl-10-full-month",
      number: 10,
      title: "One Month on Your Own",
      concept: "Complete financial planning",
      building: "home",
      icon: "🏆",
      type: "final",
      objective: "Manage a whole month using everything you've learned. Cover essentials and finish strong.",
      intro:
        "This is the big one. A full month, all systems, fewer hints. Balance needs, savings, safety, subscriptions and a surprise or two.",
      learningOutcome: [
        "Bring together budgeting, saving, safety, spending and awareness.",
        "Balance many priorities at once.",
        "Handle surprises without failing on essentials.",
      ],
      config: {
        income: 160,          // allowance + part-time
        startingSavings: 40,
        categories: [
          { id: "essentials",    name: "Essentials",     icon: "🥪", need: true, min: 40, hint: "Food, transport, school." },
          { id: "entertainment", name: "Entertainment",  icon: "🎮", need: false, min: 0 },
          { id: "goal",          name: "Savings goal",   icon: "🎯", need: false, min: 0, isSaving: true },
          { id: "safety",        name: "Safety fund",    icon: "🛟", need: false, min: 0, isSafety: true },
          { id: "subs",          name: "Subscriptions",  icon: "🧾", need: false, min: 0, hint: "Keep only what you use." },
          { id: "invest",        name: "Investment",     icon: "📈", need: false, min: 0, isGrowth: true },
        ],
        twists: [
          { name: "Unexpected repair", desc: "Your bike needs a AED 25 repair.", cost: 25, need: "safety" },
          { name: "Costly invite",     desc: "A friend invites you to a AED 20 outing.", cost: 20, optional: true },
          { name: "Price rise",        desc: "Essentials cost AED 10 more this month.", cost: 10, need: "essentials" },
        ],
        titles: [
          { id: "planner",  name: "Prepared Planner",       icon: "📋", basis: "planning" },
          { id: "goal",     name: "Goal Getter",            icon: "🎯", basis: "saving" },
          { id: "shopper",  name: "Smart Shopper",          icon: "🛍️", basis: "spending" },
          { id: "saver",    name: "Safety Saver",           icon: "🛟", basis: "safety" },
          { id: "investor", name: "Young Investor",         icon: "📈", basis: "growth" },
          { id: "balanced", name: "Balanced Decision-Maker",icon: "⚖️", basis: "balance" },
        ],
      },
      feedback: {
        good: "Outstanding! You balanced every priority and handled the surprises without dropping the essentials.",
        tradeoff: "A strong month overall — a couple of areas could be tighter, but you kept the essentials covered.",
        corrective: "The month got away in places. Cover essentials first, then balance goals, safety and extras.",
      },
      xp: 150,
      badge: "money_master",
    },
  ];

  global.MV_DATA = { CONFIG, MODES, BUILDINGS, BADGES, LEVELS };
})(window);
