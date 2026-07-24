/* =============================================================================
   MoneyVille — Application Controller
   -----------------------------------------------------------------------------
   Boots the game, owns routing between screens (town map, level runner, badges,
   dashboard, room), renders the persistent header HUD, and wires each level's
   ctx.finish() to scoring, badges and the results screen.
   ============================================================================= */
(function (global) {
  "use strict";

  const D = global.MV_DATA;
  const S = global.MV_STATE;
  const U = global.MV_UI;
  const L = global.MV_LEVELS;
  const { el, money } = U;

  const app = document.getElementById("app");
  let levelStartTime = 0;

  /* ---- Boot --------------------------------------------------------------- */
  function boot() {
    S.load();
    const st = S.get();
    if (!st.profile.name) renderOnboarding();
    else route("town");
  }

  function route(view, arg) {
    U.clear(app);
    app.appendChild(renderHeader());
    const main = el("main", { class: "screen screen-" + view });
    app.appendChild(main);
    ({
      town: renderTown,
      level: renderLevel,
      badges: renderBadges,
      dashboard: renderDashboard,
      room: renderRoom,
    }[view] || renderTown)(main, arg);
    window.scrollTo(0, 0);
  }

  /* ---- Header HUD (GDD §13) ---------------------------------------------- */
  function renderHeader() {
    const st = S.get();
    const mode = S.mode();
    const header = el("header", { class: "app-header" });

    const brand = el("button", { class: "brand", onClick: () => route("town") }, [
      el("span", { class: "brand-mark", text: "🏙️" }),
      el("span", { class: "brand-name" }, [
        el("strong", { text: "MoneyVille" }),
        el("small", { text: "Life on Allowance" }),
      ]),
    ]);

    const xp = U.statPill("⭐", "Money XP", st.stats.moneyXP.toLocaleString(), "hud-xp");
    const done = U.statPill("🏅", "Levels", `${S.levelsCompleted()}/${D.LEVELS.length}`, "hud-lvl");

    const modeSel = el("select", { class: "mode-select", title: "Difficulty mode",
      onChange: (e) => { S.setMode(e.target.value); U.toast(`Switched to ${D.MODES[e.target.value].name} mode`, "info"); route("town"); } },
      Object.values(D.MODES).map((m) => el("option", { value: m.id, selected: m.id === mode.id ? "selected" : null, text: `${m.icon} ${m.name} (${m.ages})` })));

    const nav = el("nav", { class: "app-nav" }, [
      el("button", { class: "nav-btn", title: "Badges", onClick: () => route("badges") }, [el("span", { text: "🏅" }), el("span", { class: "nav-lbl", text: "Badges" })]),
      el("button", { class: "nav-btn", title: "My Room", onClick: () => route("room") }, [el("span", { text: "🛏️" }), el("span", { class: "nav-lbl", text: "Room" })]),
      el("button", { class: "nav-btn", title: "Grown-up dashboard", onClick: () => route("dashboard") }, [el("span", { text: "📊" }), el("span", { class: "nav-lbl", text: "Dashboard" })]),
    ]);

    header.appendChild(brand);
    header.appendChild(el("div", { class: "hud-stats" }, [xp, done]));
    header.appendChild(el("div", { class: "header-right" }, [modeSel, nav,
      el("div", { class: "who", title: st.profile.name }, [el("span", { class: "who-avatar", text: st.profile.avatar }), el("span", { class: "who-name", text: st.profile.name })]),
    ]));
    return header;
  }

  /* ---- Onboarding --------------------------------------------------------- */
  function renderOnboarding() {
    U.clear(app);
    const wrap = el("div", { class: "onboard" });
    const card = el("div", { class: "onboard-card" });
    let name = "", avatar = "🦊", mode = "explorer";

    card.appendChild(el("div", { class: "onboard-logo" }, [
      el("span", { class: "onboard-mark", text: "🏙️" }),
      el("h1", { text: "MoneyVille" }),
      el("p", { class: "onboard-tag", text: "Gamified budgeting & money skills through real-world decisions." }),
    ]));

    const nameInput = el("input", { class: "text-input", type: "text", maxlength: "16", placeholder: "Your name or nickname" });
    nameInput.addEventListener("input", () => (name = nameInput.value.trim()));
    card.appendChild(el("label", { class: "field-label", text: "What should we call you?" }));
    card.appendChild(nameInput);

    card.appendChild(el("label", { class: "field-label", text: "Pick your avatar" }));
    const avatars = ["🦊", "🐼", "🐸", "🐨", "🦁", "🐵", "🦄", "🐙", "🐧", "🐢"];
    const avGrid = el("div", { class: "avatar-grid" });
    avatars.forEach((a) => {
      const b = el("button", { class: "avatar-opt" + (a === avatar ? " sel" : ""), text: a,
        onClick: () => { avatar = a; avGrid.querySelectorAll(".avatar-opt").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); } });
      avGrid.appendChild(b);
    });
    card.appendChild(avGrid);

    card.appendChild(el("label", { class: "field-label", text: "Choose a difficulty (matched to age)" }));
    const modeGrid = el("div", { class: "mode-grid" });
    Object.values(D.MODES).forEach((m) => {
      const b = el("button", { class: "mode-opt" + (m.id === mode ? " sel" : ""),
        onClick: () => { mode = m.id; modeGrid.querySelectorAll(".mode-opt").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); } }, [
        el("div", { class: "mode-opt-icon", text: m.icon }),
        el("div", { class: "mode-opt-name", text: m.name }),
        el("div", { class: "mode-opt-age", text: "Ages " + m.ages }),
        el("div", { class: "mode-opt-blurb", text: m.blurb }),
      ]);
      modeGrid.appendChild(b);
    });
    card.appendChild(modeGrid);

    card.appendChild(el("button", { class: "btn btn-primary btn-lg btn-block", text: "Enter MoneyVille →", onClick: () => {
      if (!name) { U.toast("Type a name to get started.", "warn"); nameInput.focus(); return; }
      S.setProfile({ name, avatar, mode });
      S.selectAvatar(avatar);
      route("town");
    } }));

    wrap.appendChild(card);
    app.appendChild(wrap);
  }

  /* ---- Town map + level path (GDD §5, §10) ------------------------------- */
  function renderTown(main) {
    const st = S.get();

    // Welcome / progress strip.
    const totalStars = D.LEVELS.reduce((a, l) => a + ((st.levels[l.id] && st.levels[l.id].stars) || 0), 0);
    main.appendChild(el("section", { class: "welcome" }, [
      el("div", { class: "welcome-avatar", text: st.profile.avatar }),
      el("div", { class: "welcome-body" }, [
        el("h1", { class: "welcome-title", text: `Welcome back, ${st.profile.name}!` }),
        el("p", { class: "welcome-sub", text: `${S.levelsCompleted()} of ${D.LEVELS.length} levels complete · ${totalStars}/${D.LEVELS.length * 3} ⭐ · ${st.stats.moneyXP} Money XP` }),
      ]),
      el("button", { class: "btn btn-primary", text: nextActionLabel(), onClick: () => {
        const next = firstPlayable();
        if (next) openLevel(next);
      } }),
    ]));

    // Town map of buildings.
    const map = el("section", { class: "town-map" });
    map.appendChild(el("h2", { class: "section-title", text: "🏙️ MoneyVille Town" }));
    const sky = el("div", { class: "town-scene" });
    D.BUILDINGS.forEach((b) => {
      const unlocked = S.isBuildingUnlocked(b.unlockLevel);
      const tile = el("button", { class: "building " + (unlocked ? "unlocked" : "locked"),
        onClick: () => unlocked ? scrollToBuilding(b.id) : U.toast(`${b.name} unlocks at level ${b.unlockLevel}`, "info") }, [
        el("div", { class: "building-icon", text: unlocked ? b.icon : "🔒" }),
        el("div", { class: "building-name", text: b.name }),
        el("div", { class: "building-desc", text: unlocked ? b.desc : `Unlocks at level ${b.unlockLevel}` }),
      ]);
      sky.appendChild(tile);
    });
    map.appendChild(sky);
    main.appendChild(map);

    // Level path.
    const path = el("section", { class: "level-path" });
    path.appendChild(el("h2", { class: "section-title", text: "🗺️ Your money journey" }));
    const list = el("div", { class: "level-list" });
    D.LEVELS.forEach((lvl) => {
      const unlocked = S.isLevelUnlocked(lvl.number);
      const res = st.levels[lvl.id];
      const building = D.BUILDINGS.find((b) => b.id === lvl.building);
      const card = el("div", { class: "level-card " + (unlocked ? (res && res.completed ? "done" : "open") : "locked"),
        id: "lvl-" + lvl.building });
      card.appendChild(el("div", { class: "level-num", text: unlocked ? lvl.number : "🔒" }));
      card.appendChild(el("div", { class: "level-icon", text: lvl.icon }));
      const body = el("div", { class: "level-info" }, [
        el("div", { class: "level-title", text: lvl.title }),
        el("div", { class: "level-concept", text: lvl.concept }),
        el("div", { class: "level-building", text: `${building.icon} ${building.name}` }),
      ]);
      card.appendChild(body);
      const right = el("div", { class: "level-right" });
      if (res && res.stars) right.appendChild(U.stars(res.stars));
      if (unlocked) {
        right.appendChild(el("button", { class: "btn " + (res && res.completed ? "btn-ghost" : "btn-primary"),
          text: res && res.completed ? "Replay" : "Play", onClick: () => openLevel(lvl) }));
      } else {
        right.appendChild(el("span", { class: "level-locked-note", text: "Locked" }));
      }
      card.appendChild(right);
      list.appendChild(card);
    });
    path.appendChild(list);
    main.appendChild(path);

    main.appendChild(el("footer", { class: "town-foot" }, [
      el("span", { text: "Fictional money · learning-focused · safe for classrooms" }),
    ]));
  }

  function nextActionLabel() {
    const n = firstPlayable();
    if (!n) return "All done! 🎉";
    const res = S.levelResult(n.id);
    return res && res.completed ? "Keep going →" : `Play Level ${n.number} →`;
  }
  function firstPlayable() {
    // First not-yet-completed unlocked level, else the last unlocked.
    for (const l of D.LEVELS) {
      if (S.isLevelUnlocked(l.number)) {
        const r = S.levelResult(l.id);
        if (!r || !r.completed) return l;
      }
    }
    return [...D.LEVELS].reverse().find((l) => S.isLevelUnlocked(l.number)) || D.LEVELS[0];
  }
  function scrollToBuilding(buildingId) {
    const node = document.getElementById("lvl-" + buildingId);
    if (node) { node.scrollIntoView({ behavior: "smooth", block: "center" }); node.classList.add("flash"); setTimeout(() => node.classList.remove("flash"), 1200); }
  }

  /* ---- Level runner ------------------------------------------------------- */
  function openLevel(level) { route("level", level); }

  function renderLevel(main, level) {
    if (!level) return route("town");
    const mode = S.mode();
    const hintHtml = mode.hints !== "few"
      ? `<strong>💡 Tip:</strong> ${levelHint(level)}` : null;

    const intro = U.levelIntro(level, () => {
      U.clear(stage);
      levelStartTime = Date.now();
      runGame();
    }, hintHtml);

    const back = el("button", { class: "link-back", text: "← Back to town", onClick: () => route("town") });
    const stage = el("div", { class: "stage" });
    stage.appendChild(intro);
    main.appendChild(back);
    main.appendChild(el("div", { class: "level-shell" }, [
      el("div", { class: "level-heading" }, [
        el("span", { class: "level-heading-num", text: "Level " + level.number }),
        el("h1", { text: level.title }),
      ]),
      stage,
    ]));

    function runGame() {
      const badgesBefore = new Set(Object.keys(S.get().badges));
      const ctx = {
        scale: S.moneyScale(),
        mode,
        awardBadge: (id) => S.awardBadge(id),
        addSavings: (n) => S.addSavings(n),
        dashboard: (kind, value) => S.recordDashboard(kind, value),
        finish: (outcome) => finishLevel(level, outcome, badgesBefore, stage, runGame),
      };
      L.play(stage, level, ctx);
    }
  }

  function finishLevel(level, outcome, badgesBefore, stage, replay) {
    S.addTime(Date.now() - levelStartTime);
    const result = S.completeLevel(level, outcome);
    const st = S.get();
    const newBadges = Object.keys(st.badges).filter((id) => !badgesBefore.has(id));

    U.clear(stage);
    const feedbackText = outcome.feedback ? outcome.feedback : { kind: "good", text: "Well played." };
    outcome.feedback = feedbackText;

    stage.appendChild(U.resultsScreen({
      level, result, outcome,
      onReplay: () => { U.clear(stage); levelStartTime = Date.now(); replay(); },
      onContinue: () => {
        route("town");
        const next = firstPlayable();
        if (outcome.passed && next && next.number === level.number + 1) U.toast(`Level ${next.number} unlocked! 🔓`, "info");
      },
    }));

    if (outcome.passed) U.toast(`+${result.xpEarned} Money XP`, "info");
    if (newBadges.length) U.badgePopup(newBadges);
  }

  function levelHint(level) {
    const hints = {
      budget: "Cover your needs first, then share the rest between wants and savings. Keep a little spare.",
      savings: "Saving a steady amount each week adds up faster than you think.",
      emergency: "Set aside a small safety fund — surprises are cheaper when you're ready.",
      shopping: "The lowest price isn't always the best deal. Watch delivery fees and quality.",
      subscription: "Free trials only stay free if you cancel before they renew.",
      inflation: "Money in a savings account earns interest, helping you keep up with rising prices.",
      business: "Profit is what's left after costs. Selling more isn't always more profit.",
      investment: "Spread your money out. If one investment falls, the others cushion it.",
      scam: "Real companies never ask for your password or verification code.",
      final: "Essentials first, then balance every other goal. Be ready for surprises.",
    };
    return hints[level.type] || level.objective;
  }

  /* ---- Badges gallery (GDD §11) ------------------------------------------ */
  function renderBadges(main) {
    const st = S.get();
    main.appendChild(el("button", { class: "link-back", text: "← Back to town", onClick: () => route("town") }));
    const earned = Object.keys(st.badges).length;
    main.appendChild(el("div", { class: "page-head" }, [
      el("h1", { text: "🏅 Badges" }),
      el("p", { class: "muted", text: `${earned} of ${Object.keys(D.BADGES).length} unlocked` }),
    ]));
    const grid = el("div", { class: "badge-grid" });
    Object.values(D.BADGES).forEach((b) => {
      const have = !!st.badges[b.id];
      grid.appendChild(el("div", { class: "badge-card " + (have ? "have" : "locked") }, [
        el("div", { class: "badge-icon", text: have ? b.icon : "🔒" }),
        el("div", { class: "badge-name", text: b.name }),
        el("div", { class: "badge-desc", text: b.desc }),
        have ? el("div", { class: "badge-earned", text: "Earned ✓" }) : null,
      ]));
    });
    main.appendChild(grid);
  }

  /* ---- My Room (cosmetics, GDD §10) -------------------------------------- */
  function renderRoom(main) {
    const st = S.get();
    main.appendChild(el("button", { class: "link-back", text: "← Back to town", onClick: () => route("town") }));
    main.appendChild(el("div", { class: "page-head" }, [el("h1", { text: "🛏️ My Room" }), el("p", { class: "muted", text: "Spend Money XP nothing — cosmetics are free rewards for learning!" })]));

    const room = el("div", { class: "room-preview", style: { background: st.profile.room.wall } });
    room.appendChild(el("div", { class: "room-floor", style: { background: st.profile.room.floor } }));
    room.appendChild(el("div", { class: "room-avatar", text: st.profile.avatar }));
    room.appendChild(el("div", { class: "room-poster", text: "🖼️" }));
    room.appendChild(el("div", { class: "room-plant", text: "🪴" }));
    main.appendChild(room);

    // Avatar picker (all unlocked as free cosmetics)
    main.appendChild(el("h3", { class: "section-h", text: "Avatar" }));
    const avatars = ["🦊", "🐼", "🐸", "🐨", "🦁", "🐵", "🦄", "🐙", "🐧", "🐢"];
    const avGrid = el("div", { class: "avatar-grid" });
    avatars.forEach((a) => {
      const b = el("button", { class: "avatar-opt" + (a === st.profile.avatar ? " sel" : ""), text: a,
        onClick: () => { S.selectAvatar(a); renderRoom(U.clear(main)); } });
      avGrid.appendChild(b);
    });
    main.appendChild(avGrid);

    // Wall & floor colours.
    main.appendChild(el("h3", { class: "section-h", text: "Decorate" }));
    const walls = ["#dff1ff", "#ffe0ef", "#e6ffe0", "#fff4d6", "#efe0ff", "#e0fbff"];
    const floors = ["#ffe8c7", "#f5d7b0", "#d9c2a3", "#e8e8e8", "#ffd9d9", "#d6f0d0"];
    const colourRow = (label, list, key) => {
      const row = el("div", { class: "colour-row" }, [el("span", { class: "colour-label", text: label })]);
      list.forEach((c) => row.appendChild(el("button", { class: "swatch" + (st.profile.room[key] === c ? " sel" : ""), style: { background: c },
        onClick: () => { const room = Object.assign({}, st.profile.room, { [key]: c }); S.setProfile({ room }); renderRoom(U.clear(main)); } })));
      return row;
    };
    main.appendChild(colourRow("Wall", walls, "wall"));
    main.appendChild(colourRow("Floor", floors, "floor"));
  }

  /* ---- Teacher / Parent dashboard (GDD §16) ------------------------------ */
  function renderDashboard(main) {
    const st = S.get();
    const dash = st.dashboard;
    main.appendChild(el("button", { class: "link-back", text: "← Back to town", onClick: () => route("town") }));
    main.appendChild(el("div", { class: "page-head" }, [
      el("h1", { text: "📊 Grown-up Dashboard" }),
      el("p", { class: "muted", text: "A private summary of learning progress — no chats or personal data." }),
    ]));

    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    const scam = dash.scamAccuracy.length
      ? Math.round(dash.scamAccuracy.reduce((a, b) => a + (b.correct / b.total), 0) / dash.scamAccuracy.length * 100) : null;
    const mins = Math.round(dash.timeSpentMs / 60000);

    const tiles = [
      { icon: "🏅", label: "Levels completed", value: `${S.levelsCompleted()}/${D.LEVELS.length}` },
      { icon: "⭐", label: "Money XP", value: st.stats.moneyXP.toLocaleString() },
      { icon: "⏱️", label: "Time spent", value: mins + " min" },
      { icon: "💰", label: "Total saved (lifetime)", value: money(st.stats.totalSaved) },
      { icon: "📋", label: "Budgeting", value: fmtScore(avg(dash.budgetScores)) },
      { icon: "🎯", label: "Saving behaviour", value: fmtScore(avg(dash.savingScores)) },
      { icon: "🛟", label: "Emergency preparedness", value: fmtScore(avg(dash.safetyScores)) },
      { icon: "🏭", label: "Business understanding", value: fmtScore(avg(dash.businessScores)) },
      { icon: "📈", label: "Investment risk", value: fmtScore(avg(dash.investScores)) },
      { icon: "🛡️", label: "Scam recognition", value: scam == null ? "—" : scam + "%" },
    ];
    const grid = el("div", { class: "dash-grid" });
    tiles.forEach((t) => grid.appendChild(el("div", { class: "dash-tile" }, [
      el("span", { class: "dash-icon", text: t.icon }),
      el("span", { class: "dash-value", text: t.value }),
      el("span", { class: "dash-label", text: t.label }),
    ])));
    main.appendChild(grid);

    // Topics needing practice.
    const topics = [];
    const check = (label, v) => { if (v != null && v < 60) topics.push(label); };
    check("Budgeting", avg(dash.budgetScores));
    check("Saving", avg(dash.savingScores));
    check("Emergency funds", avg(dash.safetyScores));
    check("Business", avg(dash.businessScores));
    check("Investing", avg(dash.investScores));
    check("Scam awareness", scam);
    main.appendChild(el("div", { class: "dash-practice" }, [
      el("h3", { text: "🎓 Topics that could use more practice" }),
      topics.length
        ? el("ul", {}, topics.map((t) => el("li", { text: t })))
        : el("p", { class: "muted", text: "Nothing flagged yet — keep playing to build a picture." }),
    ]));

    // Teacher features: classroom join code + settings.
    const classCode = st.profile.classCode || genClassCode();
    if (!st.profile.classCode) S.setProfile({ classCode });
    main.appendChild(el("div", { class: "dash-teacher" }, [
      el("h3", { text: "👩‍🏫 Classroom" }),
      el("div", { class: "class-code" }, [
        el("span", { class: "muted", text: "Classroom join code:" }),
        el("code", { class: "code-chip", text: classCode }),
        el("button", { class: "btn btn-ghost btn-sm", text: "New code", onClick: () => { S.setProfile({ classCode: genClassCode() }); renderDashboard(U.clear(main)); } }),
      ]),
      el("p", { class: "muted small", text: "Share this code so a class can join. Leaderboards focus on learning (Money XP, levels, improvement) — never on total wealth, and there is no player-to-player messaging." }),
    ]));

    // Data controls.
    main.appendChild(el("div", { class: "dash-data" }, [
      el("h3", { text: "⚙️ Data" }),
      el("p", { class: "muted small", text: "Progress is saved locally on this device." }),
      el("button", { class: "btn btn-danger btn-sm", text: "Reset all progress", onClick: () => {
        const box = el("div", {}, [
          el("h3", { text: "Reset everything?" }),
          el("p", { text: "This clears all levels, badges and settings on this device. This cannot be undone." }),
          el("div", { class: "modal-actions" }, [
            el("button", { class: "btn btn-ghost", text: "Cancel", onClick: () => m.close() }),
            el("button", { class: "btn btn-danger", text: "Yes, reset", onClick: () => { m.close(); S.reset(); renderOnboarding(); } }),
          ]),
        ]);
        const m = U.modal(box);
      } }),
    ]));
  }

  function fmtScore(v) { return v == null ? "—" : v + "%"; }
  function genClassCode() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s.slice(0, 3) + "-" + s.slice(3);
  }

  /* ---- Go --------------------------------------------------------------- */
  global.MoneyVille = { boot, route };
  document.addEventListener("DOMContentLoaded", boot);
})(window);
