/**
 * Turns the supplied NexuMotion PNG into web-ready logo assets.
 *
 * The source is 1830x576 with an alpha channel that is entirely opaque — the
 * background is real white pixels, not transparency. Dropped into the header
 * as-is it shows a white box in dark mode, and most of the canvas is empty
 * margin, so it renders tiny at any sensible height.
 *
 * This does three things:
 *   1. Keys out the white background, keeping a soft edge so the artwork does
 *      not get a jagged fringe.
 *   2. Crops to the actual content.
 *   3. Emits the full lockup and the circles-only mark separately, because a
 *      stacked logo does not fit a 64px header row on small screens.
 *
 * White-keying uses min(R,G,B) rather than luminance. The palette runs from
 * deep blue to pale yellow-green, and a luminance test would eat the lighter
 * circles; the minimum channel stays low for anything with colour in it and
 * only reaches 255 on true white. Pixels below the opaque threshold keep their
 * colour exactly — no un-premultiplying — so the brand colours are untouched.
 *
 * Run: npx tsx scripts/prepare-logo.ts [--commit]
 */
import { readFileSync, writeFileSync } from "fs";
import { deflateSync, inflateSync } from "zlib";

const SRC = "C:/Users/pc shop/Downloads/NexuMotion.png";
const COMMIT = process.argv.includes("--commit");

// Above TRANSPARENT the pixel is background; below OPAQUE it is artwork.
// Between the two, alpha ramps so antialiased edges stay smooth.
const TRANSPARENT = 250;
const OPAQUE = 205;

type Img = { w: number; h: number; data: Buffer };

