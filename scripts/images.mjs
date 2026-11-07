// Image pipeline. Reads the untouched Facebook copies in assets/raw and writes
// responsive AVIF + WebP into public/img, plus src/data/photos.json (sizes and
// a placeholder colour for every photo) that the <Photo> component reads.
//
// Never upscales: each photo's srcset stops at its own width, so a 720px
// Facebook copy ships as 480 + 720 and nothing larger.
//
//   npm run images            (skips files that already exist)
//   npm run images -- --force

import { readdir, mkdir, writeFile, access, readFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW = path.join(ROOT, "assets/raw/navarino-facebook");
const OUT = path.join(ROOT, "public/img");
const BRAND = path.join(ROOT, "public/brand");
const APP = path.join(ROOT, "src/app");
const MANIFEST = path.join(ROOT, "src/data/photos.json");
const FORCE = process.argv.includes("--force");

const WIDTHS = [480, 720, 960, 1600, 2048];
/** Folders that become site photos. posters/ are flyers (text only) and are
    never published; people/ is excluded except the one staff photo. */
/** Only photos the site actually shows: every one of them has alt text in
    content/photos.json, so that file is the list. Nothing else is published. */
const USED = new Set(Object.keys(JSON.parse(await readFile(path.join(ROOT, "content/photos.json"), "utf8")).alt));

const exists = (p) => access(p).then(() => true, () => false);
const hex = ({ r, g, b }) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

async function photo(rel, manifest) {
  const src = path.join(RAW, rel);
  const [folder, file] = rel.split("/");
  const id = `${folder}/${file.replace(/\.jpg$/, "")}`;
  const img = sharp(src).rotate();
  const meta = await img.metadata();
  // .rotate() honours EXIF orientation, so report the displayed size.
  const swap = (meta.orientation ?? 1) >= 5;
  const w = swap ? meta.height : meta.width;
  const h = swap ? meta.width : meta.height;
  const widths = WIDTHS.filter((x) => x < w);
  if (!widths.includes(w) && w <= 2048) widths.push(w);
  if (w > 2048 && !widths.includes(2048)) widths.push(2048);

  await mkdir(path.join(OUT, folder), { recursive: true });
  for (const width of widths) {
    const base = path.join(OUT, folder, `${file.replace(/\.jpg$/, "")}-${width}`);
    if (!FORCE && (await exists(base + ".avif")) && (await exists(base + ".webp"))) continue;
    const resized = sharp(src).rotate().resize({ width, withoutEnlargement: true });
    await resized.clone().avif({ quality: 55, effort: 4 }).toFile(base + ".avif");
    await resized.clone().webp({ quality: 78 }).toFile(base + ".webp");
  }
  const { dominant } = await sharp(src).stats();
  manifest[id] = { w, h, widths, color: hex(dominant) };
  process.stdout.write(".");
}

/** Round badge: boat + girl + gull from logo-art/113, cropped, never redrawn.
    The circle sits between the wordmark's ρ tail (y≈295) and the orange
    "εστιατόριο • café" line (y≈1122); measured, see design/DESIGN.md. */
async function brand() {
  const src = path.join(RAW, "logo-art/113.jpg");
  const cx = 550, cy = 712, r = 410, d = r * 2;
  const circle = Buffer.from(
    `<svg width="${d}" height="${d}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
  );
  const badge = await sharp(src)
    .extract({ left: cx - r, top: cy - r, width: d, height: d })
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer();
  await mkdir(BRAND, { recursive: true });
  for (const s of [96, 192, 384, 512]) {
    await sharp(badge).resize(s, s).webp({ quality: 88 }).toFile(path.join(BRAND, `badge-${s}.webp`));
    await sharp(badge).resize(s, s).png({ palette: true, quality: 90, effort: 10 }).toFile(path.join(BRAND, `badge-${s}.png`));
  }
  // Favicon: 192px, palette PNG. (512px full-colour was 372 KB and loaded on every page.)
  await sharp(badge).resize(192, 192).png({ palette: true, quality: 85, effort: 10 }).toFile(path.join(APP, "icon.png"));
  await sharp(badge).resize(180, 180).flatten({ background: "#B9D2C6" }).png().toFile(path.join(APP, "apple-icon.png"));

  // Hand-lettered wordmark, cropped on its own watercolour ground.
  await sharp(src)
    .extract({ left: 110, top: 60, width: 910, height: 250 })
    .webp({ quality: 88 })
    .toFile(path.join(BRAND, "wordmark.webp"));
  console.log("\nbrand: badge + wordmark + icons");
}

const manifest = {};
for (const id of [...USED].sort()) await photo(`${id}.jpg`, manifest);
// Remove outputs of photos that are no longer used.
for (const folder of await readdir(OUT).catch(() => [])) {
  for (const f of await readdir(path.join(OUT, folder))) {
    const id = `${folder}/${f.replace(/-\d+\.(avif|webp)$/, "")}`;
    if (!USED.has(id)) await rm(path.join(OUT, folder, f));
  }
}
await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
console.log(`\n${Object.keys(manifest).length} photos -> public/img, manifest -> src/data/photos.json`);
await brand();
