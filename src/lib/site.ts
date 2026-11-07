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

/** The canonical origin. No domain has been given yet (README TODO), so URLs
    in sitemap/OG/hreflang use this placeholder until SITE_URL is set at build. */
export const SITE_URL = (process.env.SITE_URL ?? "https://example.com").replace(/\/$/, "");
