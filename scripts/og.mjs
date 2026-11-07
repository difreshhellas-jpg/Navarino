// Open Graph images (1200×630), one per language: the logo's own mint ground
// with the badge and the hand-lettered wordmark, night/128 on the right.
// Run after scripts/images.mjs (needs public/brand).
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW = path.join(ROOT, "assets/raw/navarino-facebook");
const OUT = path.join(ROOT, "public/og");
await mkdir(OUT, { recursive: true });

const W = 1200, H = 630, RIGHT = 470;
const photo = await sharp(path.join(RAW, "night/128.jpg")).rotate().resize(RIGHT, H, { fit: "cover", position: "centre" }).toBuffer();
const badge = await sharp(path.join(ROOT, "public/brand/badge-512.png")).resize(250, 250).toBuffer();
// The hand-lettered wordmark, keyed out of its paper (scripts: see README):
// the real strokes as an alpha mask, nothing redrawn.
const word = await sharp(path.join(ROOT, "public/brand/wordmark-key.png")).resize(560).toBuffer();
const lines = {
  el: "εστιατόριο • café · Ξυλόκαστρο",
  en: "restaurant • café · Xylokastro",
};
for (const lang of ["el", "en"]) {
  const tag = Buffer.from(
    `<svg width="${W - RIGHT}" height="60" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="40" text-anchor="middle" font-family="Georgia, 'Noto Serif', serif" font-style="italic" font-size="30" fill="#c4552f">${lines[lang]}</text></svg>`,
  );
  await sharp({ create: { width: W, height: H, channels: 3, background: "#bfd1c6" } })
    .composite([
      { input: photo, left: W - RIGHT, top: 0 },
      { input: badge, left: Math.round((W - RIGHT - 250) / 2), top: 40 },
      { input: word, left: Math.round((W - RIGHT - 560) / 2), top: 300 },
      { input: tag, left: 0, top: 480 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT, `og-${lang}.jpg`));
}
console.log("og: public/og/og-el.jpg, og-en.jpg");
