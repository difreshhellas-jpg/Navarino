import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const pair = (path: string) => ({
  el: `${SITE_URL}${path}`,
  en: `${SITE_URL}/en${path}`,
});

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["/", "/menu/"].flatMap((p) => {
    const langs = pair(p);
    return [
      { url: langs.el, lastModified: now, changeFrequency: "weekly", priority: p === "/" ? 1 : 0.8, alternates: { languages: langs } },
      { url: langs.en, lastModified: now, changeFrequency: "weekly", priority: p === "/" ? 0.9 : 0.7, alternates: { languages: langs } },
    ];
  });
}
