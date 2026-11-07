import manifest from "@/data/photos.json";
import content from "@content/photos.json";
import type { Lang } from "./i18n";

export type PhotoId = keyof typeof manifest;
type Meta = { w: number; h: number; widths: number[]; color: string };

const m = manifest as Record<string, Meta>;
const alts = content.alt as Record<string, { el: string; en: string }>;

export function photo(id: string): Meta {
  const meta = m[id];
  if (!meta) throw new Error(`Unknown photo "${id}". Run npm run images, or check the id.`);
  return meta;
}

/** "/img/night/128-480.avif 480w, …" */
export function srcset(id: string, ext: "avif" | "webp"): string {
  const [folder, num] = id.split("/");
  return photo(id)
    .widths.map((w) => `/img/${folder}/${num}-${w}.${ext} ${w}w`)
    .join(", ");
}

/** The largest file of a photo, for <img src>, OG tags and preloads. */
export function largest(id: string, ext: "avif" | "webp" = "webp", cap = Infinity): string {
  const [folder, num] = id.split("/");
  const ws = photo(id).widths.filter((w) => w <= cap);
  return `/img/${folder}/${num}-${ws[ws.length - 1] ?? photo(id).widths[0]}.${ext}`;
}

export function alt(id: string, lang: Lang): string {
  const a = alts[id];
  if (!a) throw new Error(`No alt text for "${id}" in content/photos.json`);
  return a[lang];
}

export const galleryIds: string[] = content.gallery;
