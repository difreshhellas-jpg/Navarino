import { NavigationArrowIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { getDict, href, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Photo } from "../Photo";

/**
 * Night hero: the particle sea (ogl, mounted by particleSea.ts into
 * [data-fx="particle-wave"]) behind «Ναυαρίνο», with night/128 framed in a
 * Cycladic arch. night/128 is a 720×960 Facebook copy, too small to fill a
 * desktop screen sharply, so it is framed rather than full-bleed; the arch
 * is also the static fallback (no WebGL / reduced motion).
 */
export function Hero({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section id="top" className="hero" data-ground="night" aria-labelledby="hero-title">
      <div className="hero__sea" data-fx="particle-wave" aria-hidden="true">
        <div className="hero__sea-still" />
      </div>
      <div className="hero__grid wrap">
        <div className="hero__copy">
          <p className="hero__kicker">{d.hero.kicker}</p>
          <h1 id="hero-title" className="hero__title display" data-fx="masked-headline" data-split="chars" data-trigger="load">
            {site.name[lang]}
          </h1>
          {lang === "en" && (
            <p className="hero__native display italic" lang="el">
              {site.name.el}
            </p>
          )}
          <p className="hero__slogan" data-fx="fade-up">
            {d.hero.slogan}
          </p>
          <div className="hero__ctas" data-fx="fade-up" data-stagger="0.08">
            <a className="btn btn--ghost" href={href(lang, "menu")}>
              <span className="btn__label">{d.ui.menu}</span>
            </a>
            <a className="btn btn--coral" href={`tel:${site.phone.tel}`} data-magnetic aria-label={d.ui.bookLabel}>
              <PhoneIcon aria-hidden="true" />
              <span className="btn__label">{d.ui.book}</span>
            </a>
            <a className="btn btn--ghost" href="#visit">
              <NavigationArrowIcon aria-hidden="true" />
              <span className="btn__label">{d.ui.directions}</span>
            </a>
          </div>
        </div>
        <figure className="hero__arch">
          <div className="ph ph--arch hero__photo">
            <Photo id="night/128" lang={lang} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 62vw" priority />
          </div>
          <figcaption className="caption hero__place">{d.hero.place}</figcaption>
        </figure>
      </div>
    </section>
  );
}
