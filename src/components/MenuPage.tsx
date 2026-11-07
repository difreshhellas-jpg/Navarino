import menu from "@content/menu.json";
import { getDict, type Lang } from "@/lib/i18n";
import { largest } from "@/lib/photos";
import { Photo } from "./Photo";

type Item = { el: string; en: string; descEl?: string; descEn?: string; price: number | number[] | null; photo?: string };
type Cat = { id: string; el: string; en: string; noteEl?: string; noteEn?: string; photo: string | null; items: Item[] };

/**
 * /menu — the client's printed menu, transcribed into content/menu.json. Sticky category tabs with a scroll spy; rows with a
 * real photo get the hover-follow image on desktop and a thumbnail on touch.
 * A null price is simply not shown; a list of prices reads "2,50 € / 3,50 €".
 */
export function MenuPage({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const price = new Intl.NumberFormat(lang === "el" ? "el-GR" : "en-GB", { style: "currency", currency: "EUR" });
  const fmt = (p: number | number[]) => (Array.isArray(p) ? p : [p]).map((x) => price.format(x)).join(" / ");
  const cats = menu.categories as Cat[];
  const anyPrice = cats.some((c) => c.items.some((i) => i.price != null));
  return (
    <>
      <section id="top" className="section menu-hero" data-ground="night" aria-labelledby="menu-title">
        <div className="wrap">
          <p className="eyebrow">{d.menuPage.eyebrow}</p>
          <h1 id="menu-title" className="display menu-hero__title" data-fx="masked-headline" data-split="words" data-trigger="load">
            {d.menuPage.title}
          </h1>
          <p className="lede">{d.menuPage.intro}</p>
          {!anyPrice && <p className="caption caption--hand">{d.menuPage.priceNote}</p>}
        </div>
      </section>

      <nav className="mtabs" data-fx="menu-tabs" aria-label={d.menuPage.tabsLabel}>
        <div className="mtabs__scroll">
          {cats.map((c, i) => (
            <a key={c.id} href={`#${c.id}`} aria-current={i === 0 ? "true" : undefined}>
              {c[lang]}
              {i === 0 && <span className="mtabs__ink" aria-hidden="true" />}
            </a>
          ))}
        </div>
      </nav>

      <div className="menu-body" data-ground="day">
        {cats.map((c) => (
          <section key={c.id} id={c.id} className="mcat wrap" aria-labelledby={`h-${c.id}`}>
            <div className="mcat__head">
              <h2 id={`h-${c.id}`} data-fx="masked-headline" data-split="words">
                {c[lang]}
              </h2>
              {(lang === "el" ? c.noteEl : c.noteEn) && <p className="mcat__note caption">{lang === "el" ? c.noteEl : c.noteEn}</p>}
              {c.photo && (
                <div className="mcat__photo ph ph--round" data-fx="clip-reveal">
                  <Photo id={c.photo} lang={lang} sizes="(min-width: 1024px) 26vw, 92vw" />
                </div>
              )}
            </div>
            <ul className="mrows" role="list" data-fx="hover-follow">
              {c.items.map((it) => (
                <li key={it.el} className="mrow" data-img={it.photo ? largest(it.photo, "webp", 960) : undefined}>
                  {it.photo && (
                    <div className="mrow__thumb ph ph--round" aria-hidden="true">
                      <Photo id={it.photo} lang={lang} sizes="72px" decorative />
                    </div>
                  )}
                  <div className="mrow__text">
                    <h3 className="mrow__name">{it[lang]}</h3>
                    {(lang === "el" ? it.descEl : it.descEn) && <p className="mrow__desc">{lang === "el" ? it.descEl : it.descEn}</p>}
                    {lang === "en" && (
                      <p className="mrow__native" lang="el">
                        {it.el}
                      </p>
                    )}
                  </div>
                  {it.price != null && <p className="mrow__price">{fmt(it.price)}</p>}
                </li>
              ))}
              <li className="follow" aria-hidden="true">
                <div className="follow__frame" />
              </li>
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
