// Gather every English text unit the app can show and write i18n/en.json — the list that
// is translated into each language. Run after changing any wording: `npm run i18n:extract`.
// Units that disappeared are dropped; each language file keeps only current units.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "../lib/serve.mjs";
import { crawl } from "./crawl.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const srv = await serve(join(root, "www"));
const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const { found, errors } = await crawl(browser, srv.base, { kind: "collect", log: (s) => console.log("  ✓", s) });
await browser.close(); srv.close();

// a key whose English is just a placeholder or punctuation needs no translation
const units = Object.fromEntries(Object.entries(found).filter(([, v]) => /[A-Za-z]/.test(v.en.replace(/<\/?\d+\/?>|\{\d+\}|&[#\w]+;/g, ""))));
const dir = join(root, "i18n");
mkdirSync(dir, { recursive: true });
const file = join(dir, "en.json");
const before = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
writeFileSync(file, JSON.stringify(units, null, 1) + "\n");

const added = Object.keys(units).filter((k) => !before[k]).length;
const removed = Object.keys(before).filter((k) => !units[k]).length;
const words = Object.values(units).reduce((a, u) => a + (u.en.replace(/<[^>]+>|\{\d+\}/g, " ").match(/[A-Za-z][A-Za-z'’-]*/g) || []).length, 0);
console.log(`i18n/en.json: ${Object.keys(units).length} units, ~${words} words (${added} new, ${removed} gone)`);
if (errors.length) console.log("page errors:", errors.slice(0, 5));