function decodePng(buf: Buffer): Img {
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (buf[24] !== 8 || buf[25] !== 6) throw new Error("expected 8-bit RGBA PNG");

  let off = 8;
  const idat: Buffer[] = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    if (type === "IDAT") idat.push(buf.subarray(off + 8, off + 8 + len));
    if (type === "IEND") break;
    off += 12 + len;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);

  let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++];
    for (let x = 0; x < stride; x++) {
      const cur = raw[p + x];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v: number;
      switch (f) {
        case 0: v = cur; break;
        case 1: v = cur + a; break;
        case 2: v = cur + b; break;
        case 3: v = cur + ((a + b) >> 1); break;
        case 4: {
          const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
          v = cur + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: v = cur;
      }
      out[y * stride + x] = v & 255;
    }
    p += stride;
  }
  return { w, h, data: out };
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, body: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length);
  const typed = Buffer.concat([Buffer.from(type, "ascii"), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([len, typed, crc]);
}

function encodePng({ w, h, data }: Img): Buffer {
  const stride = w * 4;
  const bpp = 4;
  // Pick a filter per row using the standard minimum-sum-of-absolute-
  // differences heuristic. The logo is mostly smooth gradient, where Sub and
  // Paeth compress far better than None — with None the full lockup came out
  // at 477 KB, which is not a reasonable per-page download.
  const raw = Buffer.alloc(h * (stride + 1));
  const cand = [Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride),
                Buffer.alloc(stride), Buffer.alloc(stride)];
  for (let y = 0; y < h; y++) {
    const row = data.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? data.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      cand[0][x] = row[x];
      cand[1][x] = (row[x] - a) & 255;
      cand[2][x] = (row[x] - b) & 255;
      cand[3][x] = (row[x] - ((a + b) >> 1)) & 255;
      cand[4][x] = (row[x] - paeth) & 255;
    }
    let best = 0, bestScore = Infinity;
    for (let f = 0; f < 5; f++) {
      let score = 0;
      for (let x = 0; x < stride; x++) {
        const v = cand[f][x];
        score += v < 128 ? v : 256 - v;
      }
      if (score < bestScore) { bestScore = score; best = f; }
    }
    raw[y * (stride + 1)] = best;
    cand[best].copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function keyOutWhite(img: Img): Img {
  const out = Buffer.from(img.data);
  for (let i = 0; i < out.length; i += 4) {
    const m = Math.min(out[i], out[i + 1], out[i + 2]);
    let a: number;
    if (m >= TRANSPARENT) a = 0;
    else if (m <= OPAQUE) a = 255;
    else a = Math.round(((TRANSPARENT - m) / (TRANSPARENT - OPAQUE)) * 255);
    out[i + 3] = a;
  }
  return { ...img, data: out };
}

/** Bounding box of pixels with meaningful alpha. */
function contentBox(img: Img, x0 = 0, x1 = img.w) {
  let top = img.h, left = img.w, right = 0, bottom = 0;
  for (let y = 0; y < img.h; y++) {
    for (let x = x0; x < x1; x++) {
      if (img.data[(y * img.w + x) * 4 + 3] > 12) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  return { left, top, right, bottom };
}

function crop(img: Img, b: { left: number; top: number; right: number; bottom: number }, pad = 0): Img {
  const left = Math.max(0, b.left - pad);
  const top = Math.max(0, b.top - pad);
  const right = Math.min(img.w - 1, b.right + pad);
  const bottom = Math.min(img.h - 1, b.bottom + pad);
  const w = right - left + 1;
  const h = bottom - top + 1;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    img.data.copy(
      data,
      y * w * 4,
      ((top + y) * img.w + left) * 4,
      ((top + y) * img.w + left + w) * 4
    );
  }
  return { w, h, data };
}

/**
 * Area-average downscale. The source is far larger than any place it renders —
 * the header shows the lockup around 40px tall — so shipping 1121px wide costs
 * bandwidth on every page for detail nobody sees. Averaging over the source
 * box (rather than sampling a nearest pixel) keeps the thin outer circles from
 * breaking up, and keeps edges smooth without a separate blur pass.
 */
function downscale(img: Img, targetW: number): Img {
  if (targetW >= img.w) return img;
  const scale = img.w / targetW;
  const w = targetW;
  const h = Math.max(1, Math.round(img.h / scale));
  const data = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    const sy0 = Math.floor(y * scale);
    const sy1 = Math.min(img.h, Math.max(sy0 + 1, Math.floor((y + 1) * scale)));
    for (let x = 0; x < w; x++) {
      const sx0 = Math.floor(x * scale);
      const sx1 = Math.min(img.w, Math.max(sx0 + 1, Math.floor((x + 1) * scale)));
      // Average in premultiplied space, otherwise transparent pixels drag the
      // colour of the edge towards whatever their (meaningless) RGB happens
      // to be, which shows up as a dark halo.
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const i = (sy * img.w + sx) * 4;
          const al = img.data[i + 3] / 255;
          r += img.data[i] * al;
          g += img.data[i + 1] * al;
          b += img.data[i + 2] * al;
          a += img.data[i + 3];
          n++;
        }
      }
      const o = (y * w + x) * 4;
      const alpha = a / n;
      const un = alpha > 0 ? n / (a / 255) : 0;
      data[o] = Math.min(255, Math.round((r / n) * un));
      data[o + 1] = Math.min(255, Math.round((g / n) * un));
      data[o + 2] = Math.min(255, Math.round((b / n) * un));
      data[o + 3] = Math.round(alpha);
    }
  }
  return { w, h, data };
}

/**
 * Reversed (light) variant for dark surfaces.
 *
 * The wordmark is #085868 — near-black against the dark-mode header (#131c2e)
 * and the footer, so the full-colour logo cannot be used there.
 *
 * This flattens the artwork to a single near-white tint, keeping alpha so the
 * shapes and antialiasing survive. Recolouring only the *dark* pixels was the
 * obvious alternative, but the sphere carries a dark rim that would then get
 * lightened into a halo inside the ball. A single-colour reverse is the
 * conventional answer and reads cleanly at header size — though a proper
 * reversed logo from whoever drew this would beat it.
 */
function reversed(img: Img, tint: [number, number, number]): Img {
  const data = Buffer.from(img.data);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = tint[0];
    data[i + 1] = tint[1];
    data[i + 2] = tint[2];
  }
  return { ...img, data };
}

