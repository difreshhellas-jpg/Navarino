// Video → scroll-sequence frames for the dish hero.
//
//   node scripts/frames.mjs <wide.mp4> [tall.mp4] [--count 120] [--out public/frames/octopus]
//
// Frames are taken at EQUAL TIME intervals over the whole clip, encoded as
// AVIF (primary) + WebP (fallback) at the video's own width (never upscaled),
// and frames.json is written next to them: that file is what switches the
// Kitchen section from the still photo to the sequence (at the next build).

import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const COUNT = parseInt(opt("--count", "120"), 10);
const OUT = path.resolve(ROOT, opt("--out", "public/frames/octopus"));
const [wide, tall] = args;

const fail = (msg) => {
  console.error(`frames: ${msg}`);
  process.exit(1);
};
if (!wide) fail("give at least the 16:9 video: node scripts/frames.mjs <wide.mp4> [tall.mp4]");
for (const f of [wide, tall].filter(Boolean)) if (!existsSync(f)) fail(`no such file: ${f}`);
try {
  execFileSync("ffprobe", ["-version"], { stdio: "ignore" });
} catch {
  fail("ffmpeg/ffprobe not found on PATH");
}

function probe(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration", "-of", "json", file,
  ]).toString();
  const j = JSON.parse(out);
  return { w: j.streams[0].width, h: j.streams[0].height, dur: parseFloat(j.format.duration) };
}

async function run(file, dir) {
  const { w, h, dur } = probe(file);
  const tmp = path.join(os.tmpdir(), `navarino-frames-${process.pid}-${path.basename(dir)}`);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  // Equal time intervals: fps = COUNT / duration, lossless PNG intermediates.
  execFileSync("ffmpeg", [
    "-v", "error", "-i", file,
    "-vf", `fps=${COUNT}/${dur}`,
    "-frames:v", String(COUNT),
    path.join(tmp, "f-%04d.png"),
  ]);
  const pngs = (await readdir(tmp)).filter((f) => f.endsWith(".png")).sort();
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  let avif = 0;
  let webp = 0;
  for (const [i, f] of pngs.entries()) {
    const base = path.join(dir, `frame-${String(i + 1).padStart(4, "0")}`);
    const img = sharp(path.join(tmp, f));
    await img.clone().avif({ quality: 58, effort: 4 }).toFile(`${base}.avif`);
    await img.clone().webp({ quality: 78 }).toFile(`${base}.webp`);
    avif += (await stat(`${base}.avif`)).size;
    webp += (await stat(`${base}.webp`)).size;
    if (i % 20 === 0) process.stdout.write(".");
  }
  await rm(tmp, { recursive: true, force: true });
  const mb = (b) => (b / 1048576).toFixed(1);
  console.log(`\n${path.relative(ROOT, dir)}: ${pngs.length} frames ${w}×${h}, AVIF ${mb(avif)} MB, WebP ${mb(webp)} MB`);
  if (avif > 8 * 1048576) console.warn("  warning: AVIF set over 8 MB; consider --count 90");
  return { count: pngs.length, aspect: +(w / h).toFixed(4) };
}

const desktop = await run(path.resolve(wide), OUT);
const manifest = { count: desktop.count, pad: 4, formats: ["avif", "webp"], aspect: desktop.aspect };
if (tall) {
  const mobile = await run(path.resolve(tall), path.join(OUT, "mobile"));
  manifest.mobile = { count: mobile.count, aspect: mobile.aspect };
}
await writeFile(path.join(OUT, "frames.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`frames.json: ${JSON.stringify(manifest)}`);
console.log("Rebuild the site (npm run build) for the Kitchen section to switch to the sequence.");
