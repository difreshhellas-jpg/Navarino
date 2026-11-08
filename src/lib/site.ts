import site from "@content/site.json";
import daily from "@content/daily.json";
import events from "@content/events.json";
import reviews from "@content/reviews.json";

export { site, daily, reviews };

export type EventItem = {
  date: string;
  time?: string;
  el: { title: string; detail?: string };
  en: { title: string; detail?: string };
};

/** Upcoming events only, evaluated at build time (the site is static). */
export function upcomingEvents(): EventItem[] {
  const today = new Date().toISOString().slice(0, 10);
  return (events.items as EventItem[]).filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

/** The canonical origin, used in canonical links, hreflang, the sitemap and
    Open Graph. The bare domain redirects to www, so www is the canonical one.
    SITE_URL at build overrides it (e.g. for a staging copy). */
export const SITE_URL = (process.env.SITE_URL || "https://www.navarino-xylokastro.com").replace(/\/$/, "");
