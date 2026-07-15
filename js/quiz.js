/* Shield Force — training modules: 6 quizzes with instant feedback + explanations */
(function () {
  "use strict";

  const STORE = "sf-training-v1";
  const best = JSON.parse(localStorage.getItem(STORE) || "{}");

  const selectSec = document.getElementById("module-select");
  const quizSec = document.getElementById("quiz-section");
  const grid = document.getElementById("module-grid");
  const card = document.getElementById("quiz-card");
  const barFill = document.getElementById("quiz-bar-fill");
  const countTag = document.getElementById("quiz-count");

  let mod = null, qi = 0, score = 0, answered = false;

  function renderGrid() {
    grid.innerHTML = SF.modules.map(m => {
      const b = best[m.id];
      const pct = b ? Math.round(b / m.questions.length * 100) : 0;
      return `
      <div class="card card3d module-card rv">
        <div class="top">
          <span class="ico">${m.icon}</span>
          <span class="tag ${b ? (pct === 100 ? "tag-teal" : "tag-gold") : "tag-blue"}">
            ${b ? (pct === 100 ? "★ Mastered" : "In progress") : "Not started"}
          </span>
        </div>
        <h3>${m.title}</h3>
        <p>${m.desc}</p>
        <div class="mod-progress"><i style="width:${pct}%"></i></div>
        <div class="mod-score">${b ? `Best score: <b>${b}/${m.questions.length}</b>` : `${m.questions.length} questions • ~3 min`}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px">
          <button class="btn btn-gold btn-sm" data-start="${m.id}">${b ? "Retrain ⟶" : "Start module ⟶"}</button>
          <a class="btn btn-ghost btn-sm" href="scam-detail.html?id=${m.intel}">📖 Read the intel</a>
        </div>
      </div>`;
    }).join("");
    SFX.reveal(); SFX.addGlares();
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-start]");
    if (b) start(b.dataset.start);
  });

  function start(id) {
    mod = SF.moduleById(id);
    if (!mod) return;
    qi = 0; score = 0;
    selectSec.style.display = "none";
    quizSec.style.display = "";
    scrollTo({ top: 0, behavior: "smooth" });
    question();
  }

  function question() {
    answered = false;
    const q = mod.questions[qi];
    countTag.textContent = `Q ${qi + 1}/${mod.questions.length}`;
    barFill.style.width = (qi / mod.questions.length * 100) + "%";
    card.innerHTML = `
      <span class="tag tag-gold">${mod.icon} ${mod.title}</span>
      <div class="quiz-q" style="margin-top:16px">${q.q}</div>
      <div class="quiz-opts">
        ${q.o.map((o, i) => `
          <button class="quiz-opt" data-i="${i}">
            <span class="key">${"ABCD"[i]}</span><span>${o}</span>
          </button>`).join("")}
      </div>
      <div id="quiz-feedback"></div>`;
    card.querySelectorAll(".quiz-opt").forEach(btn =>
      btn.addEventListener("click", () => answer(+btn.dataset.i)));
  }

  function answer(i) {
    if (answered) return;
    answered = true;
    const q = mod.questions[qi];
    const good = i === q.a;
    if (good) score++;
    card.querySelectorAll(".quiz-opt").forEach((btn, j) => {
      btn.disabled = true;
      btn.setAttribute("disabled", "");
      if (j === q.a) btn.classList.add("correct");
      else if (j === i) btn.classList.add("wrong");
    });
    barFill.style.width = ((qi + 1) / mod.questions.length * 100) + "%";
    const last = qi === mod.questions.length - 1;
    document.getElementById("quiz-feedback").innerHTML = `
      <div class="quiz-explain ${good ? "good" : "bad"}">
        <b>${good ? "✅ Correct." : `❌ Not quite — the answer is ${"ABCD"[q.a]}.`}</b>
        ${q.e}
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
        <button class="btn btn-gold" id="quiz-next">${last ? "See result ⟶" : "Next question ⟶"}</button>
      </div>`;
    document.getElementById("quiz-next").addEventListener("click", () => {
      if (last) result(); else { qi++; question(); }
    });
    document.getElementById("quiz-next").focus();
  }

  function result() {
    const n = mod.questions.length;
    const pct = Math.round(score / n * 100);
    if (!best[mod.id] || score > best[mod.id]) {
      best[mod.id] = score;
      localStorage.setItem(STORE, JSON.stringify(best));
    }
    const medal = pct === 100 ? "🏅" : pct >= 80 ? "🥈" : pct >= 60 ? "🎖️" : "🛡️";
    const line = pct === 100 ? "Perfect drill. This scam will never touch you."
      : pct >= 80 ? "Strong defence — one more pass for mastery."
      : pct >= 60 ? "Good base. Re-read the intel and retrain."
      : "This scam family would still hurt you — study the briefing and come back.";
    barFill.style.width = "100%";
    countTag.textContent = "Done";
    card.innerHTML = `
      <div class="quiz-result">
        <span class="medal">${medal}</span>
        <div class="big grad-text">${score}/${n}</div>
        <p style="color:var(--mut);max-width:420px;margin:8px auto 24px">${line}</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-gold" id="quiz-retry">↻ Retrain module</button>
          <a class="btn btn-ghost" href="scam-detail.html?id=${mod.intel}">📖 Study the intel briefing</a>
          <button class="btn btn-teal" id="quiz-back">All modules</button>
        </div>
      </div>`;
    document.getElementById("quiz-retry").addEventListener("click", () => start(mod.id));
    document.getElementById("quiz-back").addEventListener("click", exit);
  }

  function exit() {
    quizSec.style.display = "none";
    selectSec.style.display = "";
    renderGrid();
    scrollTo({ top: 0, behavior: "smooth" });
  }
  document.getElementById("quiz-exit").addEventListener("click", exit);

  renderGrid();

  /* deep link: training.html?module=upi (used by intel pages) */
  const want = new URLSearchParams(location.search).get("module");
  if (want && SF.moduleById(want)) start(want);
})();
