import { getDict, type Lang } from "@/lib/i18n";
import { daily } from "@/lib/site";
import { Photo } from "../Photo";

export function Marquee({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const run = (copy: number) =>
    d.marquee.map((w, i) => (
      <span key={`${copy}-${i}`} className={i % 2 ? "marquee__item is-italic" : "marquee__item"} lang={i < 3 ? "el" : "en"}>
        {w}
        <span className="marquee__sep" aria-hidden="true">
          ·
        </span>
      </span>
    ));
  return (
    <div className="marquee" data-fx="velocity-marquee" data-speed="2" aria-hidden="true">
      <div className="marquee__inner">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}

export function Morning({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section id="morning" className="section morning" data-ground="day" aria-labelledby="morning-title">
      <div className="wrap morning__grid">
        <div className="morning__copy">
          <p className="time morning__time" aria-hidden="true">
            {d.morning.time}
          </p>
          <h2 id="morning-title" data-fx="masked-headline" data-split="words">
            {d.morning.title}
          </h2>
          <p className="lede" data-fx="fade-up">
            {d.morning.body}
          </p>
          <p className="caption caption--hand" data-fx="fade-up">
            {d.morning.note}
          </p>
        </div>
        <figure className="morning__hero">
          <div className="ph ph--arch" data-fx="clip-reveal">
            {/* drinks/126 opens the day strip right below, so the morning
                leads with the coffee tray instead of repeating it. */}
            <Photo id="drinks/023" lang={lang} sizes="(min-width: 1024px) 34vw, (min-width: 768px) 46vw, 88vw" />
          </div>
        </figure>
        <div className="morning__wide" data-parallax="-6">
          <div className="ph ph--round" data-fx="clip-reveal" data-dir="left">
            <Photo id="venue-day/072" lang={lang} sizes="(min-width: 1024px) 44vw, 92vw" />
          </div>
        </div>
        <div className="morning__small morning__small--a" data-parallax="10">
          <div className="ph ph--round" data-fx="clip-reveal">
            <Photo id="food/021" lang={lang} sizes="(min-width: 1024px) 18vw, 44vw" />
          </div>
        </div>
        <div className="morning__small morning__small--b" data-parallax="-4">
          <div className="ph ph--round" data-fx="clip-reveal">
            <Photo id="drinks/088" lang={lang} sizes="(min-width: 1024px) 18vw, 44vw" />
          </div>
        </div>
        <div className="morning__small morning__small--c" data-parallax="14">
          <div className="ph ph--round" data-fx="clip-reveal">
            <Photo id="venue-day/029" lang={lang} sizes="(min-width: 1024px) 20vw, 44vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

const DAY_PHOTOS = ["drinks/126", "venue-day/121", "venue-day/001", "venue-day/037"];
const DAY_FOCUS = ["50% 60%", "50% 50%", "50% 40%", "50% 50%"];

export function DayStrip({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section id="day" className="hday" data-fx="horizontal" data-ground="day" aria-labelledby="day-title">
      <div className="hday__track">
        <div className="hday__intro">
          <h2 id="day-title" data-fx="masked-headline" data-split="words">
            {d.day.title}
          </h2>
          <p className="lede">{d.day.intro}</p>
        </div>
        {d.day.panels.map((p, i) => (
          <article key={p.time} className="hday__panel">
            <div className="hday__media ph ph--round">
              {/* Lazy is safe here: the frame's size is fixed in CSS (height +
                  aspect-ratio), so a late image cannot shift the pin. Eager
                  would compete with the hero photo for bandwidth. */}
              <Photo id={DAY_PHOTOS[i]} lang={lang} sizes="(min-width: 1024px) 30vw, 60vw" focus={DAY_FOCUS[i]} />
            </div>
            <div className="hday__text">
              <p className="time hday__time">{p.time}</p>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="hday__progress" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

export function Daily({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const dish = daily[lang];
  return (
    <section id="daily" className="section daily" data-ground="mint" aria-labelledby="daily-title">
      <div className="wrap daily__wrap">
        {/* fade-up writes transform; the tilt lives on the card inside it. */}
        <div data-fx="fade-up">
        <article className="daily__card">
          <h2 id="daily-title" className="daily__label hand">
            {d.daily.label}
          </h2>
          <p className="daily__dish hand">{dish.name}</p>
          {dish.note && <p className="daily__note hand">{dish.note}</p>}
          {daily.price != null && (
            <p className="daily__price">
              {new Intl.NumberFormat(lang, { style: "currency", currency: "EUR" }).format(Number(daily.price))}
            </p>
          )}
          <p className="daily__hint">{d.daily.hint}</p>
        </article>
        </div>
      </div>
    </section>
  );
}