/**
 * Isolates the filled sphere for use as an icon.
 *
 * The full lockup is unreadable at 16px and the five-circle mark degrades into
 * a smudge, but the sphere is a single high-contrast shape that survives. It
 * is also the only part of the mark that is already square.
 *
 * Finding it by *solid fill* rather than by height: the sphere is the only
 * filled shape, so its columns carry a long run of opaque pixels, while the
 * outline circles contribute only two thin strokes and the "™" a few dozen
 * pixels near the top. Measuring vertical extent instead pulled in both the
 * ™ and an arc of the neighbouring circle, which at favicon size read as
 * smudges rather than as part of the mark.
 */
function sphereFrom(mark: Img): Img {
  const SOLID = 200; // alpha above which a pixel counts as filled

  const colFill = (x: number) => {
    let n = 0;
    for (let y = 0; y < mark.h; y++) if (mark.data[(y * mark.w + x) * 4 + 3] > SOLID) n++;
    return n;
  };

  // Anchor on the single most-filled column. That is necessarily the sphere's
  // centre — four overlapping rings can stack enough strokes to clear a fixed
  // threshold (which produced a box twice as wide as tall), but none of them
  // approaches a solid chord.
  let centreX = 0, maxFill = 0;
  for (let x = 0; x < mark.w; x++) {
    const n = colFill(x);
    if (n > maxFill) { maxFill = n; centreX = x; }
  }
  if (maxFill < mark.h * 0.5) return crop(mark, contentBox(mark)); // no sphere — fall back

  // The chord through the centre of a circle is its diameter, so the vertical
  // run at centreX gives both the extent and the size.
  let top = -1, bottom = -1;
  for (let y = 0; y < mark.h; y++) {
    if (mark.data[(y * mark.w + centreX) * 4 + 3] > SOLID) {
      if (top < 0) top = y;
      bottom = y;
    }
  }
  const d = bottom - top + 1;
  const half = Math.floor(d / 2);

  const box = crop(mark, {
    left: Math.max(0, centreX - half),
    top,
    right: Math.min(mark.w - 1, centreX + half),
    bottom,
  });

  // Mask to the inscribed circle. Cropping alone is not enough: the adjacent
  // ring and the ™ physically overlap the sphere's bounding box in the
  // artwork, and both survive a rectangular cut. The sphere is a circle, so
  // anything outside the radius is by definition not part of it. The one-pixel
  // ramp at the boundary keeps the edge from going jagged when downscaled.
  const cx = (box.w - 1) / 2;
  const cy = (box.h - 1) / 2;
  const r = Math.min(cx, cy);
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      const i = (y * box.w + x) * 4;
      if (dist > r) box.data[i + 3] = 0;
      else if (dist > r - 1.5) {
        box.data[i + 3] = Math.round(box.data[i + 3] * (r - dist) / 1.5);
      }
    }
  }
  return box;
}

/** Square canvas with a little breathing room, so the icon is not edge-to-edge. */
function padToSquare(img: Img, size: number, padRatio = 0.06): Img {
  const inner = Math.round(size * (1 - padRatio * 2));
  const scaled = downscale(img, inner);
  const data = Buffer.alloc(size * size * 4); // transparent
  const ox = Math.round((size - scaled.w) / 2);
  const oy = Math.round((size - scaled.h) / 2);
  for (let y = 0; y < scaled.h; y++) {
    scaled.data.copy(data, ((oy + y) * size + ox) * 4, y * scaled.w * 4, (y + 1) * scaled.w * 4);
  }
  return { w: size, h: size, data };
}

/**
 * Wraps a PNG in an ICO container.
 *
 * Kept alongside the modern icon.png because crawlers, feed readers and older
 * browsers request /favicon.ico directly rather than reading the link tag, and
 * would otherwise 404. ICO has allowed PNG payloads since Vista, so this is a
 * 22-byte header rather than a bitmap re-encode.
 */
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // 0 means 256
  entry[1] = size >= 256 ? 0 : size;
  entry[2] = 0; // palette colours
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // payload offset

  return Buffer.concat([header, entry, png]);
}

