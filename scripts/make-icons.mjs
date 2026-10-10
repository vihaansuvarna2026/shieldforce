// Draw every app icon and splash screen from one design: the SF monogram (a solid S and an
// outlined gold F over a gold bar) on the app's navy. The letters are stored as outlines,
// so the result is the same on any machine whatever fonts it has.
//
// Run with `npm run icons` after changing the design. It needs Playwright and a Chromium:
//   npm i -g playwright && npx playwright install chromium
// (or point PLAYWRIGHT_MODULE / CHROMIUM_PATH at existing copies).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright").catch(() => {
  throw new Error("Playwright is needed to draw the icons: npm i -g playwright");
});

/* ---------------- the design ---------------- */

// Liberation Sans Bold "S" and "F" at 1000 units per em, baseline at y=0.
const S = "M627.9-198.2L627.9-198.2Q627.9-97.2 553.0-43.7Q478.0 9.8 333.0 9.8L333.0 9.8Q200.7 9.8 125.5-37.1Q50.3-84.0 28.8-179.2L28.8-179.2L168.0-202.1Q182.1-147.5 223.1-122.8Q264.2-98.1 336.9-98.1L336.9-98.1Q487.8-98.1 487.8-189.9L487.8-189.9Q487.8-219.2 470.5-238.3Q453.1-257.3 421.6-270.0Q390.1-282.7 300.8-300.8L300.8-300.8Q223.6-318.8 193.4-329.8Q163.1-340.8 138.7-355.7Q114.3-370.6 97.2-391.6Q80.1-412.6 70.6-440.9Q61.0-469.2 61.0-505.9L61.0-505.9Q61.0-599.1 131.1-648.7Q201.2-698.2 335.0-698.2L335.0-698.2Q462.9-698.2 527.1-658.2Q591.3-618.2 609.9-525.9L609.9-525.9L470.2-506.8Q459.5-551.3 426.5-573.7Q393.6-596.2 332.0-596.2L332.0-596.2Q201.2-596.2 201.2-514.2L201.2-514.2Q201.2-487.3 215.1-470.2Q229.0-453.1 256.3-441.2Q283.7-429.2 367.2-411.1L367.2-411.1Q466.3-390.1 509.0-372.3Q551.8-354.5 576.7-330.8Q601.6-307.1 614.7-274.2Q627.9-241.2 627.9-198.2Z";
const F = "M574.2-576.7L210.9-576.7L210.9-363.8L563.0-363.8L563.0-252.4L210.9-252.4L210.9 0L66.9 0L66.9-688.0L574.2-688.0L574.2-576.7Z";
const F_X = 617;                                   // S advance (667) less tight tracking
const BAR = { y: 100, h: 60 };                     // gold bar under the baseline
const BOX = { x: 28.8, y: -698.2, w: 1162.4, h: 698.2 + BAR.y + BAR.h };

const NAVY = "#081020";

// Monogram sized so the group is `width` (a fraction of the canvas) wide, centred.
function monogram(size, width, { mono = false } = {}) {
  const k = (size * width) / BOX.w;
  const tx = size / 2 - (BOX.x + BOX.w / 2) * k;
  const ty = size / 2 - (BOX.y + BOX.h / 2) * k;
  // keep the outline at least ~1.3px so the F survives at launcher sizes
  const stroke = Math.max(40, 1.3 / k);
  const white = mono ? "#fff" : "url(#ink)";
  const gold = mono ? "#fff" : "url(#gold)";
  return `
    <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(5)})">
      <path d="${S}" fill="${white}"/>
      <path d="${F}" transform="translate(${F_X} 0)" fill="none" stroke="${gold}"
            stroke-width="${stroke.toFixed(1)}" stroke-linejoin="miter"/>
      <rect x="${BOX.x}" y="${BAR.y}" width="${BOX.w}" height="${BAR.h}" rx="${BAR.h / 2}" fill="${gold}"/>
    </g>`;
}

const DEFS = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f1f3d"/><stop offset=".55" stop-color="${NAVY}"/><stop offset="1" stop-color="#040913"/>
    </linearGradient>
    <radialGradient id="glowGold" cx=".78" cy=".18" r=".6">
      <stop offset="0" stop-color="#ffa53e" stop-opacity=".12"/><stop offset="1" stop-color="#ffa53e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowTeal" cx=".12" cy=".92" r=".55">
      <stop offset="0" stop-color="#2ee6a8" stop-opacity=".16"/><stop offset="1" stop-color="#2ee6a8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6e4ff"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffc36b"/><stop offset="1" stop-color="#ff8a1e"/>
    </linearGradient>
  </defs>`;

// shape: "square" (full bleed) | "rounded" | "circle" | "none" (transparent)
function svg(w, h, { shape = "square", width = 0.6, inset = 0, mono = false } = {}) {
  const s = Math.min(w, h);
  const r = shape === "rounded" ? (w - 2 * inset) * 0.225 : 0;
  const plate = shape === "none" ? "" : shape === "circle"
    ? `<circle cx="${w / 2}" cy="${h / 2}" r="${w / 2 - inset}" fill="url(#bg)"/>
       <circle cx="${w / 2}" cy="${h / 2}" r="${w / 2 - inset}" fill="url(#glowGold)"/>
       <circle cx="${w / 2}" cy="${h / 2}" r="${w / 2 - inset}" fill="url(#glowTeal)"/>`
    : ["bg", "glowGold", "glowTeal"].map((f) =>
        `<rect x="${inset}" y="${inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="${r}" fill="url(#${f})"/>`).join("");
  const mark = `<g transform="translate(${(w - s) / 2} ${(h - s) / 2})">${monogram(s, width, { mono })}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}${plate}${mark}</svg>`;
}

