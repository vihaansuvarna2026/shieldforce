// Check one language without writing anything the app uses (safe to run while others work).
//
//   node scripts/i18n/check.mjs <lang> [todo-file]
//
// Prints how many units are translated, every placeholder/tag error, broken JSON files,
// and keys that no longer exist. With a todo-file, also writes the units still missing
// there as "hash<TAB>English" lines, in app order.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const [lang, todoFile] = process.argv.slice(2);
if (!lang) { console.error("usage: node scripts/i18n/check.mjs <lang> [todo-file]"); process.exit(2); }

const en = JSON.parse(readFileSync(join(root, "i18n", "en.json"), "utf8"));
const tokens = (s) => (s.match(/<\/?\d+\/?>|\{\w+\}/g) || []).sort().join(" ");
function balanced(s) {
  const stack = [];
  for (const m of s.matchAll(/<(\/?)(\d+)(\/?)>/g)) {
    if (m[3]) continue;
    if (!m[1]) stack.push(m[2]);
    else if (stack.pop() !== m[2]) return false;
  }
  return stack.length === 0;
}

const ldir = join(root, "i18n", lang);
const tr = {};
let broken = 0;
if (existsSync(ldir)) for (const f of readdirSync(ldir).filter((f) => f.endsWith(".json")).sort()) {
  try { Object.assign(tr, JSON.parse(readFileSync(join(ldir, f), "utf8"))); }
  catch (e) { broken++; console.log(`✗ ${lang}/${f} is not valid JSON: ${e.message}`); }
}
const missing = [], bad = [];
for (const [h, u] of Object.entries(en)) {
  const t = tr[h];
  if (t == null || t === "") { missing.push([h, u.en]); continue; }
  if (tokens(t) !== tokens(u.en) || !balanced(t)) bad.push(`${h}\n    EN: ${u.en}\n    ${lang}: ${t}`);
}
const stale = Object.keys(tr).filter((h) => !en[h]);
const total = Object.keys(en).length;
console.log(`${lang}: ${total - missing.length - bad.length}/${total} good, ${missing.length} missing, ${bad.length} placeholder/tag errors, ${stale.length} unknown keys, ${broken} broken files`);
bad.forEach((b) => console.log("✗ " + b));
if (stale.length) console.log("unknown keys (not in i18n/en.json):", stale.slice(0, 20).join(" "));
if (todoFile) writeFileSync(todoFile, missing.map(([h, e]) => `${h}\t${e}`).join("\n") + (missing.length ? "\n" : ""));
process.exit(bad.length || broken ? 1 : 0);
