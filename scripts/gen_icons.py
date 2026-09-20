#!/usr/bin/env python3
"""Generate Shield Force PWA icons (pure Python PNG writer, no deps)."""
import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "icons")

NAVY = (7, 13, 26)
NAVY_HI = (13, 25, 48)
GOLD = (255, 165, 62)
GOLD_DK = (196, 116, 30)
TEAL = (46, 230, 168)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def shield_half_width(v):
    """Half-width of the shield at vertical fraction v in [0,1] (0=top)."""
    if v < 0.55:
        return 0.36
    t = (v - 0.55) / 0.45
    return 0.36 * (1 - t * t)


def in_shield(nx, ny, scale=1.0):
    """nx,ny in [-.5,.5] shield-local coords; returns True if inside."""
    v = (ny + 0.42) / 0.84  # 0 top -> 1 bottom tip
    if v < 0 or v > 1:
        return False
    return abs(nx) <= shield_half_width(v) * scale


def make_icon(size, maskable=False, square=False):
    px = bytearray()
    cx = cy = size / 2.0
    # maskable icons need content within the inner 80% safe zone
    shield_scale = size * (0.66 if maskable else 0.80)
    corner = 0 if (maskable or square) else size * 0.22
    for y in range(size):
        row = bytearray()
        for x in range(size):
            # rounded-rect background
            dx = min(x, size - 1 - x)
            dy = min(y, size - 1 - y)
            if corner and dx < corner and dy < corner:
                r = ((corner - dx) ** 2 + (corner - dy) ** 2) ** 0.5
                if r > corner:
                    row += bytes((0, 0, 0, 0))
                    continue
            t = (x + y) / (2.0 * size)
            bg = lerp(NAVY, NAVY_HI, t)
            # subtle diagonal scan lines
            if (x + y) % max(6, size // 32) == 0:
                bg = lerp(bg, NAVY_HI, 0.5)
            nx = (x - cx) / shield_scale
            ny = (y - cy) / shield_scale
            c = bg
            if in_shield(nx, ny, 1.0):
                c = lerp(GOLD, GOLD_DK, (ny + 0.42) / 0.84)
                if in_shield(nx, ny, 0.82) and ny > -0.34:
                    c = lerp(NAVY, NAVY_HI, 0.35 + 0.4 * ((ny + 0.42) / 0.84))
                    # lightning bolt
                    v = (ny + 0.30) / 0.58
                    if 0 <= v <= 1:
                        if v < 0.5:
                            centre = 0.06 - 0.28 * v
                            wid = 0.115 - 0.05 * v
                        else:
                            centre = 0.20 - 0.42 * v
                            wid = 0.115 - 0.05 * v
                        if abs(nx - centre) < wid and (
                                v < 0.45 or v > 0.55 or nx > centre - wid * 0.2):
                            c = TEAL if v < 0.5 else lerp(TEAL, (18, 160, 120), v)
            row += bytes((c[0], c[1], c[2], 255))
        px += b"\x00" + row

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(bytes(px), 9))
           + chunk(b"IEND", b""))
    return png


def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = [("icon-192.png", 192, False, False), ("icon-512.png", 512, False, False),
            ("icon-maskable-512.png", 512, True, False), ("icon-180.png", 180, False, False),
            # 1024x1024, square, fully opaque (no alpha) — for Apple App Store Connect submission
            ("icon-1024-appstore.png", 1024, False, True)]
    for name, size, maskable, square in jobs:
        data = make_icon(size, maskable, square)
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(data)
        print("wrote", name, len(data), "bytes")


if __name__ == "__main__":
    main()
