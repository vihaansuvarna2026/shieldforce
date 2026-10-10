// Assemble the shippable app into www/ — the folder Capacitor packs into the Android and
// iOS apps and that Netlify publishes. Only the app itself goes in: no native projects,
// store kit, scripts or docs.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "www");

rmSync(out, { recursive: true, force: true });
mkdirSync(out);

const pages = readdirSync(root).filter((f) => f.endsWith(".html"));
const files = [...pages, "manifest.webmanifest", "sw.js"];
const dirs = ["css", "js", "assets"];

for (const f of files) cpSync(join(root, f), join(out, f));
for (const d of dirs) cpSync(join(root, d), join(out, d), { recursive: true });

if (!existsSync(join(out, "index.html"))) throw new Error("www/index.html missing");
console.log(`www/ ready: ${pages.length} screens + ${dirs.join(", ")}`);
