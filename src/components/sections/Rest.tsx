import {
  ArrowUpRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  FacebookLogoIcon,
  MapPinIcon,
  MusicNotesIcon,
  PhoneIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import menu from "@content/menu.json";
import { fill, getDict, href, type Lang } from "@/lib/i18n";
import { alt, galleryIds, largest, photo, srcset } from "@/lib/photos";
import { reviews, site, upcomingEvents } from "@/lib/site";
import { Photo } from "../Photo";

/* ------------------------------------------------------------------ */

export function MenuTeaser({ lang }: { lang: Lang }) {
  const d = getDict(lang).menuTeaser;
  const cats = menu.categories.filter((c) => c.photo);
  return (
    <section id="menu" className="section teaser" data-ground="day" aria-labelledby="teaser-title">
      <div className="wrap">
        <div className="teaser__head">
          <p className="eyebrow">{d.eyebrow}</p>
          <h2 id="teaser-title" data-fx="masked-headline" data-split="words">
            {d.title}
          </h2>
          <p className="lede muted">{d.body}</p>
        </div>
        <div className="show" data-fx="menu-showcase">
          <div className="show__tabs" role="tablist" aria-label={getDict(lang).menuPage.tabsLabel}>
            {cats.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-controls={`panel-${c.id}`}
                aria-selected={i === 0}
                tabIndex={i === 0 ? 0 : -1}
                className="show__tab display"
              >
                {c[lang]}
                {i === 0 && <span className="show__indicator" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <div className="show__stage ph ph--round" aria-hidden="true">
            {cats.map((c) => (
              <div key={c.id}>
                <Photo id={c.photo!} lang={lang} sizes="(min-width: 1024px) 40vw, 92vw" decorative />
              </div>
            ))}
          </div>
          <div className="show__panels">
            {cats.map((c, i) => (
              <div key={c.id} id={`panel-${c.id}`} role="tabpanel" aria-labelledby={`tab-${c.id}`} className="show__panel" hidden={i !== 0}>
                <ul role="list">
                  {c.items.slice(0, 5).map((it) => (
                    <li key={it.el}>{it[lang]}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <a className="btn btn--ghost teaser__cta" href={href(lang, "menu")} data-magnetic>
          <span className="btn__label">{d.cta}</span>
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const HOUSE = [
  { id: "venue-day/011", p: -6, cls: "house__a" },
  { id: "venue-day/106", p: 10, cls: "house__b" },
  { id: "venue-day/096", p: -10, cls: "house__c" },
  { id: "venue-day/049", p: 6, cls: "house__d" },
  { id: "venue-day/098", p: -4, cls: "house__e" },
  { id: "venue-day/045", p: 8, cls: "house__f" },
  { id: "venue-day/089", p: -8, cls: "house__g" },
  { id: "venue-day/107", p: 12, cls: "house__h" },
];

export function House({ lang }: { lang: Lang }) {
  const d = getDict(lang).house;
  return (
    <section id="house" className="section house" data-ground="day" aria-labelledby="house-title">
      <div className="wrap house__grid">
        <div className="house__copy">
          <p className="eyebrow">{d.eyebrow}</p>
          <h2 id="house-title" data-fx="masked-headline" data-split="words">
            {d.title}
          </h2>
          <p className="lede" data-fx="fade-up">
            {d.body}
          </p>
        </div>
        {HOUSE.map((h) => (
          <div key={h.id} className={`house__ph ${h.cls}`} data-parallax={h.p}>
            <div className="ph ph--round" data-fx="clip-reveal">
              <Photo id={h.id} lang={lang} sizes="(min-width: 1024px) 28vw, 46vw" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Story({ lang }: { lang: Lang }) {
  const d = getDict(lang).story;
  const [before, after] = d.body.split(d.highlight);
  const showTodo = process.env.NODE_ENV !== "production" || process.env.SHOW_TODOS === "1";
  return (
    <section id="story" className="section story" data-ground="mint" aria-labelledby="story-title">
      <div className="wrap story__grid">
        <figure className="story__art">
          <div className="story__wash" data-fx="clip-reveal" data-dir="down">
            <Photo id="logo-art/118" lang={lang} sizes="(min-width: 1024px) 30vw, 70vw" />
          </div>
        </figure>
        <div className="story__copy">
          <p className="eyebrow">{d.eyebrow}</p>
          <h2 id="story-title" data-fx="masked-headline" data-split="words">
            {d.title}
          </h2>
          <p className="story__text display" data-fx="text-highlight">
            {before}
            <mark>{d.highlight}</mark>
            {after}
          </p>
          {showTodo && (
            <aside className="todo" role="note">
              {d.ownerTodo}
            </aside>
          )}
        </div>
        <figure className="story__boat" data-parallax="-8">
          <div className="ph ph--round" data-fx="clip-reveal" data-dir="left">
            <Photo id="venue-day/064" lang={lang} sizes="(min-width: 1024px) 40vw, 92vw" />
          </div>
          <figcaption className="caption caption--hand">{d.boatCaption}</figcaption>
        </figure>
        <figure className="story__ribs" data-parallax="10">
          <div className="ph ph--round" data-fx="clip-reveal">
            <Photo id="night/129" lang={lang} sizes="(min-width: 1024px) 26vw, 60vw" />
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Evening({ lang }: { lang: Lang }) {
  const d = getDict(lang).evening;
  const events = upcomingEvents();
  const dateFmt = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" });
  return (
    <section id="evening" className="section evening" data-ground="night" aria-labelledby="evening-title">
      <div className="wrap evening__grid">
        <div className="evening__copy">
          <p className="eyebrow">{d.eyebrow}</p>
          <h2 id="evening-title" data-fx="masked-headline" data-split="words">
            {d.title}
          </h2>
          <p className="lede" data-fx="fade-up">
            {d.body}
          </p>
        </div>
        <figure className="evening__a" data-parallax="-6">
          <div className="ph ph--arch" data-fx="clip-reveal">
            <Photo id="night/124" lang={lang} sizes="(min-width: 1024px) 30vw, 62vw" />
          </div>
        </figure>
        <figure className="evening__b" data-parallax="8">
          <div className="ph ph--round" data-fx="clip-reveal" data-dir="left">
            <Photo id="night/004" lang={lang} sizes="(min-width: 1024px) 34vw, 70vw" />
          </div>
        </figure>
        <figure className="evening__c" data-parallax="-10">
          <div className="ph ph--round" data-fx="clip-reveal">
            <Photo id="night/117" lang={lang} sizes="(min-width: 1024px) 22vw, 46vw" />
          </div>
        </figure>

        <div className="live" data-ground-inner="emerald">
          <div className="live__media ph ph--round" data-fx="clip-reveal" data-dir="right">
            <Photo id="night/016" lang={lang} sizes="(min-width: 1024px) 36vw, 92vw" />
          </div>
          <div className="live__copy">
            <h3 className="live__title display">
              <MusicNotesIcon aria-hidden="true" /> {d.liveTitle}
            </h3>
            <p>{d.liveBody}</p>
            {events.length ? (
              <ul className="live__events" role="list">
                {events.map((e) => (
                  <li key={`${e.date}-${e[lang].title}`}>
                    <time dateTime={e.date}>
                      {dateFmt.format(new Date(`${e.date}T12:00:00`))}
                      {e.time ? ` · ${e.time}` : ""}
                    </time>
                    <p className="live__event-title">{e[lang].title}</p>
                    {e[lang].detail && <p className="muted">{e[lang].detail}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="live__empty">
                <p className="hand">{d.eventsEmpty}</p>
                <a className="btn btn--ghost" href={site.facebook} rel="noopener" target="_blank">
                  <FacebookLogoIcon aria-hidden="true" />
                  <span className="btn__label">{d.eventsEmptyCta}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const monthFmt = (lang: Lang) => new Intl.DateTimeFormat(lang === "el" ? "el-GR" : "en-GB", { month: "long", year: "numeric" });

export function Reviews({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const r = d.reviews;
  const fmt = new Intl.NumberFormat(lang === "el" ? "el-GR" : "en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <section id="reviews" className="section reviews" data-ground="emerald" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className="reviews__head">
          <p className="eyebrow">{r.eyebrow}</p>
          <h2 id="reviews-title" data-fx="masked-headline" data-split="words">
            {r.title}
          </h2>
        </div>
        <dl className="reviews__stats">
          <div>
            <dt className="sr-only">{r.ratingLabel}</dt>
            <dd>
              <span className="reviews__num display" data-fx="counter" data-to={site.tripadvisor.rating} data-decimals="1" aria-hidden="true">
                {fmt.format(site.tripadvisor.rating)}
              </span>
              <span className="sr-only">
                {fmt.format(site.tripadvisor.rating)} {r.outOf}
              </span>
              <span className="reviews__unit" aria-hidden="true">
                {r.outOf} · {r.ratingLabel}
              </span>
            </dd>
          </div>
          <div>
            <dt className="sr-only">{r.countLabel}</dt>
            <dd>
              <span className="reviews__num display" data-fx="counter" data-to={site.tripadvisor.count} aria-hidden="true">
                {site.tripadvisor.count}
              </span>
              <span className="sr-only">{site.tripadvisor.count}</span>
              <span className="reviews__unit">{r.countLabel}</span>
            </dd>
          </div>
        </dl>
        <ul className="reviews__list" role="list" data-fx="fade-up" data-stagger="0.08">
          {reviews.items.map((q, i) => (
            <li key={q.author + q.date} className={`review review--${i + 1}`}>
              <figure>
                <blockquote lang="en">
                  <p className="display italic">“{q.quote}”</p>
                </blockquote>
                <figcaption>
                  <span>{q.author}</span> · <time dateTime={q.date}>{monthFmt(lang).format(new Date(`${q.date}-15T12:00:00`))}</time>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <a className="btn btn--ghost reviews__cta" href={site.tripadvisor.url} rel="noopener" target="_blank">
          <span className="btn__label">{d.ui.readOnTripadvisor}</span>
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Gallery({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section id="gallery" className="section gallery" data-ground="night" aria-labelledby="gallery-title">
      <div className="wrap">
        <div className="gallery__head">
          <p className="eyebrow">{d.gallery.eyebrow}</p>
          <h2 id="gallery-title" data-fx="masked-headline" data-split="words">
            {d.gallery.title}
          </h2>
        </div>
        <ul className="gallery__grid" role="list">
          {galleryIds.map((id, i) => {
            const m = photo(id);
            return (
              <li key={id} className="gallery__item">
                <button
                  type="button"
                  className="gallery__btn"
                  data-lightbox-index={i}
                  data-avif={srcset(id, "avif")}
                  data-webp={srcset(id, "webp")}
                  data-src={largest(id, "webp")}
                  data-w={m.w}
                  data-h={m.h}
                  data-alt={alt(id, lang)}
                  aria-label={`${d.gallery.open}: ${alt(id, lang)}`}
                >
                  <Photo id={id} lang={lang} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 46vw" className="gallery__pic" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <dialog className="lb" data-fx="lightbox" aria-label={d.gallery.title}>
        <figure className="lb__figure">
          <picture>
            <source type="image/avif" sizes="92vw" />
            <source type="image/webp" sizes="92vw" />
            <img alt="" />
          </picture>
          <figcaption className="lb__caption" />
        </figure>
        <p className="lb__count" aria-live="polite" data-template={d.ui.photoOf} />
        <button type="button" className="lb__btn lb__prev" data-lb="prev" aria-label={d.ui.prev}>
          <CaretLeftIcon aria-hidden="true" />
        </button>
        <button type="button" className="lb__btn lb__next" data-lb="next" aria-label={d.ui.next}>
          <CaretRightIcon aria-hidden="true" />
        </button>
        <button type="button" className="lb__btn lb__close" data-lb="close" aria-label={d.ui.close} autoFocus>
          <XIcon aria-hidden="true" />
        </button>
      </dialog>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Visit({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const a = site.address[lang];
  return (
    <section id="visit" className="section visit" data-ground="night" aria-labelledby="visit-title">
      <div className="wrap visit__grid">
        <div className="visit__copy">
          <p className="eyebrow">{d.visit.eyebrow}</p>
          <h2 id="visit-title" data-fx="masked-headline" data-split="words">
            {d.visit.title}
          </h2>
          <dl className="visit__facts" data-fx="fade-up" data-stagger="0.08">
            <div>
              <dt>
                <MapPinIcon aria-hidden="true" /> {d.visit.addressLabel}
              </dt>
              <dd>
                {a.street}, {a.postcode} {a.city}
                <br />
                <span className="muted">{a.note}</span>
              </dd>
            </div>
            <div>
              <dt>
                <PhoneIcon aria-hidden="true" /> {d.visit.phoneLabel}
              </dt>
              <dd>
                <a className="link visit__phone display" href={`tel:${site.phone.tel}`}>
                  {site.phone.display}
                </a>
              </dd>
            </div>
            <div>
              <dt>
                <ClockIcon aria-hidden="true" /> {d.visit.hoursLabel}
              </dt>
              <dd>{fill(d.visit.hours, { opens: site.hours.opens, closes: site.hours.closes })}</dd>
            </div>
          </dl>
          <div className="visit__ctas">
            <a className="btn btn--coral" href={`tel:${site.phone.tel}`} data-magnetic aria-label={d.ui.bookLabel}>
              <PhoneIcon aria-hidden="true" />
              <span className="btn__label">{d.ui.book}</span>
            </a>
            <a className="btn btn--ghost" href={site.maps.google} rel="noopener" target="_blank">
              <span className="btn__label">{d.ui.googleMaps}</span>
              <ArrowUpRightIcon aria-hidden="true" />
            </a>
            <a className="btn btn--ghost" href={site.maps.apple} rel="noopener" target="_blank">
              <span className="btn__label">{d.ui.appleMaps}</span>
              <ArrowUpRightIcon aria-hidden="true" />
            </a>
            <a className="btn btn--ghost" href={site.facebook} rel="noopener" target="_blank">
              <FacebookLogoIcon aria-hidden="true" />
              <span className="btn__label">{d.ui.facebook}</span>
            </a>
          </div>
        </div>
        <figure className="visit__road" data-parallax="-6">
          <div className="ph ph--arch" data-fx="clip-reveal">
            {/* night/122 carries a text overlay; 127 is the same shot without it. */}
            <Photo id="night/127" lang={lang} sizes="(min-width: 1024px) 30vw, 70vw" />
          </div>
        </figure>
        <figure className="visit__path" data-parallax="10">
          <div className="ph ph--round" data-fx="clip-reveal">
            <Photo id="venue-day/048" lang={lang} sizes="(min-width: 1024px) 20vw, 44vw" />
          </div>
        </figure>
      </div>
    </section>
  );
}
