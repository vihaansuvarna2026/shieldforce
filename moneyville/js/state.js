/* =============================================================================
   MoneyVille — Game State, Persistence, Scoring & Progression
   -----------------------------------------------------------------------------
   Holds the player profile, financial indicators (GDD §6), Money XP, badges,
   per-level results and star ratings (GDD §7). Persists to localStorage so
   progress survives reloads. Exposes a small event bus so the UI can react.
   ============================================================================= */
(function (global) {
  "use strict";

  const { CONFIG, MODES, BADGES, LEVELS } = global.MV_DATA;

  const DEFAULT = () => ({
    version: 1,
    profile: {
      name: "",
      avatar: "🦊",
      mode: "explorer",
      room: { wall: "#dff1ff", floor: "#ffe8c7" },
      classCode: "",
      createdAt: Date.now(),
    },
    // Financial indicators (GDD §6). `wallet` carries between levels.
    stats: {
      moneyXP: 0,
      totalSaved: 0,      // lifetime savings deposited (for badges)
    },
    // Per-level results keyed by level id.
    levels: {},           // { [id]: { stars, score, xp, completed, best, categories, title } }
    badges: {},           // { [id]: timestampAwarded }
    cosmetics: { unlocked: ["🦊", "🐼", "🐸"], selected: "🦊" },
    // Aggregate learning signals for the dashboard (GDD §16).
    dashboard: {
      timeSpentMs: 0,
      scamAccuracy: [],   // array of {correct,total}
      budgetScores: [],
      savingScores: [],
      safetyScores: [],
      businessScores: [],
      investScores: [],
      attempts: {},       // { [id]: count }
    },
  });

  let state = DEFAULT();
  const listeners = new Set();

  /* ---- Persistence -------------------------------------------------------- */
  function load() {
    try {
      const raw = localStorage.getItem(CONFIG.saveKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(DEFAULT(), parsed);
        // Deep-ensure nested defaults exist after schema growth.
        const d = DEFAULT();
        state.profile = Object.assign(d.profile, parsed.profile || {});
        state.stats = Object.assign(d.stats, parsed.stats || {});
        state.dashboard = Object.assign(d.dashboard, parsed.dashboard || {});
        state.cosmetics = Object.assign(d.cosmetics, parsed.cosmetics || {});
        state.levels = parsed.levels || {};
        state.badges = parsed.badges || {};
      }
    } catch (e) {
      console.warn("MoneyVille: could not load save, starting fresh.", e);
      state = DEFAULT();
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(CONFIG.saveKey, JSON.stringify(state));
    } catch (e) {
      console.warn("MoneyVille: could not save.", e);
    }
    emit();
  }

  function reset() {
    state = DEFAULT();
    save();
  }

  /* ---- Event bus ---------------------------------------------------------- */
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function emit() { listeners.forEach((fn) => fn(state)); }

  /* ---- Getters ------------------------------------------------------------ */
  const get = () => state;
  const mode = () => MODES[state.profile.mode] || MODES.explorer;
  const moneyScale = () => mode().moneyScale;

  function levelResult(id) { return state.levels[id] || null; }

  function isLevelUnlocked(number) {
    if (number <= 1) return true;
    // Unlock next level once the previous is completed.
    const prev = LEVELS.find((l) => l.number === number - 1);
    return prev ? !!(state.levels[prev.id] && state.levels[prev.id].completed) : false;
  }

  function isBuildingUnlocked(buildingUnlockLevel) {
    if (buildingUnlockLevel <= 1) return true;
    // A building unlocks once the player has reached (unlocked) that level.
    return isLevelUnlocked(buildingUnlockLevel) ||
      LEVELS.some((l) => l.number >= buildingUnlockLevel && state.levels[l.id] && state.levels[l.id].completed);
  }

  function levelsCompleted() {
    return LEVELS.filter((l) => state.levels[l.id] && state.levels[l.id].completed).length;
  }

  /* ---- Profile mutations -------------------------------------------------- */
  function setProfile(patch) { Object.assign(state.profile, patch); save(); }
  function setMode(id) { if (MODES[id]) { state.profile.mode = id; save(); } }
  function selectAvatar(emoji) { state.profile.avatar = emoji; state.cosmetics.selected = emoji; save(); }

  /* ---- Badges ------------------------------------------------------------- */
  function awardBadge(id) {
    if (!id || !BADGES[id] || state.badges[id]) return false;
    state.badges[id] = Date.now();
    return true; // caller decides when to save/announce
  }
  function hasBadge(id) { return !!state.badges[id]; }

  /* ---- Scoring (GDD §7) ---------------------------------------------------
     A level submits `categories`: a map of category → {value, max}. We compute a
     percentage, translate to 1–3 stars, and award XP. Money XP rewards balance
     and learning, not raw wealth. ------------------------------------------- */
  function starsFor(percent) {
    const t = CONFIG.starThresholds;
    if (percent >= t.three) return 3;
    if (percent >= t.two) return 2;
    return 1;
  }

  function completeLevel(level, outcome) {
    // outcome: { percent (0-100), categories:{}, passed:bool, title?, extra?:{} }
    const id = level.id;
    const stars = outcome.passed ? starsFor(outcome.percent) : 1;
    const prior = state.levels[id];
    const firstTime = !prior || !prior.completed;

    const xpEarned = firstTime
      ? level.xp + stars * CONFIG.xpPerStar
      : Math.round((stars * CONFIG.xpPerStar) / 2); // reduced XP on replays

    if (outcome.passed) {
      state.stats.moneyXP += Math.max(0, xpEarned);
    }

    const best = Math.max(prior ? prior.best || 0 : 0, outcome.percent);
    state.levels[id] = {
      number: level.number,
      completed: prior ? prior.completed || outcome.passed : outcome.passed,
      stars: Math.max(prior ? prior.stars || 0 : 0, outcome.passed ? stars : 0),
      score: Math.round(outcome.percent),
      best: Math.round(best),
      categories: outcome.categories || {},
      title: outcome.title || (prior && prior.title) || null,
      xp: xpEarned,
      lastPlayed: Date.now(),
    };

    // Attempts tracking (dashboard).
    state.dashboard.attempts[id] = (state.dashboard.attempts[id] || 0) + 1;

    // Badge on pass (first meaningful completion).
    const newBadges = [];
    if (outcome.passed && level.badge && awardBadge(level.badge)) newBadges.push(level.badge);

    // Extra badges from lifetime savings.
    if (state.stats.totalSaved >= 100 && awardBadge("saved_100")) newBadges.push("saved_100");

    // MoneyVille Master when all ten are complete.
    if (levelsCompleted() >= LEVELS.length && awardBadge("money_master")) newBadges.push("money_master");

    save();
    return { stars, xpEarned, firstTime, newBadges };
  }

  function addSavings(amount) {
    if (amount > 0) { state.stats.totalSaved += amount; }
  }

  function recordDashboard(kind, value) {
    const map = {
      scam: "scamAccuracy", budget: "budgetScores", saving: "savingScores",
      safety: "safetyScores", business: "businessScores", invest: "investScores",
    };
    const key = map[kind];
    if (key) state.dashboard[key].push(value);
  }

  function addTime(ms) { state.dashboard.timeSpentMs += ms; }

  global.MV_STATE = {
    load, save, reset, subscribe, get, mode, moneyScale,
    levelResult, isLevelUnlocked, isBuildingUnlocked, levelsCompleted,
    setProfile, setMode, selectAvatar,
    awardBadge, hasBadge, completeLevel, addSavings, recordDashboard, addTime,
    starsFor,
  };
})(window);
