/* =============================================================================
   MoneyVille — Game State, Persistence, Scoring & Progression
   -----------------------------------------------------------------------------
   Holds the player profile plus a SEPARATE progress slot per difficulty mode
   (junior / explorer / advanced): each slot has its own financial indicators
   (GDD §6), Money XP, badges, per-level results, star ratings (GDD §7) and
   dashboard learning signals. Switching difficulty switches slots, so the three
   modes are fully independent playthroughs. Profile and cosmetics are shared.
   Persists to localStorage; exposes a small event bus so the UI can react.
   ============================================================================= */
(function (global) {
  "use strict";

  const { CONFIG, MODES, BADGES, LEVELS } = global.MV_DATA;
  const MODE_IDS = Object.keys(MODES); // junior, explorer, advanced

  function emptyProgress() {
    return {
      stats: { moneyXP: 0, totalSaved: 0 },
      levels: {},   // { [levelId]: { stars, score, best, completed, ... } }
      badges: {},   // { [badgeId]: timestamp }
      dashboard: {
        timeSpentMs: 0,
        scamAccuracy: [], budgetScores: [], savingScores: [],
        safetyScores: [], businessScores: [], investScores: [],
        attempts: {},
      },
    };
  }

  function emptyProgressSet() {
    const p = {};
    MODE_IDS.forEach((id) => (p[id] = emptyProgress()));
    return p;
  }

  const DEFAULT = () => ({
    version: 2,
    profile: {
      name: "", avatar: "🦊", mode: "explorer",
      room: { wall: "#dff1ff", floor: "#ffe8c7" },
      classCode: "", createdAt: Date.now(),
    },
    cosmetics: { unlocked: ["🦊", "🐼", "🐸"], selected: "🦊" }, // shared
    progress: emptyProgressSet(),                                  // per-mode
  });

  let state = DEFAULT();
  const listeners = new Set();

  /* ---- Active slot -------------------------------------------------------- */
  function slot() {
    const id = state.profile.mode;
    if (!state.progress[id]) state.progress[id] = emptyProgress();
    return state.progress[id];
  }
  const progress = () => slot();

  /* ---- Persistence -------------------------------------------------------- */
  function load() {
    try {
      const raw = localStorage.getItem(CONFIG.saveKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const d = DEFAULT();
        state = d;
        state.profile = Object.assign(d.profile, parsed.profile || {});
        state.cosmetics = Object.assign(d.cosmetics, parsed.cosmetics || {});

        if (parsed.progress) {
          // v2+ : merge each slot, ensuring shape.
          MODE_IDS.forEach((id) => {
            const src = parsed.progress[id];
            if (src) {
              const slotDef = emptyProgress();
              slotDef.stats = Object.assign(slotDef.stats, src.stats || {});
              slotDef.dashboard = Object.assign(slotDef.dashboard, src.dashboard || {});
              slotDef.levels = src.levels || {};
              slotDef.badges = src.badges || {};
              state.progress[id] = slotDef;
            }
          });
        } else {
          // v1 : single shared progress → migrate into the mode last played.
          const modeId = MODE_IDS.indexOf(state.profile.mode) >= 0 ? state.profile.mode : "explorer";
          const s = state.progress[modeId];
          s.stats = Object.assign(s.stats, parsed.stats || {});
          s.levels = parsed.levels || {};
          s.badges = parsed.badges || {};
          s.dashboard = Object.assign(s.dashboard, parsed.dashboard || {});
        }
      }
    } catch (e) {
      console.warn("MoneyVille: could not load save, starting fresh.", e);
      state = DEFAULT();
    }
    return state;
  }

  function save() {
    try { localStorage.setItem(CONFIG.saveKey, JSON.stringify(state)); }
    catch (e) { console.warn("MoneyVille: could not save.", e); }
    emit();
  }

  function reset() { state = DEFAULT(); save(); }

  // Reset only the active difficulty's progress (keeps other modes & profile).
  function resetMode() { state.progress[state.profile.mode] = emptyProgress(); save(); }

  /* ---- Event bus ---------------------------------------------------------- */
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function emit() { listeners.forEach((fn) => fn(state)); }

  /* ---- Getters ------------------------------------------------------------ */
  const get = () => state;
  const mode = () => MODES[state.profile.mode] || MODES.explorer;
  const moneyScale = () => mode().moneyScale;

  function levelResult(id) { return slot().levels[id] || null; }

  function isLevelUnlocked(number) {
    if (number <= 1) return true;
    const prev = LEVELS.find((l) => l.number === number - 1);
    const lv = slot().levels;
    return prev ? !!(lv[prev.id] && lv[prev.id].completed) : false;
  }

  function isBuildingUnlocked(buildingUnlockLevel) {
    if (buildingUnlockLevel <= 1) return true;
    const lv = slot().levels;
    return isLevelUnlocked(buildingUnlockLevel) ||
      LEVELS.some((l) => l.number >= buildingUnlockLevel && lv[l.id] && lv[l.id].completed);
  }

  function levelsCompleted() {
    const lv = slot().levels;
    return LEVELS.filter((l) => lv[l.id] && lv[l.id].completed).length;
  }

  /* ---- Profile mutations (shared) ---------------------------------------- */
  function setProfile(patch) { Object.assign(state.profile, patch); save(); }
  function setMode(id) { if (MODES[id]) { state.profile.mode = id; slot(); save(); } }
  function selectAvatar(emoji) { state.profile.avatar = emoji; state.cosmetics.selected = emoji; save(); }

  /* ---- Badges (per mode) -------------------------------------------------- */
  function awardBadge(id) {
    if (!id || !BADGES[id]) return false;
    const b = slot().badges;
    if (b[id]) return false;
    b[id] = Date.now();
    return true;
  }
  function hasBadge(id) { return !!slot().badges[id]; }

  /* ---- Scoring (GDD §7) --------------------------------------------------- */
  function starsFor(percent) {
    const t = CONFIG.starThresholds;
    if (percent >= t.three) return 3;
    if (percent >= t.two) return 2;
    return 1;
  }

  function completeLevel(level, outcome) {
    const s = slot();
    const id = level.id;
    const stars = outcome.passed ? starsFor(outcome.percent) : 1;
    const prior = s.levels[id];
    const firstTime = !prior || !prior.completed;

    const xpEarned = firstTime
      ? level.xp + stars * CONFIG.xpPerStar
      : Math.round((stars * CONFIG.xpPerStar) / 2);

    if (outcome.passed) s.stats.moneyXP += Math.max(0, xpEarned);

    const best = Math.max(prior ? prior.best || 0 : 0, outcome.percent);
    s.levels[id] = {
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

    s.dashboard.attempts[id] = (s.dashboard.attempts[id] || 0) + 1;

    const newBadges = [];
    if (outcome.passed && level.badge && awardBadge(level.badge)) newBadges.push(level.badge);
    if (s.stats.totalSaved >= 100 && awardBadge("saved_100")) newBadges.push("saved_100");
    if (levelsCompleted() >= LEVELS.length && awardBadge("money_master")) newBadges.push("money_master");

    save();
    return { stars, xpEarned, firstTime, newBadges };
  }

  function addSavings(amount) { if (amount > 0) slot().stats.totalSaved += amount; }

  function recordDashboard(kind, value) {
    const map = {
      scam: "scamAccuracy", budget: "budgetScores", saving: "savingScores",
      safety: "safetyScores", business: "businessScores", invest: "investScores",
    };
    const key = map[kind];
    if (key) slot().dashboard[key].push(value);
  }

  function addTime(ms) { slot().dashboard.timeSpentMs += ms; }

  global.MV_STATE = {
    load, save, reset, resetMode, subscribe, get, progress, mode, moneyScale,
    levelResult, isLevelUnlocked, isBuildingUnlocked, levelsCompleted,
    setProfile, setMode, selectAvatar,
    awardBadge, hasBadge, completeLevel, addSavings, recordDashboard, addTime,
    starsFor,
  };
})(window);