/** Most saturated colours present, as a read on the real brand palette. */
function sampleColours(img: Img) {
  const counts = new Map<string, number>();
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] < 200) continue;
    const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max - min < 25) continue; // skip greys
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, n]) => {
      const [r, g, b] = k.split(",").map((v) => (parseInt(v, 10) << 4) + 8);
      const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
      return `${hex}  (${n} px)`;
    });
}

function main() {
  const src = decodePng(readFileSync(SRC));
  console.log(`source        : ${src.w}x${src.h}`);

  const keyed = keyOutWhite(src);

  let transparent = 0;
  for (let i = 3; i < keyed.data.length; i += 4) if (keyed.data[i] === 0) transparent++;
  const pct = ((transparent / (keyed.w * keyed.h)) * 100).toFixed(1);
  console.log(`background    : ${pct}% now transparent`);

  // Full lockup.
  const full = crop(keyed, contentBox(keyed), 4);
  console.log(`full lockup   : ${full.w}x${full.h}  (ratio ${(full.w / full.h).toFixed(2)}:1)`);

  // The mark sits above the wordmark. Take the top band only, then trim it
  // horizontally — the circles are narrower than the word beneath them.
  const box = contentBox(keyed);
  const markBand = crop(keyed, { ...box, bottom: box.top + Math.round((box.bottom - box.top) * 0.58) });
  const mark = crop(markBand, contentBox(markBand), 4);
  console.log(`mark only     : ${mark.w}x${mark.h}  (ratio ${(mark.w / mark.h).toFixed(2)}:1)`);

  console.log("\nbrand colours found in the artwork:");
  for (const c of sampleColours(keyed)) console.log("  " + c);

  if (!COMMIT) {
    console.log("\nDRY RUN — re-run with --commit to write public/logo.png and public/logo-mark.png");
    return;
  }

  // Retina-generous but not absurd: the lockup renders ~150px wide in the
  // header and ~220px in the footer, so 560px covers 2x everywhere.
  const fullOut = downscale(full, 560);
  const markOut = downscale(mark, 320);

  // Pale rather than pure white, so it reads as brand rather than as a
  // system icon — it is the lightest swatch in the supplied palette.
  const LIGHT: [number, number, number] = [0xef, 0xf3, 0xc3];
  const fullLight = reversed(fullOut, LIGHT);

  writeFileSync("public/logo.png", encodePng(fullOut));
  writeFileSync("public/logo-light.png", encodePng(fullLight));
  writeFileSync("public/logo-mark.png", encodePng(markOut));

  // Icons, from the sphere at full source resolution so the downscale to each
  // size has detail to average rather than resampling an already-small image.
  const sphere = sphereFrom(mark);
  const icon256 = padToSquare(sphere, 256);
  const icon180 = padToSquare(sphere, 180);
  const icon64 = padToSquare(sphere, 64);

  // Written to public/, NOT src/app/. A metadata icon in the app directory
  // becomes a generated route with the image inlined into the Worker script;
  // three of them added ~190 KB of base64 and pushed the bundle past the
  // 3 MiB limit (Prisma's WASM engine already accounts for 2.24 MiB of it).
  // In public/ they are static assets served from the assets binding and
  // cost the Worker script nothing. layout.tsx declares them explicitly.
  writeFileSync("public/icon.png", encodePng(icon256));
  writeFileSync("public/apple-icon.png", encodePng(icon180));
  writeFileSync("public/favicon.ico", pngToIco(encodePng(icon64), 64));

  console.log(
    `\nwrote public/logo.png        ${fullOut.w}x${fullOut.h}` +
    `\nwrote public/logo-light.png  ${fullLight.w}x${fullLight.h}  (reversed, for dark surfaces)` +
    `\nwrote public/logo-mark.png   ${markOut.w}x${markOut.h}` +
    `\nwrote public/icon.png        256x256  (sphere ${sphere.w}x${sphere.h})` +
    `\nwrote public/apple-icon.png  180x180` +
    `\nwrote public/favicon.ico     64x64`
  );
}

main();
