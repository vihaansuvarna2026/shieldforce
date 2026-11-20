/* ============================================================
   SHIELD FORCE — languages
   Loaded in <head> on every screen. Picks the language (the user's
   choice, else the phone's language, else English), loads that
   language's dictionary from the app itself (works offline), and
   translates each screen before it is first shown.

   How text is matched: every block of text (a heading, a paragraph,
   a button…) is turned into a key — its English wording with inline
   tags written as <1>…</1> and numbers as {0}. The dictionary maps a
   short hash of that key to the translated wording, so bold text,
   links, icons and live numbers all stay in place.
   ============================================================ */
(function () {
  "use strict";

  /* code, English name, own name, text direction, other names people search for */
  const LANGS = [
    ["en", "English",   "English",   "ltr", "angrezi"],
    ["hi", "Hindi",     "हिन्दी",     "ltr", "hindustani"],
    ["bn", "Bengali",   "বাংলা",      "ltr", "bangla"],
    ["mr", "Marathi",   "मराठी",      "ltr", ""],
    ["te", "Telugu",    "తెలుగు",     "ltr", ""],
    ["ta", "Tamil",     "தமிழ்",      "ltr", ""],
    ["gu", "Gujarati",  "ગુજરાતી",    "ltr", ""],
    ["ur", "Urdu",      "اردو",       "rtl", ""],
    ["kn", "Kannada",   "ಕನ್ನಡ",      "ltr", "kanarese"],
    ["or", "Odia",      "ଓଡ଼ିଆ",       "ltr", "oriya"],
    ["ml", "Malayalam", "മലയാളം",    "ltr", ""],
    ["pa", "Punjabi",   "ਪੰਜਾਬੀ",     "ltr", "panjabi gurmukhi"],
    ["as", "Assamese",  "অসমীয়া",    "ltr", "asamiya axomiya"],
    ["ne", "Nepali",    "नेपाली",     "ltr", "gorkhali gurkhali"]
  ];
  /* the word "Language" in every supported language, shown together so anyone can
     recognise the language button whatever language the app is currently in */
  const WORD = ["Language", "भाषा", "ভাষা", "भाषा", "భాష", "மொழி", "ભાષા", "زبان", "ಭಾಷೆ", "ଭାଷା", "ഭാഷ", "ਭਾਸ਼ਾ", "ভাষা", "भाषा"];

  // Languages whose translation is complete; only these are offered. Written by
  // scripts/i18n/build.mjs — a language appears in the app once every text is translated.
  const READY = ["en"];
  const LIVE = LANGS.filter((l) => READY.includes(l[0]));
  const MULTI = LIVE.length > 1;

  const KEY = "sf_lang";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage off */ } }
  };
  const known = (c) => LIVE.some((l) => l[0] === c);
  function fromPhone() {
    for (const l of navigator.languages || [navigator.language || ""]) {
      const c = String(l).toLowerCase().split("-")[0];
      if (known(c)) return c;
    }
    return "en";
  }

  let lang = store.get(KEY);
  if (!known(lang)) lang = fromPhone();
  const meta = LANGS.find((l) => l[0] === lang);
  const html = document.documentElement;
  html.lang = lang;
  html.dir = meta[3];

  const COLLECT = store.get("sf_i18n_collect") === "1";   // tools: record every English text unit
  const AUDIT = store.get("sf_i18n_audit") === "1";       // tools: record text with no translation
  const here = document.currentScript && document.currentScript.src;
  const DICT_URL = (code) => new URL("i18n/" + code + ".js", here || location.href).href;

  // Load the dictionary before the page body is parsed, and keep the page hidden until
  // it has been translated, so English never flashes up first.
  if (lang !== "en") {
    html.classList.add("i18n-wait");
    document.write('<script src="' + DICT_URL(lang) + '"><\/script>');
  }

  /* ---------------- keys ---------------- */
  const NUM = /\d+(?:[.,:/]\d+)*/g;
  const LETTER = /[A-Za-z]/;
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "CANVAS", "TEMPLATE",
    "INPUT", "SELECT", "OPTION", "IFRAME"]);
  const INLINE = new Set(["A", "B", "STRONG", "I", "EM", "SPAN", "SMALL", "BR", "U", "MARK", "Q", "SUB", "SUP",
    "ABBR", "S", "IMG", "INPUT", "svg", "tspan", "KBD", "TIME", "WBR"]);
  const VOID = new Set(["BR", "IMG", "INPUT", "svg", "WBR"]);
  const ATTRS = ["placeholder", "aria-label", "title", "alt"];

  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  const esc = (s) => s.replace(/[&<>{}]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "{": "&#123;", "}": "&#125;" }[c]));
  const unesc = (s) => s.replace(/&(amp|lt|gt|#123|#125);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", "#123": "{", "#125": "}" }[e]));
  const norm = (s) => s.replace(/\s+/g, " ").trim();

  const held = (el) => el.nodeType === 1 && (el.hasAttribute("data-v") || el.getAttribute("translate") === "no" ||
    el.classList.contains("wordmark") || SKIP.has(el.tagName));
  const isVoid = (el) => VOID.has(el.tagName) || held(el);
  const isInline = (el) => INLINE.has(el.tagName) || held(el);

  // English wording of an element's content, with inline elements and numbers as placeholders
  function serialize(el, c) {
    let out = "";
    for (const n of el.childNodes) {
      if (n.nodeType === 3) {
        out += esc(n.nodeValue).replace(NUM, (m) => { c.nums.push(m); return "{" + (c.nums.length - 1) + "}"; });
      } else if (n.nodeType === 1) {
        const i = c.els.push(n);
        out += isVoid(n) ? "<" + i + "/>" : "<" + i + ">" + serialize(n, c) + "</" + i + ">";
      }
    }
    return out;
  }
  // text a reader actually sees (to decide whether there is anything to translate)
  function visibleText(el) {
    let t = "";
    for (const n of el.childNodes) {
      if (n.nodeType === 3) t += n.nodeValue;
      else if (n.nodeType === 1 && !isVoid(n)) t += visibleText(n);
    }
    return t;
  }

  // rebuild an element's content from a translation, reusing its own inline elements
  function rebuild(el, tr, c) {
    const frag = document.createDocumentFragment();
    const stack = [frag];
    const re = /<(\d+)\/>|<(\d+)>|<\/(\d+)>|\{(\d+)\}|([^<{]+|[<{])/g;
    let m;
    const top = () => stack[stack.length - 1];
    const text = (s) => { if (s) top().appendChild(document.createTextNode(s)); };
    while ((m = re.exec(tr))) {
      if (m[1]) { const n = c.els[m[1] - 1]; if (n) top().appendChild(n); }
      else if (m[2]) {
        const n = c.els[m[2] - 1];
        if (!n) continue;
        while (n.firstChild) n.removeChild(n.firstChild);
        top().appendChild(n); stack.push(n);
      } else if (m[3]) { if (stack.length > 1) stack.pop(); }
      else if (m[4] !== undefined) text(c.nums[+m[4]] ?? "");
      else text(unesc(m[5]));
    }
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(frag);
  }

  /* ---------------- translate ---------------- */
  const DICT = () => window.SF_I18N_DICT || {};
  const done = new WeakMap();   // element → its content right after we translated it
  const units = COLLECT ? (window.__sfUnits = window.__sfUnits || {}) : null;
  const missing = AUDIT ? (window.__sfMissing = window.__sfMissing || {}) : null;
  const where = () => (location.pathname.split("/").pop() || "index.html") + location.search;

  function lookup(key) {
    if (COLLECT) { const h = hash(key); if (!units[h]) units[h] = { en: key, at: where() }; return null; }
    if (lang === "en") return null;
    const tr = DICT()[hash(key)];
    if (tr == null && AUDIT) missing[hash(key)] = { en: key, at: where() };
    return tr == null ? null : tr;
  }

  function unit(el) {
    const c = { els: [], nums: [] };
    const key = norm(serialize(el, c));
    if (done.get(el) === key) return;
    const tr = lookup(key);
    if (tr != null) {
      rebuild(el, tr, c);
      done.set(el, norm(serialize(el, { els: [], nums: [] })));
    }
  }

  function attrs(el) {
    if (el.getAttribute("translate") === "no") return;   // e.g. labels already built with t()
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (!v || !LETTER.test(v)) continue;
      const nums = [];
      const key = v.replace(/[ \t\r]+/g, " ").replace(/ *\n */g, "\n").trim()
        .replace(NUM, (m) => { nums.push(m); return "{" + (nums.length - 1) + "}"; });
      if (el["__sf_" + a] === v) continue;
      const tr = lookup(key);
      if (tr != null) {
        const out = tr.replace(/\{(\d+)\}/g, (m, i) => nums[+i] ?? "");
        el.setAttribute(a, out);
        el["__sf_" + a] = out;
      }
    }
  }

  function walk(el) {
    if (el.nodeType !== 1 || SKIP.has(el.tagName) || el.getAttribute("translate") === "no" ||
        el.classList.contains("wordmark")) return;
    attrs(el);
    let direct = false, blockChild = false;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.nodeValue.trim()) direct = true;
      else if (n.nodeType === 1 && !isInline(n)) blockChild = true;
    }
    if (direct && !blockChild && el.tagName !== "svg") {
      if (LETTER.test(visibleText(el))) unit(el);
      // the parts held aside (live values, names) are translated on their own
      el.querySelectorAll("[data-v]").forEach(walk);
      el.querySelectorAll("*").forEach((d) => { if (ATTRS.some((a) => d.hasAttribute(a))) attrs(d); });
      return;
    }
    if (direct && blockChild) {
      // loose text next to block elements: translate each run of text by itself
      for (const n of [...el.childNodes]) {
        if (n.nodeType !== 3 || !LETTER.test(n.nodeValue)) continue;
        const nums = [];
        const key = norm(esc(n.nodeValue).replace(NUM, (m) => { nums.push(m); return "{" + (nums.length - 1) + "}"; }));
        const tr = lookup(key);
        if (tr != null) n.nodeValue = " " + unesc(tr.replace(/\{(\d+)\}/g, (m, i) => nums[+i] ?? "")) + " ";
      }
    }
    for (const ch of el.children) walk(ch);
  }

  function title() {
    const t = document.title;
    if (!t || !LETTER.test(t) || document.__sfTitle === t) return;
    const nums = [];
    const key = norm(esc(t).replace(NUM, (m) => { nums.push(m); return "{" + (nums.length - 1) + "}"; }));
    const tr = lookup(key);
    if (tr != null) { document.title = unesc(tr.replace(/\{(\d+)\}/g, (m, i) => nums[+i] ?? "")); document.__sfTitle = document.title; }
  }

  // translate a string used outside the page text (dialogs, labels built in code)
  function t(template, vars) {
    let out = template;
    const tr = lookup(norm(template));
    if (tr != null) out = tr;
    return out.replace(/\{(\w+)\}/g, (m, k) => {
      if (!vars || !(k in vars)) return m;
      const v = String(vars[k]);
      const vt = LETTER.test(v) ? lookup(norm(esc(v))) : null;
      return vt != null ? unesc(vt) : v;
    });
  }

  /* ---------------- run ---------------- */
  let observer = null;
  function run() {
    const active = COLLECT || (lang !== "en" && window.SF_I18N_DICT);
    if (active) {
      walk(document.body);
      title();
      observer = new MutationObserver((list) => {
        const roots = new Set();
        for (const r of list) {
          let el = r.type === "characterData" ? r.target.parentElement : r.target;
          if (r.type === "attributes") { if (el) attrs(el); continue; }
          // translate the whole block the change happened in
          while (el && el !== document.body && el.parentElement && isInline(el) && !el.hasAttribute("data-v")) el = el.parentElement;
          if (el) roots.add(el);
          if (r.type === "childList") r.addedNodes.forEach((n) => { if (n.nodeType === 1) roots.add(n); });
        }
        observer.disconnect();
        roots.forEach((el) => { if (el.isConnected) walk(el); });
        title();
        observe();
      });
      observe();
    }
    html.classList.remove("i18n-wait");
  }
  function observe() {
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    const tEl = document.querySelector("title");
    if (tEl) observer.observe(tEl, { childList: true, characterData: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  // never leave the screen hidden if something goes wrong
  setTimeout(() => html.classList.remove("i18n-wait"), 2500);

  /* ---------------- choosing a language ---------------- */
  const GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/>' +
    '<path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';

  function choose(code) {
    if (!known(code)) return;
    store.set(KEY, code);
    location.reload();
  }

  function open() {
    if (document.getElementById("lang-sheet")) return;
    const items = LIVE.map(([c, en, own, dir, alt]) => `
      <li><button type="button" class="ls-item${c === lang ? " on" : ""}" data-lang="${c}" lang="${c}" dir="${dir}"
        data-find="${(en + " " + own + " " + c + " " + alt).toLowerCase()}" ${c === lang ? 'aria-current="true"' : ""}>
        <b translate="no">${own}</b><span translate="no">${en}</span>
        <i class="ls-tick" aria-hidden="true">${c === lang ? "✓" : ""}</i>
      </button></li>`).join("");
    document.body.insertAdjacentHTML("beforeend", `
      <div id="lang-sheet" role="dialog" aria-modal="true" aria-labelledby="ls-title">
        <div class="ls-backdrop" data-close></div>
        <div class="ls-panel">
          <div class="ls-head">
            <span class="ls-globe">${GLOBE}</span>
            <div class="ls-titles">
              <h2 id="ls-title">Choose your language</h2>
              <p class="ls-words" translate="no" dir="ltr">${WORD.filter((w, i) => WORD.indexOf(w) === i).join(" · ")}</p>
            </div>
            <button type="button" class="ls-close" data-close aria-label="Close">✕</button>
          </div>
          <input type="search" class="ls-search" placeholder="Search languages" aria-label="Search languages" autocomplete="off">
          <ul class="ls-list">${items}</ul>
          <p class="ls-empty" hidden>No matching language</p>
          <p class="ls-note">Translations were made with AI help and are being checked by native speakers.
            <a href="mailto:vihaanssuvarna@gmail.com?subject=${encodeURIComponent("Shield Force translation error (" + meta[1] + ")")}">Report a translation error</a></p>
        </div>
      </div>`);
    const sheet = document.getElementById("lang-sheet");
    const search = sheet.querySelector(".ls-search");
    sheet.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) close();
      const b = e.target.closest("[data-lang]");
      if (b) choose(b.dataset.lang);
    });
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      sheet.querySelectorAll(".ls-item").forEach((b) => {
        const hit = !q || b.dataset.find.includes(q);
        b.parentElement.hidden = !hit; if (hit) shown++;
      });
      sheet.querySelector(".ls-empty").hidden = shown > 0;
    });
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => sheet.classList.add("open"));
    sheet.querySelector(".ls-item.on")?.focus({ preventScroll: true });
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  function close() {
    const s = document.getElementById("lang-sheet");
    if (s) s.remove();
    document.removeEventListener("keydown", onKey);
  }

  // the language button: globe + the current language's own name, plus "Language" in
  // several scripts for screen readers and for anyone who cannot read the current one
  function button(cls = "") {
    if (!MULTI) return "";
    return `<button type="button" class="lang-btn ${cls}" data-lang-open translate="no" aria-label="${WORD.slice(0, 8).join(" / ")}">` +
      `<span class="lb-globe">${GLOBE}</span><span class="lb-name" translate="no">${meta[2]}</span></button>`;
  }
  // chips with every language's own name, for the first-launch screen
  function chips() {
    return LIVE.map(([c, en, own, dir]) =>
      `<button type="button" class="lang-chip${c === lang ? " on" : ""}" data-pick="${c}" lang="${c}" dir="${dir}" translate="no"` +
      ` aria-label="${en}"${c === lang ? ' aria-pressed="true"' : ""}>${own}</button>`).join("");
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-lang-open]")) { e.preventDefault(); open(); }
    const p = e.target.closest("[data-pick]");
    if (p && p.dataset.pick !== lang) choose(p.dataset.pick);
  });

  window.SFI = { lang, langs: LIVE, multi: MULTI, word: WORD, current: meta, t, open, choose, button, chips, globe: GLOBE, hash, translateNow: () => { walk(document.body); title(); } };
})();
