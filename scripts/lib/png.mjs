// Flatten an 8-bit RGBA PNG (what Chromium screenshots produce) to plain RGB.
// Both stores reject icons and screenshots that carry an alpha channel, even a fully
// opaque one. Any other PNG is returned unchanged.
import { deflateSync, inflateSync } from "node:zlib";

export function pngToRGB(buf) {
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