/* ---------------- PNG: drop the alpha channel ---------------- */
// The App Store rejects icons that carry an alpha channel, even a fully opaque one.

function pngToRGB(buf) {
  let pos = 8, width, height, idat = [];
  const chunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) return buf; }   // already not 8-bit RGBA
    if (type === "IDAT") idat.push(data);
    chunks.push(type);
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), bpp = 4, stride = width * bpp;
  const out = Buffer.alloc(height * (1 + width * 3));
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      line[i] = (line[i] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f]) & 255;
    }
    const o = y * (1 + width * 3);
    for (let x = 0; x < width; x++) line.copy(out, o + 1 + x * 3, x * 4, x * 4 + 3);
    prev = line;
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const t = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(t)); return Buffer.concat([len, t, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([buf.subarray(0, 8), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(out, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

/* ---------------- render ---------------- */

const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function draw(file, w, h, opts = {}) {
  const transparent = opts.shape && opts.shape !== "square";
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(w, h, opts)}</body></html>`);
  let png = await page.screenshot({ omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  if (!transparent) png = pngToRGB(png);
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, png);
  console.log(`${file}  ${w}x${h}`);
}

const ICON = { width: 0.6 };
const FOREGROUND = { shape: "none", width: 0.46 };   // fits Android's 66dp safe circle in 108dp

// Web app / PWA
await draw("assets/icons/icon-192.png", 192, 192, { shape: "rounded", ...ICON });
await draw("assets/icons/icon-512.png", 512, 512, { shape: "rounded", ...ICON });
await draw("assets/icons/icon-maskable-512.png", 512, 512, { width: 0.5 });
await draw("assets/icons/icon-180.png", 180, 180, ICON);
await draw("assets/icons/icon-1024-appstore.png", 1024, 1024, ICON);
writeFileSync(join(root, "assets/icons/favicon.svg"),
  svg(48, 48, { shape: "rounded", width: 0.66 }).replace(' width="48" height="48"', "") + "\n");

// iOS app (Xcode asset catalog): one 1024 icon, opaque; launch image cropped to fill
const IOS = "ios/App/App/Assets.xcassets";
await draw(`${IOS}/AppIcon.appiconset/AppIcon-512@2x.png`, 1024, 1024, ICON);
for (const n of ["", "-1", "-2"]) await draw(`${IOS}/Splash.imageset/splash-2732x2732${n}.png`, 2732, 2732, { width: 0.15 });

// Android app
const RES = "android/app/src/main/res";
const DENSITY = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(DENSITY)) {
  await draw(`${RES}/mipmap-${d}/ic_launcher.png`, 48 * k, 48 * k, { shape: "rounded", inset: 2 * k, width: 0.58 });
  await draw(`${RES}/mipmap-${d}/ic_launcher_round.png`, 48 * k, 48 * k, { shape: "circle", inset: 2 * k, width: 0.56 });
  await draw(`${RES}/mipmap-${d}/ic_launcher_foreground.png`, 108 * k, 108 * k, FOREGROUND);
  await draw(`${RES}/mipmap-${d}/ic_launcher_monochrome.png`, 108 * k, 108 * k, { ...FOREGROUND, mono: true });
}
// Launch screen before Android 12 (12+ draws the adaptive icon on the theme colour)
const SPLASH = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] };
for (const [d, [w, h]] of Object.entries(SPLASH)) {
  await draw(`${RES}/drawable-port-${d}/splash.png`, w, h, { width: 0.32 });
  await draw(`${RES}/drawable-land-${d}/splash.png`, h, w, { width: 0.32 });
}
await draw(`${RES}/drawable/splash.png`, 480, 320, { width: 0.32 });

// Store kit copies for manual upload / other tooling
const KIT = "store-kit/icons";
for (const s of [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180]) await draw(`${KIT}/ios/AppIcon-${s}.png`, s, s, ICON);
await draw(`${KIT}/ios/AppIcon-1024-AppStore.png`, 1024, 1024, ICON);
await draw(`${KIT}/android/play-store-icon-512.png`, 512, 512, ICON);
for (const [d, k] of Object.entries(DENSITY)) await draw(`${KIT}/android/mipmap-${d}-${48 * k}.png`, 48 * k, 48 * k, { shape: "rounded", inset: 2 * k, width: 0.58 });
await draw(`${KIT}/android/adaptive-foreground-432.png`, 432, 432, FOREGROUND);

await browser.close();
