/* =============================================================================
   MoneyVille — Level Mini-Games
   -----------------------------------------------------------------------------
   One renderer per level type. Each receives (mount, level, ctx) where:
     ctx.scale     -> money multiplier for the active difficulty mode
     ctx.mode      -> active mode object (hints level etc.)
     ctx.finish(outcome) -> records the result and shows the results screen
     ctx.addSavings(n)   -> credit lifetime savings (for badges)
     ctx.dashboard(kind, value) -> record a learning signal
   `outcome` = { passed, percent, categories:{name:{value,max}}, feedback:{kind,text}, title? }
   ============================================================================= */
(function (global) {
  "use strict";

  const U = global.MV_UI;
  const { el, money, pct, progressBar, feedbackCard } = U;

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const randn = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2; // ~N(0,~0.29)

  /* Aggregate allocator values by category flag so scoring works for ANY
     category set (each difficulty mode defines its own categories). */
  function aggregate(cats, values, S) {
    const a = { needTotal: 0, needMin: 0, savingTotal: 0, safetyTotal: 0, growthTotal: 0, wantTotal: 0 };
    cats.forEach((c) => {
      const v = values[c.id] || 0;
      if (c.need) { a.needTotal += v; a.needMin += S(c.min || 0); }
      else if (c.isSaving) a.savingTotal += v;
      else if (c.isSafety) a.safetyTotal += v;
      else if (c.isGrowth) a.growthTotal += v;
      else a.wantTotal += v;
    });
    return a;
  }

  /* ---- Shared: money allocator widget ------------------------------------
     Renders a pool + category steppers; keeps a running "remaining". Returns
     an API to read values and subscribe to changes. --------------------------*/
  function allocator(income, categories, scale, opts = {}) {
    const S = (n) => Math.round(n * scale);
    const step = opts.step || Math.max(5, Math.round((income) / 20)) ;
    const values = {};
    categories.forEach((c) => (values[c.id] = 0));

    const remainingEl = el("span", { class: "alloc-remaining-num" });
    const wrap = el("div", { class: "alloc" });
    const rows = el("div", { class: "alloc-rows" });
    const changeCbs = [];

    function remaining() {
      const used = Object.values(values).reduce((a, b) => a + b, 0);
      return income - used;
    }
    function refresh() {
      remainingEl.textContent = money(remaining());
      remainingEl.parentElement.classList.toggle("low", remaining() <= 0);
      rows.querySelectorAll(".alloc-row").forEach((r) => {
        const id = r.dataset.cat;
        r.querySelector(".alloc-val").textContent = money(values[id]);
      });
      changeCbs.forEach((fn) => fn(values, remaining()));
    }

    categories.forEach((c) => {
      const badge = c.need
        ? el("span", { class: "tag tag-need", text: "Need" })
        : el("span", { class: "tag tag-want", text: c.isSaving ? "Save" : c.isSafety ? "Safety" : c.isGrowth ? "Grow" : "Want" });
      const hint = (c.hint && opts.hints !== "none")
        ? el("div", { class: "alloc-hint", text: c.hint }) : null;
      const minNote = c.need && c.min ? el("div", { class: "alloc-min", text: `Needs at least ${money(S(c.min))}` }) : null;

      const valEl = el("span", { class: "alloc-val", text: money(0) });
      const dec = el("button", { class: "step-btn", text: "−", "aria-label": `Less ${c.name}` });
      const inc = el("button", { class: "step-btn", text: "+", "aria-label": `More ${c.name}` });
      dec.addEventListener("click", () => { values[c.id] = Math.max(0, values[c.id] - step); refresh(); });
      inc.addEventListener("click", () => { if (remaining() >= step) { values[c.id] += step; refresh(); } else if (remaining() > 0) { values[c.id] += remaining(); refresh(); } });

      rows.appendChild(el("div", { class: "alloc-row", dataset: { cat: c.id } }, [
        el("div", { class: "alloc-icon", text: c.icon }),
        el("div", { class: "alloc-main" }, [
          el("div", { class: "alloc-name-row" }, [el("span", { class: "alloc-name", text: c.name }), badge]),
          hint, minNote,
        ]),
        el("div", { class: "alloc-ctrl" }, [dec, valEl, inc]),
      ]));
    });

    wrap.appendChild(el("div", { class: "alloc-pool" }, [
      el("span", { class: "alloc-pool-label", text: "💵 Left to allocate" }),
      el("span", { class: "alloc-remaining" }, [remainingEl]),
    ]));
    wrap.appendChild(rows);
    // store S for min scaling in caller
    refresh();
    return {
      node: wrap,
      values,
      remaining,
      onChange: (fn) => { changeCbs.push(fn); fn(values, remaining()); },
      step,
    };
  }

  function primaryBtn(text, onClick, cls = "") {
    return el("button", { class: `btn btn-primary btn-lg ${cls}`, text, onClick });
  }

  /* =========================================================================
     LEVEL 1 — Budget allocation (needs vs wants)
     ========================================================================= */
  function playBudget(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const income = S(cfg.income);
    const cats = cfg.categories;

    const host = el("div", { class: "level-body" });
    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("💵", "Allowance", money(income), "wallet"),
      U.statPill("🎯", "Goal", level.concept, "concept"),
    ]));

    const alloc = allocator(income, cats, ctx.scale, { hints: ctx.mode.hints === "few" ? "none" : "some" });
    host.appendChild(alloc.node);

    const submit = primaryBtn("Finish the month →", () => {
      const v = alloc.values;
      const agg = aggregate(cats, v, S);
      const savings = agg.savingTotal;
      const leftover = alloc.remaining();

      // Twist: surprise essential item.
      const twistCost = S(cfg.twist.cost);
      let paidFromLeftover = Math.min(leftover, twistCost);
      let stillOwed = twistCost - paidFromLeftover;
      let paidFromSavings = Math.min(savings, stillOwed);
      stillOwed -= paidFromSavings;
      const savingsAfter = savings - paidFromSavings;
      const needMin = agg.needMin;

      const needsCovered = agg.needTotal >= needMin && stillOwed <= 0;
      ctx.addSavings(savingsAfter);

      // Scoring categories (flag-based).
      const planning = clamp((needMin > 0 ? agg.needTotal / needMin : 1) * (stillOwed <= 0 ? 1 : 0.4), 0, 1);
      const saving = clamp(savingsAfter / (income * 0.25), 0, 1);
      const smart = clamp(1 - (agg.wantTotal / income), 0, 1) * 0.7 + 0.3;
      const safety = clamp((leftover) / (income * 0.15), 0, 1);
      const percent = Math.round(((planning * 0.4 + saving * 0.25 + smart * 0.2 + safety * 0.15)) * 100);

      const feedback = needsCovered
        ? (savingsAfter > 0 ? { kind: "good", text: level.feedback.good } : { kind: "tradeoff", text: level.feedback.tradeoff })
        : { kind: "corrective", text: level.feedback.corrective };

      ctx.dashboard("budget", percent);

      const twistNode = el("div", { class: "twist-card" }, [
        el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: cfg.twist.name })]),
        el("p", { text: cfg.twist.desc }),
        el("div", { class: "twist-outcome " + (stillOwed <= 0 ? "ok" : "bad") },
          stillOwed <= 0
            ? [el("span", { text: "✅ " }), `Covered from your ${paidFromSavings > 0 ? "savings and " : ""}spare money.`]
            : [el("span", { text: "⚠️ " }), `You were ${money(stillOwed)} short — the essential wasn't fully covered.`]),
      ]);

      ctx.finish({ passed: needsCovered, percent, feedback,
        categories: {
          Planning: { value: Math.round(planning * 100), max: 100 },
          Saving: { value: Math.round(saving * 100), max: 100 },
          "Smart Spending": { value: Math.round(smart * 100), max: 100 },
          Safety: { value: Math.round(safety * 100), max: 100 },
        },
        extraNodes: twistNode,
      });
    });
    host.appendChild(el("div", { class: "level-actions" }, [submit]));
    mount.appendChild(host);
  }

  /* =========================================================================
     LEVEL 2 — Savings goal over weeks
     ========================================================================= */
  function playSavings(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const host = el("div", { class: "level-body" });

    // Step 1: choose a goal.
    let goal = null;
    const goalGrid = el("div", { class: "choice-grid" });
    cfg.goals.forEach((g) => {
      const price = S(g.price);
      const card = el("button", { class: "choice-card", onClick: () => start(g) }, [
        el("div", { class: "choice-emoji", text: g.icon }),
        el("div", { class: "choice-name", text: g.name }),
        el("div", { class: "choice-price", text: money(price) }),
      ]);
      goalGrid.appendChild(card);
    });
    host.appendChild(el("h3", { class: "section-h", text: "Choose your savings goal" }));
    host.appendChild(goalGrid);
    mount.appendChild(host);

    function start(g) {
      goal = g;
      const price = S(g.price);
      const weeklyIncome = S(cfg.weeklyIncome);
      const weeklyExpense = S(cfg.weeklyExpense);
      let saved = 0, week = 1, boughtSale = false;

      U.clear(host);
      host.appendChild(el("div", { class: "money-hud" }, [
        U.statPill(g.icon, "Goal", g.name, "concept"),
        U.statPill("🏷️", "Price", money(price), "wallet"),
      ]));

      const tracker = el("div", { class: "goal-tracker" });
      const weekPanel = el("div", { class: "week-panel" });
      host.appendChild(tracker);
      host.appendChild(weekPanel);

      function renderTracker() {
        U.clear(tracker);
        tracker.appendChild(el("div", { class: "goal-tracker-top" }, [
          el("span", { text: `Saved ${money(saved)}` }),
          el("span", { text: `${pct((saved / price) * 100)} of goal` }),
        ]));
        tracker.appendChild(progressBar(saved, price, { class: saved >= price ? "good" : "mid" }));
        const remainingWeeks = cfg.weeks - week + 1;
        tracker.appendChild(el("div", { class: "goal-tracker-note", text:
          saved >= price ? "🎉 Goal reached!" :
          `${money(price - saved)} to go · ${remainingWeeks} week${remainingWeeks === 1 ? "" : "s"} left` }));
      }

      function renderWeek() {
        U.clear(weekPanel);
        if (week > cfg.weeks || saved >= price) return finishLevel();

        weekPanel.appendChild(el("h3", { class: "section-h", text: `Week ${week} of ${cfg.weeks}` }));
        const available = weeklyIncome - weeklyExpense;
        weekPanel.appendChild(el("p", { class: "muted", text:
          `You get ${money(weeklyIncome)} this week. ${money(weeklyExpense)} goes on small everyday costs, leaving ${money(available)} you could save.` }));

        const slider = el("input", { type: "range", min: 0, max: available, value: Math.round(available / 2), step: ctx.scale, class: "slider" });
        const out = el("span", { class: "slider-out", text: money(+slider.value) });
        slider.addEventListener("input", () => (out.textContent = money(+slider.value)));
        weekPanel.appendChild(el("div", { class: "slider-row" }, [
          el("label", { text: "Save this week:" }), slider, out,
        ]));

        // Twist: flash sale on week 2.
        let saleNode = null, saleCheck = null;
        if (week === 2) {
          const saleCost = S(cfg.twist.cost);
          saleCheck = el("input", { type: "checkbox", id: "sale" });
          saleNode = el("div", { class: "sale-card" }, [
            el("div", { class: "sale-head" }, [el("span", { text: "⚡" }), el("strong", { text: cfg.twist.name })]),
            el("p", { text: cfg.twist.desc }),
            el("label", { class: "sale-toggle", for: "sale" }, [saleCheck, el("span", { text: `Buy the gadget for ${money(saleCost)} (comes out of this week's money)` })]),
          ]);
          weekPanel.appendChild(saleNode);
        }

        weekPanel.appendChild(primaryBtn("Save & next week →", () => {
          let toSave = +slider.value;
          if (saleCheck && saleCheck.checked) { boughtSale = true; toSave = Math.max(0, toSave - S(cfg.twist.cost)); }
          saved += toSave;
          week++;
          renderTracker();
          renderWeek();
        }));
      }

      function finishLevel() {
        ctx.addSavings(saved);
        const target = price * (cfg.targetPercent / 100);
        const passed = saved >= target;
        const percent = clamp((saved / price) * 100, 0, 100);
        const feedback = saved >= price
          ? { kind: "good", text: level.feedback.good }
          : boughtSale
            ? { kind: "tradeoff", text: level.feedback.tradeoff }
            : { kind: "corrective", text: level.feedback.corrective };
        ctx.dashboard("saving", Math.round(percent));
        const extra = el("div", { class: "twist-card" }, [
          el("div", { class: "twist-head" }, [el("span", { text: goal.icon }), el("strong", { text: `${goal.name} fund` })]),
          progressBar(saved, price, { class: passed ? "good" : "low" }),
          el("p", { class: "twist-outcome " + (passed ? "ok" : "bad"), text:
            saved >= price ? `You saved the full ${money(price)} — enjoy your ${goal.name.toLowerCase()}!`
            : passed ? `You reached ${pct(percent)} of your goal — almost there!`
            : `You saved ${money(saved)} of ${money(price)}. A little more each week gets you there.` }),
        ]);
        ctx.finish({ passed, percent: Math.round(percent), feedback,
          categories: {
            Saving: { value: Math.round(percent), max: 100 },
            Planning: { value: Math.round(clamp((saved / (weeklyIncome * cfg.weeks)) * 100, 0, 100)), max: 100 },
            "Smart Spending": { value: boughtSale ? 55 : 90, max: 100 },
          }, extraNodes: extra });
      }

      renderTracker();
      renderWeek();
    }
  }

  /* =========================================================================
     LEVEL 3 — Emergency fund
     ========================================================================= */
  function playEmergency(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const income = S(cfg.income);
    const host = el("div", { class: "level-body" });
    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("💵", "This month", money(income), "wallet"),
      U.statPill("🛟", "Tip", "Keep some aside", "concept"),
    ]));
    const alloc = allocator(income, cfg.categories, ctx.scale, { hints: "some" });
    host.appendChild(alloc.node);

    host.appendChild(el("div", { class: "level-actions" }, [primaryBtn("End the month →", () => {
      const v = alloc.values;
      const agg = aggregate(cfg.categories, v, S);
      const essMin = agg.needMin;
      const essentials = agg.needTotal;
      const safety = agg.safetyTotal;
      const goalSave = agg.savingTotal;
      const cost = S(cfg.twist.cost);
      const event = cfg.twist.options[Math.floor(Math.random() * cfg.twist.options.length)];

      // Resolve the surprise.
      let fromSafety = Math.min(safety, cost);
      let owed = cost - fromSafety;
      let fromGoal = Math.min(goalSave, owed);
      owed -= fromGoal;
      const usedFund = fromSafety > 0 && owed <= 0 && fromGoal === 0;
      const resolved = owed <= 0;
      const essentialsCovered = essentials >= essMin;
      const savingsLeft = goalSave - fromGoal;
      ctx.addSavings(savingsLeft);

      const passed = essentialsCovered && resolved;
      const feedback = usedFund && passed
        ? { kind: "good", text: level.feedback.good }
        : resolved ? { kind: "tradeoff", text: level.feedback.tradeoff }
        : { kind: "corrective", text: level.feedback.corrective };
      if (usedFund) ctx.awardBadge && ctx.awardBadge("safety_first");

      const essRatio = essMin > 0 ? essentials / essMin : 1;
      const safetyScore = clamp(safety / cost, 0, 1);
      const percent = Math.round((clamp(essRatio, 0, 1) * 0.4 + safetyScore * 0.35 + (resolved ? 0.25 : 0)) * 100);
      ctx.dashboard("safety", percent);

      const extra = el("div", { class: "twist-card" }, [
        el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: `${event}!` })]),
        el("p", { text: `It costs ${money(cost)} to fix.` }),
        el("div", { class: "twist-outcome " + (resolved ? "ok" : "bad") }, resolved
          ? [`✅ ${usedFund ? "Your safety fund covered it instantly." : "You covered it, but had to dip into savings."}`]
          : [`⚠️ You couldn't fully cover it — ${money(owed)} short.`]),
      ]);

      ctx.finish({ passed, percent, feedback,
        categories: {
          Safety: { value: Math.round(safetyScore * 100), max: 100 },
          Planning: { value: Math.round(clamp(essRatio, 0, 1) * 100), max: 100 },
          Saving: { value: Math.round(clamp(savingsLeft / (income * 0.2), 0, 1) * 100), max: 100 },
        }, extraNodes: extra });
    })]));
    mount.appendChild(host);
  }

  /* =========================================================================
     LEVEL 4 — Smart shopper (price comparison)
     ========================================================================= */
  function playShopping(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const budget = S(cfg.budget);
    const host = el("div", { class: "level-body" });
    const chosen = {}; // itemId -> option index

    const totalEl = el("span", { class: "shop-total-num" });
    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("💳", "Budget", money(budget), "wallet"),
      U.statPill("🧾", "Basket", "—", "concept"),
    ]));

    function fullPrice(opt) { return S(opt.price) + S(opt.delivery); }

    function renderTotals() {
      let total = 0, chosenCount = 0;
      cfg.requiredItems.forEach((it) => {
        if (chosen[it.id] != null) { total += fullPrice(it.options[chosen[it.id]]); chosenCount++; }
      });
      totalEl.textContent = money(total);
      totalEl.parentElement.classList.toggle("over", total > budget);
      host.querySelector(".money-hud").children[1].querySelector(".stat-value").textContent = `${chosenCount}/${cfg.requiredItems.length} items`;
    }

    cfg.requiredItems.forEach((it) => {
      const block = el("div", { class: "shop-item" });
      block.appendChild(el("div", { class: "shop-item-head" }, [
        el("span", { class: "shop-item-icon", text: it.icon }),
        el("span", { class: "shop-item-name", text: it.name }),
      ]));
      const opts = el("div", { class: "shop-options" });
      it.options.forEach((opt, idx) => {
        const price = fullPrice(opt);
        const stars5 = "⭐".repeat(opt.quality);
        const card = el("button", { class: "shop-option", dataset: { item: it.id, idx } }, [
          el("div", { class: "shop-store", text: opt.store }),
          el("div", { class: "shop-price", text: money(price) }),
          el("div", { class: "shop-quality", text: stars5 }),
          opt.delivery ? el("div", { class: "shop-delivery", text: `+${money(S(opt.delivery))} delivery` }) : el("div", { class: "shop-delivery free", text: "Free delivery" }),
          (ctx.mode.hints !== "few") ? el("div", { class: "shop-note", text: opt.note }) : null,
        ]);
        card.addEventListener("click", () => {
          chosen[it.id] = idx;
          opts.querySelectorAll(".shop-option").forEach((c) => c.classList.remove("sel"));
          card.classList.add("sel");
          renderTotals();
        });
        opts.appendChild(card);
      });
      block.appendChild(opts);
      host.appendChild(block);
    });

    host.appendChild(el("div", { class: "shop-total" }, [
      el("span", { text: "Basket total:" }), totalEl,
    ]));

    host.appendChild(el("div", { class: "level-actions" }, [primaryBtn("Checkout →", () => {
      if (Object.keys(chosen).length < cfg.requiredItems.length) {
        U.toast("Pick one option for every item first.", "warn"); return;
      }
      // Twist: cheap/flimsy picks break and cost extra.
      let total = 0, breakage = 0, valueScore = 0, trapAvoided = 0, trapCount = 0;
      cfg.requiredItems.forEach((it) => {
        const opt = it.options[chosen[it.id]];
        total += fullPrice(opt);
        valueScore += opt.quality / (S(opt.price) || 1);
        const isTrap = opt.durability <= 1;
        if (opt.durability <= 1) { breakage += S(20); trapCount++; } else { trapAvoided++; }
        // hidden delivery counts as a trap to notice
        if (opt.delivery > 0 && opt.quality < 4) trapCount++;
      });
      const finalTotal = total + breakage;
      const passed = finalTotal <= budget && Object.keys(chosen).length === cfg.requiredItems.length;
      const underBy = budget - finalTotal;
      const percent = clamp((passed ? 60 : 30) + (underBy / budget) * 60 - (breakage > 0 ? 20 : 0), 0, 100);
      const feedback = breakage === 0 && passed
        ? { kind: "good", text: level.feedback.good }
        : passed ? { kind: "tradeoff", text: level.feedback.tradeoff }
        : { kind: "corrective", text: level.feedback.corrective };
      ctx.dashboard("budget", Math.round(percent));

      const extra = el("div", { class: "twist-card" }, [
        el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: cfg.twist.name })]),
        el("p", { text: cfg.twist.desc }),
        el("div", { class: "receipt" }, [
          el("div", { class: "receipt-row" }, [el("span", { text: "Items total" }), el("span", { text: money(total) })]),
          breakage > 0 ? el("div", { class: "receipt-row bad" }, [el("span", { text: "Breakage / replacement" }), el("span", { text: "+" + money(breakage) })]) : null,
          el("div", { class: "receipt-row total" }, [el("span", { text: "Final cost" }), el("span", { text: money(finalTotal) })]),
          el("div", { class: "receipt-row " + (passed ? "ok" : "bad") }, [
            el("span", { text: passed ? "Under budget by" : "Over budget by" }),
            el("span", { text: money(Math.abs(underBy)) })]),
        ]),
      ]);

      ctx.finish({ passed, percent: Math.round(percent), feedback,
        categories: {
          "Smart Spending": { value: Math.round(clamp(valueScore * 20, 0, 100)), max: 100 },
          Planning: { value: passed ? Math.round(clamp((underBy / budget) * 100 + 50, 0, 100)) : 30, max: 100 },
          Awareness: { value: breakage === 0 ? 95 : 45, max: 100 },
        }, extraNodes: extra });
    })]));
    renderTotals();
    mount.appendChild(host);
  }

  /* =========================================================================
     LEVEL 5 — Subscription trap
     ========================================================================= */
  function playSubscription(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const income = S(cfg.income);
    const host = el("div", { class: "level-body" });
    // All services start "active (trial)"; the player cancels the ones they don't want.
    const active = {};
    cfg.services.forEach((s) => (active[s.id] = true));

    const walletEl = el("span");
    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("💵", "Monthly money", money(income), "wallet"),
      U.statPill("🧾", "If it renews now", "", "concept"),
    ]));
    host.appendChild(el("p", { class: "muted", text: "Everything below is switched on with a free trial. At the end of the month, whatever is still on will charge you. Cancel what you won't really use." }));

    const list = el("div", { class: "sub-list" });
    function renderList() {
      U.clear(list);
      let monthly = 0;
      cfg.services.forEach((s) => {
        const price = S(s.price);
        if (active[s.id]) monthly += price;
        const row = el("div", { class: "sub-row " + (active[s.id] ? "on" : "off") }, [
          el("span", { class: "sub-icon", text: s.icon }),
          el("div", { class: "sub-main" }, [
            el("div", { class: "sub-name", text: s.name }),
            el("div", { class: "sub-note", text: `${money(price)}/mo · ${s.trial ? "free trial active" : "charges monthly"}` }),
          ]),
          el("button", { class: "sub-toggle " + (active[s.id] ? "cancel" : "add"),
            text: active[s.id] ? "Cancel" : "Keep off",
            onClick: () => { active[s.id] = !active[s.id]; renderList(); } }),
        ]);
        list.appendChild(row);
      });
      const projected = income - monthly;
      const conceptPill = host.querySelector(".money-hud").children[1].querySelector(".stat-value");
      conceptPill.textContent = money(monthly) + "/mo";
      conceptPill.parentElement.parentElement.classList.toggle("danger", monthly > income);
    }
    host.appendChild(list);

    host.appendChild(el("div", { class: "level-actions" }, [primaryBtn("End the month (renewal day) →", () => {
      let monthly = 0, kept = 0, cancelled = 0, cancelledCosmetic = false, keptUseful = false;
      cfg.services.forEach((s) => {
        if (active[s.id]) { monthly += S(s.price); kept++; if (s.useful) keptUseful = true; }
        else { cancelled++; if (s.cosmetic) cancelledCosmetic = true; }
      });
      const wallet = income - monthly;
      const passed = wallet >= 0;
      if (cancelled >= 1) ctx.awardBadge && ctx.awardBadge("sub_manager");

      const percent = clamp((passed ? 55 : 20) + (wallet / income) * 45 + (cancelledCosmetic ? 8 : 0), 0, 100);
      const feedback = passed && kept <= 3
        ? { kind: "good", text: level.feedback.good }
        : passed ? { kind: "tradeoff", text: level.feedback.tradeoff }
        : { kind: "corrective", text: level.feedback.corrective };
      ctx.dashboard("budget", Math.round(percent));

      const extra = el("div", { class: "twist-card" }, [
        el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: cfg.twist.name })]),
        el("p", { text: cfg.twist.desc }),
        el("div", { class: "receipt" }, [
          el("div", { class: "receipt-row" }, [el("span", { text: `${kept} active plan${kept === 1 ? "" : "s"} renewed` }), el("span", { text: "−" + money(monthly) })]),
          el("div", { class: "receipt-row total" }, [el("span", { text: "Wallet after renewals" }), el("span", { text: money(wallet) })]),
          el("div", { class: "receipt-row " + (passed ? "ok" : "bad") }, [el("span", { text: passed ? "Still positive 🎉" : "Overdrawn ⚠️" }), el("span", { text: money(wallet) })]),
        ]),
      ]);

      ctx.finish({ passed, percent: Math.round(percent), feedback,
        categories: {
          Planning: { value: Math.round(clamp((wallet / income) * 100, 0, 100)), max: 100 },
          Awareness: { value: cancelled >= 2 ? 90 : cancelled === 1 ? 60 : 25, max: 100 },
          "Smart Spending": { value: kept <= 3 ? 90 : 50, max: 100 },
        }, extraNodes: extra });
    })]));
    renderList();
    mount.appendChild(host);
  }

  /* =========================================================================
     LEVEL 6 — Beat inflation
     ========================================================================= */
  function playInflation(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const host = el("div", { class: "level-body" });

    let month = 1, saved = 0, price = S(cfg.startPrice), bought = false;
    const income = S(cfg.monthlyIncome);
    const priceHistory = [price];

    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("🏷️", "Item price", money(price), "wallet"),
      U.statPill("🏦", "Saved", money(0), "concept"),
    ]));
    const chart = el("div", { class: "infl-chart" });
    const panel = el("div", { class: "infl-panel" });
    host.appendChild(chart);
    host.appendChild(panel);

    function updateHud() {
      const pills = host.querySelectorAll(".money-hud .stat-value");
      pills[0].textContent = money(price);
      pills[1].textContent = money(saved);
    }
    function renderChart() {
      U.clear(chart);
      const maxP = Math.max(...priceHistory, saved) * 1.1;
      chart.appendChild(el("div", { class: "infl-chart-title", text: "Item price over time" }));
      const bars = el("div", { class: "infl-bars" });
      priceHistory.forEach((p, i) => {
        bars.appendChild(el("div", { class: "infl-bar-wrap" }, [
          el("div", { class: "infl-bar", style: { height: (p / maxP * 100) + "%" }, title: money(p) }),
          el("div", { class: "infl-bar-label", text: "M" + (i + 1) }),
        ]));
      });
      chart.appendChild(bars);
    }
    function renderMonth() {
      U.clear(panel);
      if (bought || month > cfg.months) return finish();

      panel.appendChild(el("h3", { class: "section-h", text: `Month ${month} of ${cfg.months}` }));
      panel.appendChild(el("p", { class: "muted", text: `You have ${money(income)} to use this month. Deposit into savings to earn ${pct(cfg.savingsInterest * 100)} interest — or spend it on extras.` }));

      const depSlider = el("input", { type: "range", min: 0, max: income, value: income, step: ctx.scale, class: "slider" });
      const depOut = el("span", { class: "slider-out", text: money(income) });
      depSlider.addEventListener("input", () => (depOut.textContent = money(+depSlider.value)));
      panel.appendChild(el("div", { class: "slider-row" }, [el("label", { text: "Deposit to savings:" }), depSlider, depOut]));

      const canBuy = saved >= price;
      const buyBtn = el("button", { class: "btn " + (canBuy ? "btn-gold" : "btn-ghost"), text: canBuy ? `Buy now for ${money(price)} 🛍️` : `Need ${money(price - saved)} more`, disabled: !canBuy });
      if (canBuy) buyBtn.addEventListener("click", () => { saved -= price; bought = true; updateHud(); finish(); });

      panel.appendChild(el("div", { class: "infl-actions" }, [
        primaryBtn("Save & advance month →", () => {
          const dep = +depSlider.value;
          saved += dep;
          // interest on the whole balance
          saved = Math.round(saved * (1 + cfg.savingsInterest));
          // inflation
          month++;
          const rate = month === cfg.highInflationMonth ? cfg.highInflationRate : cfg.baseInflation;
          price = Math.round(price * (1 + rate));
          priceHistory.push(price);
          updateHud();
          renderChart();
          renderMonth();
        }),
        buyBtn,
      ]));
    }
    function finish() {
      U.clear(panel);
      ctx.addSavings(saved);
      const revisedTarget = price * 0.9;
      const passed = bought || saved >= revisedTarget;
      if (bought) ctx.awardBadge && ctx.awardBadge("beat_inflation");
      const percent = clamp(bought ? 100 : (saved / price) * 100, 0, 100);
      const feedback = bought
        ? { kind: "good", text: level.feedback.good }
        : passed ? { kind: "tradeoff", text: level.feedback.tradeoff }
        : { kind: "corrective", text: level.feedback.corrective };
      ctx.dashboard("saving", Math.round(percent));

      const extra = el("div", { class: "twist-card" }, [
        el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: cfg.twist.name })]),
        el("p", { text: cfg.twist.desc }),
        el("div", { class: "twist-outcome " + (passed ? "ok" : "bad"), text:
          bought ? `You bought the item before prices ran away. Final price paid: ${money(priceHistory[priceHistory.length - 1])}.`
          : passed ? `You reached the revised target as prices climbed to ${money(price)}.`
          : `The price climbed to ${money(price)} and your ${money(saved)} couldn't keep up. Earning interest helps next time.` }),
      ]);
      ctx.finish({ passed, percent: Math.round(percent), feedback,
        categories: {
          Growth: { value: Math.round(clamp(((saved) / (income * cfg.months)) * 100, 0, 100)), max: 100 },
          Planning: { value: bought ? 95 : Math.round(percent), max: 100 },
          "Smart Spending": { value: bought ? 85 : 60, max: 100 },
        }, extraNodes: extra });
    }
    renderChart();
    renderMonth();
    mount.appendChild(host);
  }

  /* =========================================================================
     LEVEL 7 — Business (Lemonade to Launch)
     ========================================================================= */
  function playBusiness(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const host = el("div", { class: "level-body" });

    const bizGrid = el("div", { class: "choice-grid" });
    cfg.businesses.forEach((b) => {
      bizGrid.appendChild(el("button", { class: "choice-card", onClick: () => start(b) }, [
        el("div", { class: "choice-emoji", text: b.icon }),
        el("div", { class: "choice-name", text: b.name }),
        el("div", { class: "choice-price", text: `Cost ${money(S(b.unitCost))}/unit` }),
      ]));
    });
    host.appendChild(el("h3", { class: "section-h", text: "Choose your business" }));
    host.appendChild(bizGrid);
    mount.appendChild(host);

    function start(biz) {
      const unitCost = S(biz.unitCost);
      let cash = S(cfg.startingCash);
      let day = 1, totalProfit = 0, totalSold = 0;
      const log = [];

      U.clear(host);
      host.appendChild(el("div", { class: "money-hud" }, [
        U.statPill(biz.icon, biz.name, "", "concept"),
        U.statPill("💰", "Cash", money(cash), "wallet"),
        U.statPill("📈", "Profit", money(0), "growth"),
      ]));
      const panel = el("div", { class: "biz-panel" });
      const logBox = el("div", { class: "biz-log" });
      host.appendChild(panel);
      host.appendChild(logBox);

      function updateHud() {
        const pills = host.querySelectorAll(".money-hud .stat-value");
        pills[1].textContent = money(cash);
        pills[2].textContent = money(totalProfit);
      }
      function renderLog() {
        U.clear(logBox);
        if (!log.length) return;
        logBox.appendChild(el("h4", { class: "biz-log-h", text: "Daily results" }));
        log.forEach((d) => {
          logBox.appendChild(el("div", { class: "biz-log-row " + (d.profit >= 0 ? "ok" : "bad") }, [
            el("span", { class: "biz-log-day", text: "Day " + d.day }),
            el("span", { text: `${d.sold} sold @ ${money(d.price)}` }),
            el("span", { text: `Rev ${money(d.revenue)}` }),
            el("span", { text: `Cost ${money(d.cost)}` }),
            el("span", { class: "biz-log-profit", text: (d.profit >= 0 ? "+" : "") + money(d.profit) }),
          ]));
        });
      }

      function renderDay() {
        U.clear(panel);
        if (day > cfg.days || cash <= 0) return finish();
        const competition = day >= 3;
        panel.appendChild(el("h3", { class: "section-h", text: `Day ${day} of ${cfg.days}` }));
        if (competition && day === 3) panel.appendChild(el("div", { class: "twist-inline" }, [
          el("span", { text: "⚡ " }), el("strong", { text: cfg.twist.name + ": " }), el("span", { text: cfg.twist.desc }),
        ]));

        const fair = unitCost * 3;
        const costPerUnit = (q) => unitCost * (0.8 + q * 0.2);
        const maxAffordable = (q) => Math.max(1, Math.floor(cash / costPerUnit(q)));
        // Quality selector
        let quality = 2;
        const qWrap = el("div", { class: "biz-quality" });
        [1, 2, 3].forEach((q) => {
          const b = el("button", { class: "qbtn" + (q === 2 ? " sel" : ""), text: ["Basic", "Good", "Premium"][q - 1] });
          b.addEventListener("click", () => {
            quality = q;
            qWrap.querySelectorAll(".qbtn").forEach((x) => x.classList.remove("sel"));
            b.classList.add("sel");
            // Re-cap production to what's affordable at the new quality.
            const cap = maxAffordable(quality);
            prodSlider.max = cap;
            if (+prodSlider.value > cap) prodSlider.value = cap;
            recompute();
          });
          qWrap.appendChild(b);
        });

        const priceSlider = el("input", { type: "range", min: unitCost, max: fair * 2, value: Math.round(fair), step: 1, class: "slider" });
        const prodSlider = el("input", { type: "range", min: 0, max: maxAffordable(quality), value: Math.min(biz.baseDemand, maxAffordable(quality)), step: 1, class: "slider" });
        const adSlider = el("input", { type: "range", min: 0, max: Math.max(5, Math.floor(cash / 4)), value: 0, step: 1, class: "slider" });
        const priceOut = el("span", { class: "slider-out" });
        const prodOut = el("span", { class: "slider-out" });
        const adOut = el("span", { class: "slider-out" });
        const forecast = el("div", { class: "biz-forecast" });

        function estimate(price, produced, ads) {
          const demandFactor = clamp(1.5 - (price / fair) * 0.65, 0.1, 1.7);
          const qualityFactor = 0.65 + quality * 0.18;
          const compFactor = competition ? 0.72 : 1;
          const adBonus = Math.round(Math.sqrt(ads) * cfg.adEffectiveness * 3);
          const wanters = Math.round(biz.baseDemand * demandFactor * qualityFactor * compFactor) + adBonus;
          const sold = Math.min(wanters, produced);
          const revenue = sold * price;
          const cost = produced * unitCost * (0.8 + quality * 0.2) + ads;
          return { wanters, sold, revenue, cost: Math.round(cost), profit: Math.round(revenue - cost) };
        }
        function recompute() {
          const price = +priceSlider.value, produced = +prodSlider.value, ads = +adSlider.value;
          priceOut.textContent = money(price);
          prodOut.textContent = produced + " units";
          adOut.textContent = money(ads);
          const est = estimate(price, produced, ads);
          U.clear(forecast);
          forecast.appendChild(el("div", { class: "biz-forecast-title", text: "📊 Forecast for today" }));
          forecast.appendChild(el("div", { class: "biz-forecast-grid" }, [
            el("div", {}, [el("span", { class: "bf-label", text: "Interested" }), el("span", { class: "bf-val", text: est.wanters })]),
            el("div", {}, [el("span", { class: "bf-label", text: "Likely sold" }), el("span", { class: "bf-val", text: est.sold })]),
            el("div", {}, [el("span", { class: "bf-label", text: "Revenue" }), el("span", { class: "bf-val", text: money(est.revenue) })]),
            el("div", {}, [el("span", { class: "bf-label", text: "Costs" }), el("span", { class: "bf-val", text: money(est.cost) })]),
          ]));
        }
        [priceSlider, prodSlider, adSlider].forEach((s) => s.addEventListener("input", recompute));

        panel.appendChild(el("div", { class: "biz-control" }, [el("label", { text: "Quality" }), qWrap]));
        panel.appendChild(el("div", { class: "slider-row" }, [el("label", { text: "Price / unit" }), priceSlider, priceOut]));
        panel.appendChild(el("div", { class: "slider-row" }, [el("label", { text: "Produce today" }), prodSlider, prodOut]));
        panel.appendChild(el("div", { class: "slider-row" }, [el("label", { text: "Advertising" }), adSlider, adOut]));
        panel.appendChild(forecast);
        panel.appendChild(primaryBtn("Open shop for the day →", () => {
          const price = +priceSlider.value, produced = +prodSlider.value, ads = +adSlider.value;
          const upfront = Math.round(produced * unitCost * (0.8 + quality * 0.2) + ads);
          if (upfront > cash) { U.toast("You can't afford that much production/ads today.", "warn"); return; }
          // realise the day with a little variance
          const est = estimate(price, produced, ads);
          const noise = 1 + randn() * 0.15;
          const sold = clamp(Math.round(est.sold * noise), 0, produced);
          const revenue = sold * price;
          const cost = upfront;
          const profit = revenue - cost;
          cash += profit; totalProfit += profit; totalSold += sold;
          log.push({ day, price, sold, revenue, cost, profit });
          day++;
          updateHud(); renderLog(); renderDay();
        }));
        recompute();
      }

      function finish() {
        U.clear(panel);
        const passed = totalProfit >= S(cfg.targetProfit) && cash > 0;
        if (totalProfit > 0) ctx.awardBadge && ctx.awardBadge("first_profit");
        const percent = clamp((totalProfit / S(cfg.targetProfit)) * 100, 0, 100);
        const feedback = passed
          ? { kind: "good", text: level.feedback.good }
          : totalProfit > 0 ? { kind: "tradeoff", text: level.feedback.tradeoff }
          : { kind: "corrective", text: level.feedback.corrective };
        ctx.dashboard("business", Math.round(percent));
        const extra = el("div", { class: "twist-card" }, [
          el("div", { class: "twist-head" }, [el("span", { text: biz.icon }), el("strong", { text: `${biz.name} — final tally` })]),
          el("div", { class: "receipt" }, [
            el("div", { class: "receipt-row" }, [el("span", { text: "Total sold" }), el("span", { text: totalSold + " units" })]),
            el("div", { class: "receipt-row total" }, [el("span", { text: "Total profit" }), el("span", { text: money(totalProfit) })]),
            el("div", { class: "receipt-row " + (passed ? "ok" : "bad") }, [el("span", { text: "Target" }), el("span", { text: money(S(cfg.targetProfit)) })]),
          ]),
        ]);
        ctx.finish({ passed, percent: Math.round(percent), feedback,
          categories: {
            Growth: { value: Math.round(percent), max: 100 },
            Planning: { value: cash > 0 ? 85 : 30, max: 100 },
            "Smart Spending": { value: totalProfit > 0 ? 80 : 40, max: 100 },
          }, extraNodes: extra });
      }

      updateHud(); renderDay();
    }
  }

  /* =========================================================================
     LEVEL 8 — Investment (risk & reward)
     ========================================================================= */
  function playInvestment(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const capital = S(cfg.capital);
    const host = el("div", { class: "level-body" });

    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("💼", "To invest", money(capital), "wallet"),
      U.statPill("📅", "Period", cfg.months + " months", "concept"),
    ]));
    host.appendChild(el("p", { class: "muted", text: "Split your money across the options. Spreading it out (diversifying) softens the blow if one investment falls." }));

    // allocation via steppers with a shared pool
    const alloc = {};
    cfg.assets.forEach((a) => (alloc[a.id] = 0));
    const step = Math.max(10, Math.round(capital / 20));
    const remainingEl = el("span", { class: "alloc-remaining-num" });
    const remaining = () => capital - Object.values(alloc).reduce((a, b) => a + b, 0);

    const list = el("div", { class: "invest-list" });
    function renderAlloc() {
      U.clear(list);
      cfg.assets.forEach((a) => {
        list.appendChild(el("div", { class: "invest-row" }, [
          el("span", { class: "invest-icon", text: a.icon }),
          el("div", { class: "invest-main" }, [
            el("div", { class: "invest-name", text: a.name }),
            el("div", { class: "invest-meta" }, [
              el("span", { class: "risk risk-" + a.risk.replace(/\s/g, "").toLowerCase(), text: a.risk + " risk" }),
              el("span", { class: "muted", text: `~${pct(a.meanReturn * 100)}/mo` }),
            ]),
          ]),
          el("div", { class: "alloc-ctrl" }, [
            el("button", { class: "step-btn", text: "−", onClick: () => { alloc[a.id] = Math.max(0, alloc[a.id] - step); renderAlloc(); } }),
            el("span", { class: "alloc-val", text: money(alloc[a.id]) }),
            el("button", { class: "step-btn", text: "+", onClick: () => { const r = remaining(); if (r >= step) { alloc[a.id] += step; } else if (r > 0) { alloc[a.id] += r; } renderAlloc(); } }),
          ]),
        ]));
      });
      remainingEl.textContent = money(remaining());
      remainingEl.parentElement.classList.toggle("low", remaining() <= 0);
    }
    host.appendChild(el("div", { class: "alloc-pool" }, [el("span", { class: "alloc-pool-label", text: "💵 Left to invest" }), el("span", { class: "alloc-remaining" }, [remainingEl])]));
    host.appendChild(list);

    host.appendChild(el("div", { class: "level-actions" }, [primaryBtn("Invest & run the market →", () => {
      if (remaining() > 0) { U.toast(`Invest the remaining ${money(remaining())} first.`, "warn"); return; }
      runMarket();
    })]));
    renderAlloc();
    mount.appendChild(host);

    function runMarket() {
      U.clear(host);
      const holdings = Object.assign({}, alloc);
      const invested = Object.entries(alloc).filter(([, v]) => v > 0);
      const diversified = invested.length >= 3 && Math.max(...Object.values(alloc)) <= capital * 0.5;
      const valueHistory = [capital];
      let crashApplied = false;

      host.appendChild(el("div", { class: "money-hud" }, [
        U.statPill("💼", "Portfolio", money(capital), "wallet"),
        U.statPill("📊", "Diversified?", diversified ? "Yes ✅" : "No ⚠️", "concept"),
      ]));
      const chart = el("div", { class: "infl-chart" });
      const eventsBox = el("div", { class: "invest-events" });
      host.appendChild(chart); host.appendChild(eventsBox);

      const goodEvents = ["Strong economic growth 📈", "Rising customer demand 🛍️", "Steady interest rates 🏦"];
      const badEvents = ["A market slowdown 📉", "Rising interest rates ⬆️", "A company stumbles 🏢"];

      function total() { return Object.values(holdings).reduce((a, b) => a + b, 0); }
      function renderChart() {
        U.clear(chart);
        chart.appendChild(el("div", { class: "infl-chart-title", text: "Portfolio value over time" }));
        const maxV = Math.max(...valueHistory) * 1.1;
        const bars = el("div", { class: "infl-bars" });
        valueHistory.forEach((v, i) => {
          const up = i === 0 || v >= valueHistory[i - 1];
          bars.appendChild(el("div", { class: "infl-bar-wrap" }, [
            el("div", { class: "infl-bar " + (up ? "up" : "down"), style: { height: (v / maxV * 100) + "%" }, title: money(v) }),
            el("div", { class: "infl-bar-label", text: i === 0 ? "Start" : "M" + i }),
          ]));
        });
        chart.appendChild(bars);
      }
      renderChart();

      let m = 0;
      function stepMonth() {
        if (m >= cfg.months) return finish();
        m++;
        cfg.assets.forEach((a) => {
          if (holdings[a.id] <= 0) return;
          let r = a.meanReturn + randn() * a.volatility;
          // Twist: crash the crash-prone funded assets around the middle month.
          if (m === Math.ceil(cfg.months / 2) && a.crashProne) {
            r = (cfg.crashMagnitude != null ? cfg.crashMagnitude : -0.35); crashApplied = true;
          }
          holdings[a.id] = Math.max(0, Math.round(holdings[a.id] * (1 + r)));
        });
        valueHistory.push(total());
        const ev = (valueHistory[m] >= valueHistory[m - 1] ? goodEvents : badEvents)[Math.floor(Math.random() * 3)];
        eventsBox.insertBefore(el("div", { class: "invest-event " + (valueHistory[m] >= valueHistory[m - 1] ? "ok" : "bad") }, [
          el("span", { class: "ie-month", text: "Month " + m }), el("span", { text: ev }),
          el("span", { class: "ie-val", text: money(total()) }),
        ]), eventsBox.firstChild);
        host.querySelector(".money-hud .stat-value").textContent = money(total());
        renderChart();
      }

      host.appendChild(el("div", { class: "level-actions" }, [
        (() => { const b = primaryBtn("Advance one month →", () => {
          stepMonth();
          if (m >= cfg.months) { b.disabled = true; setTimeout(finish, 400); }
        }); return b; })(),
      ]));

      function finish() {
        const finalValue = total();
        if (diversified) ctx.awardBadge && ctx.awardBadge("balanced_inv");
        const gainPct = ((finalValue - capital) / capital) * 100;
        const passed = true; // completing the period is the condition; stars reflect quality
        const percent = clamp(50 + gainPct * 1.5 + (diversified ? 20 : 0), 0, 100);
        const feedback = diversified && finalValue >= capital
          ? { kind: "good", text: level.feedback.good }
          : finalValue >= capital ? { kind: "tradeoff", text: level.feedback.tradeoff }
          : { kind: "corrective", text: level.feedback.corrective };
        ctx.dashboard("invest", Math.round(percent));
        const extra = el("div", { class: "twist-card" }, [
          el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: cfg.twist.name })]),
          el("p", { text: cfg.twist.desc }),
          el("div", { class: "receipt" }, [
            el("div", { class: "receipt-row" }, [el("span", { text: "Started with" }), el("span", { text: money(capital) })]),
            el("div", { class: "receipt-row total" }, [el("span", { text: "Ended with" }), el("span", { text: money(finalValue) })]),
            el("div", { class: "receipt-row " + (finalValue >= capital ? "ok" : "bad") }, [el("span", { text: finalValue >= capital ? "Gain" : "Loss" }), el("span", { text: (gainPct >= 0 ? "+" : "") + pct(gainPct) })]),
          ]),
        ]);
        ctx.finish({ passed, percent: Math.round(percent), feedback,
          categories: {
            Growth: { value: Math.round(clamp(50 + gainPct * 2, 0, 100)), max: 100 },
            Awareness: { value: diversified ? 95 : 40, max: 100 },
            Planning: { value: diversified ? 85 : 55, max: 100 },
          }, extraNodes: extra });
      }
    }
  }

  /* =========================================================================
     LEVEL 9 — Scam detective
     ========================================================================= */
  function playScam(mount, level, ctx) {
    const cfg = level.config;
    const host = el("div", { class: "level-body" });
    const answers = {}; // id -> "keep" | "report"

    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("📬", "Inbox", cfg.messages.length + " messages", "concept"),
      U.statPill("🎯", "Goal", `Spot ${cfg.requiredCorrect}+ correctly`, "wallet"),
    ]));
    host.appendChild(el("p", { class: "muted", text: "Read each message. If it looks genuine, keep it. If it smells like a scam, report it. Watch for urgency, requests for codes/passwords, odd links and 'guaranteed' money." }));

    const inbox = el("div", { class: "scam-inbox" });
    cfg.messages.forEach((m) => {
      const card = el("div", { class: "scam-msg", dataset: { id: m.id } }, [
        el("div", { class: "scam-from" }, [el("span", { class: "scam-avatar", text: "✉️" }), el("span", { class: "scam-sender", text: m.from })]),
        el("div", { class: "scam-text", text: m.text }),
        el("div", { class: "scam-actions" }, [
          el("button", { class: "scam-btn keep", text: "✅ Keep", onClick: () => choose(m.id, "keep", card) }),
          el("button", { class: "scam-btn report", text: "🚩 Report scam", onClick: () => choose(m.id, "report", card) }),
        ]),
      ]);
      inbox.appendChild(card);
    });
    host.appendChild(inbox);

    function choose(id, val, card) {
      answers[id] = val;
      card.querySelectorAll(".scam-btn").forEach((b) => b.classList.remove("sel"));
      card.querySelector(val === "keep" ? ".keep" : ".report").classList.add("sel");
      card.classList.add("answered");
    }

    host.appendChild(el("div", { class: "level-actions" }, [primaryBtn("Submit inbox →", () => {
      if (Object.keys(answers).length < cfg.messages.length) { U.toast("Decide on every message first.", "warn"); return; }
      let correct = 0, scamCaught = 0, totalScams = 0;
      cfg.messages.forEach((m) => {
        if (m.scam) totalScams++;
        const right = (m.scam && answers[m.id] === "report") || (!m.scam && answers[m.id] === "keep");
        if (right) { correct++; if (m.scam) scamCaught++; }
        // annotate cards
        const card = inbox.querySelector(`.scam-msg[data-id="${m.id}"]`);
        card.classList.add(right ? "right" : "wrong");
        const verdict = el("div", { class: "scam-verdict " + (right ? "ok" : "bad") }, [
          el("strong", { text: right ? "✔ Correct" : "✘ Not quite" }),
          el("span", { text: m.scam ? " This was a scam." : " This one was genuine." }),
          m.flags && m.flags.length ? el("div", { class: "scam-flags" }, m.flags.map((f) => el("span", { class: "scam-flag", text: "⚠ " + f }))) : null,
        ]);
        card.appendChild(verdict);
        card.querySelectorAll(".scam-btn").forEach((b) => (b.disabled = true));
      });
      const passed = correct >= cfg.requiredCorrect;
      if (scamCaught >= 5) ctx.awardBadge && ctx.awardBadge("scam_blocker");
      const percent = Math.round((correct / cfg.messages.length) * 100);
      const feedback = correct === cfg.messages.length
        ? { kind: "good", text: level.feedback.good }
        : passed ? { kind: "tradeoff", text: level.feedback.tradeoff }
        : { kind: "corrective", text: level.feedback.corrective };
      ctx.dashboard("scam", { correct, total: cfg.messages.length });

      const extra = el("div", { class: "twist-card" }, [
        el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: cfg.twist.name })]),
        el("p", { text: cfg.twist.desc }),
        el("div", { class: "twist-outcome " + (passed ? "ok" : "bad"), text: `You identified ${correct} of ${cfg.messages.length} correctly and caught ${scamCaught} of ${totalScams} scams.` }),
      ]);
      ctx.finish({ passed, percent, feedback,
        categories: {
          Awareness: { value: percent, max: 100 },
          "Scam Detection": { value: Math.round((scamCaught / totalScams) * 100), max: 100 },
        }, extraNodes: extra });
    })]));
    mount.appendChild(host);
  }

  /* =========================================================================
     LEVEL 10 — One month on your own (combines systems)
     ========================================================================= */
  function playFinal(mount, level, ctx) {
    const S = (n) => Math.round(n * ctx.scale);
    const cfg = level.config;
    const income = S(cfg.income) + S(cfg.startingSavings);
    const host = el("div", { class: "level-body" });

    host.appendChild(el("div", { class: "money-hud" }, [
      U.statPill("💵", "Money this month", money(income), "wallet"),
      U.statPill("🏁", "Final challenge", "Balance it all", "concept"),
    ]));
    host.appendChild(el("p", { class: "muted", text: "This is everything at once. Cover your essentials first, then balance saving, safety, subscriptions and investing. Surprises are coming — be ready." }));

    const alloc = allocator(income, cfg.categories, ctx.scale, { hints: ctx.mode.hints === "few" ? "none" : "some" });
    host.appendChild(alloc.node);

    host.appendChild(el("div", { class: "level-actions" }, [primaryBtn("Live the month →", () => {
      const v = alloc.values;
      const agg = aggregate(cfg.categories, v, S);
      const essMin = agg.needMin;
      let essentials = agg.needTotal;
      let safety = agg.safetyTotal;
      const originalSafety = agg.safetyTotal;
      let goal = agg.savingTotal;
      let invest = agg.growthTotal;
      const wants = agg.wantTotal;
      const leftover = alloc.remaining();

      // Apply twists in sequence.
      const twistNodes = [];
      let unresolved = 0;

      // 1) Repair — safety first, then leftover, then goal.
      const repair = S(cfg.twists[0].cost);
      let r = repair;
      const fromSafety = Math.min(safety, r); r -= fromSafety; safety -= fromSafety;
      const fromLeft1 = Math.min(leftover, r); r -= fromLeft1;
      const fromGoal = Math.min(goal, r); r -= fromGoal; goal -= fromGoal;
      if (r > 0) unresolved++;
      twistNodes.push(twist(cfg.twists[0], r <= 0, r <= 0 ? (fromSafety >= repair ? "Your safety fund handled it." : "Covered, but it cost you savings.") : `Short by ${money(r)}.`));

      // 2) Price rise — essentials must absorb it.
      const rise = S(cfg.twists[2].cost);
      const essNeeded = essMin + rise;
      const essCovered = essentials >= essNeeded;
      if (!essCovered) unresolved++;
      twistNodes.push(twist(cfg.twists[2], essCovered, essCovered ? "Essentials still fully covered." : `Essentials fell ${money(essNeeded - essentials)} short.`));

      // 3) Costly invite — optional; declining is smart if money is tight.
      twistNodes.push(twist(cfg.twists[1], true, "Optional — you can skip it with no penalty."));

      // Investment growth (small simulation).
      const growth = Math.round(invest * (0.04 + Math.random() * 0.04));
      const investFinal = invest + growth;
      ctx.addSavings(goal);

      // Determine strongest behaviour for the final title.
      const scores = {
        planning: clamp(essNeeded > 0 ? essentials / essNeeded : 1, 0, 1.2),
        saving: clamp(goal / (income * 0.25), 0, 1.2),
        safety: clamp(repair > 0 ? originalSafety / repair : 1, 0, 1.2),
        spending: clamp(1 - wants / income, 0, 1),
        growth: clamp(invest / (income * 0.2), 0, 1.2),
        balance: 0,
      };
      const spread = [scores.planning, scores.saving, scores.safety, scores.growth].filter((x) => x > 0.3).length;
      scores.balance = spread >= 3 ? 1.1 : 0.4;
      const basisKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
      const title = cfg.titles.find((t) => t.basis === basisKey) || cfg.titles[cfg.titles.length - 1];

      const essScore = clamp(essNeeded > 0 ? essentials / essNeeded : 1, 0, 1);
      const passed = essCovered && unresolved === 0;
      const percent = Math.round((essScore * 0.35 + scores.saving / 1.2 * 0.2 + scores.safety / 1.2 * 0.2 + scores.growth / 1.2 * 0.1 + scores.balance / 1.1 * 0.15) * 100);
      const feedback = passed && spread >= 3
        ? { kind: "good", text: level.feedback.good }
        : passed ? { kind: "tradeoff", text: level.feedback.tradeoff }
        : { kind: "corrective", text: level.feedback.corrective };
      ctx.dashboard("budget", percent);

      const titleNode = el("div", { class: "final-title-card" }, [
        el("div", { class: "final-title-emoji", text: title.icon }),
        el("div", {}, [
          el("div", { class: "final-title-label", text: "Your title" }),
          el("div", { class: "final-title-name", text: title.name }),
        ]),
      ]);

      const twistWrap = el("div", { class: "twist-card" }, [
        el("div", { class: "twist-head" }, [el("span", { text: "⚡" }), el("strong", { text: "Surprises this month" })]),
        ...twistNodes,
        growth > 0 ? el("div", { class: "twist-outcome ok", text: `📈 Your investment grew by ${money(growth)} to ${money(investFinal)}.` }) : null,
      ]);

      ctx.finish({ passed, percent, feedback, title: title.name,
        categories: {
          Planning: { value: Math.round(scores.planning / 1.2 * 100), max: 100 },
          Saving: { value: Math.round(scores.saving / 1.2 * 100), max: 100 },
          Safety: { value: Math.round(scores.safety / 1.2 * 100), max: 100 },
          Growth: { value: Math.round(scores.growth / 1.2 * 100), max: 100 },
          Balance: { value: Math.round(scores.balance / 1.1 * 100), max: 100 },
        }, extraNodes: [titleNode, twistWrap] });
    })]));
    mount.appendChild(host);

    function twist(t, ok, note) {
      return el("div", { class: "final-twist" }, [
        el("div", { class: "final-twist-head", text: `${ok ? "✅" : "⚠️"} ${t.name}` }),
        el("div", { class: "final-twist-desc", text: `${t.desc} ${note}` }),
      ]);
    }
  }

  /* ---- Dispatcher --------------------------------------------------------- */
  const RENDERERS = {
    budget: playBudget,
    savings: playSavings,
    emergency: playEmergency,
    shopping: playShopping,
    subscription: playSubscription,
    inflation: playInflation,
    business: playBusiness,
    investment: playInvestment,
    scam: playScam,
    final: playFinal,
  };

  function play(mount, level, ctx) {
    const fn = RENDERERS[level.type];
    if (!fn) { mount.appendChild(el("p", { text: "This level is coming soon." })); return; }
    fn(mount, level, ctx);
  }

  global.MV_LEVELS = { play };
})(window);
