import type { Lang } from "@/lib/i18n";
import { Hero } from "./sections/Hero";
import { Daily, DayStrip, Marquee, Morning } from "./sections/Day";
import { Kitchen } from "./sections/Kitchen";
import { Evening, Gallery, House, MenuTeaser, Reviews, Story, Visit } from "./sections/Rest";

/**
 * One day at Navarino, top to bottom: night hero → bright morning → the day
 * strip → kitchen → the house → story → emerald night → reviews → visit.
 * Hero-weight effects (particle sea, day strip pin, dish sequence) are never
 * back to back: a free-scrolling section always sits between two of them.
 */
export function Home({ lang }: { lang: Lang }) {
  return (
    <>
      <Hero lang={lang} />
      <Marquee lang={lang} />
      <Morning lang={lang} />
      <DayStrip lang={lang} />
      <Daily lang={lang} />
      <Kitchen lang={lang} />
      <MenuTeaser lang={lang} />
      <House lang={lang} />
      <Story lang={lang} />
      <Evening lang={lang} />
      <Reviews lang={lang} />
      <Gallery lang={lang} />
      <Visit lang={lang} />
    </>
  );
}
