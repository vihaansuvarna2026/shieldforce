/* =============================================================================
   MoneyVille build — bundle + minify the source into dist/ for production.
   Run: npm install && npm run build
   Produces:
     dist/moneyville.min.css   (all CSS, minified)
     dist/moneyville.min.js    (data+state+ui+levels+app concatenated, minified)
   index.html loads these two, so production ships 1 CSS + 1 JS request instead
   of 1 CSS + 5 JS, with comments/whitespace stripped.
   ============================================================================= */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { minify as minifyJS } from "terser";
import { minify as minifyCSS } from "csso";

const JS_ORDER = ["js/data.js", "js/state.js", "js/ui.js", "js/levels.js", "js/app.js"];
const kb = (n) => (n / 1024).toFixed(1) + " KB";
const gz = (s) => gzipSync(Buffer.from(s), { level: 9 }).length;

mkdirSync("dist", { recursive: true });

// ---- CSS ----
const cssSrc = readFileSync("css/moneyville.css", "utf8");
const cssOut = minifyCSS(cssSrc).css;
writeFileSync("dist/moneyville.min.css", cssOut);

// ---- JS ----
const jsSrc = JS_ORDER.map((f) => readFileSync(f, "utf8")).join("\n");
const result = await minifyJS(jsSrc, {
  compress: { passes: 2, drop_debugger: true },
  mangle: true,
  format: { comments: false },
});
if (result.error) throw result.error;
const jsOut = result.code;
writeFileSync("dist/moneyville.min.js", jsOut);

// ---- Report ----
const srcCss = cssSrc.length, srcJs = jsSrc.length;
const outCss = cssOut.length, outJs = jsOut.length;
console.log("CSS:", kb(srcCss), "->", kb(outCss), `(gzip ${kb(gz(cssOut))})`);
console.log("JS :", kb(srcJs), "->", kb(outJs), `(gzip ${kb(gz(jsOut))})`);
const totalOut = outCss + outJs;
console.log("Bundle total:", kb(totalOut), `(gzip ${kb(gz(cssOut + jsOut))})`);
console.log("Requests for app code: 2 (1 CSS + 1 JS)");
