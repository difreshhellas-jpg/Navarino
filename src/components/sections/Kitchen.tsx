import { existsSync } from "node:fs";
import path from "node:path";
import dish from "@content/dish-octopus.json";
import { getDict, type Lang } from "@/lib/i18n";
import { Photo } from "../Photo";

type Label = { key: string; at: number; x: number; y: number; lx: number; ly: number; wx: number; wy: number };

function Labels({ set, items, lang }: { set: "still" | "frames" | "frames-mobile"; items: Label[]; lang: Lang }) {
  const names = getDict(lang).kitchen.labels as Record<string, string>;
  return (
    <ul className="dish__labels" data-set={set} role="list" hidden={set !== "still"}>
      {items.map((l) => (
        <li
          key={l.key}
          data-at={l.at}
          data-side={l.lx > 50 ? "right" : "left"}
          // Where the desktop label hangs from its point: a label OUTSIDE the
          // photo extends away from it, one inside extends back into it.
          data-wide-side={l.wx > 100 || (l.wx >= 0 && l.wx <= 50) ? "right" : "left"}
          style={{
            ["--x" as string]: l.x,
            ["--y" as string]: l.y,
            ["--lx" as string]: l.lx,
            ["--ly" as string]: l.ly,
            ["--wx" as string]: l.wx,
            ["--wy" as string]: l.wy,
          }}
        >
          {/* The hairline is a 1px rule whose length and angle CSS computes
              (hypot/atan2 in container units), so it scales with the photo
              and draws in with a plain scaleX: no SVG dash maths. */}
          <span className="dish__rule" aria-hidden="true">
            <span className="dish__rule-ink" />
          </span>
          <span className="dish__dot" aria-hidden="true" />
          <span className="dish__tag">{names[l.key]}</span>
        </li>
      ))}
    </ul>
  );
}

/** Checked at build time (the site is static): the browser only ever asks for
    frames that exist, so there is no 404 for frames.json before the video. */
const HAS_FRAMES = existsSync(path.join(process.cwd(), "public", dish.frames, "frames.json"));

export function Kitchen({ lang }: { lang: Lang }) {
  const d = getDict(lang).kitchen;
  return (
    <>
      <section id="kitchen" className="section kitchen" data-ground="day" aria-labelledby="kitchen-title">
        <div className="wrap kitchen__intro">
          <p className="eyebrow">{d.eyebrow}</p>
          <h2 id="kitchen-title" data-fx="masked-headline" data-split="words">
            {d.title}
          </h2>
          <p className="lede" data-fx="fade-up">
            {d.body}
          </p>
        </div>
      </section>

      <section
        className="dish"
        data-fx="dish-sequence"
        data-frames={HAS_FRAMES ? dish.frames : undefined}
        data-ground="day"
        data-section
        id="octopus"
        aria-labelledby="dish-title"
      >
        <div className="dish__stage">
          <div className="dish__media" style={{ ["--dish-aspect" as string]: dish.still.aspect }}>
            <canvas className="dish__canvas" aria-hidden="true" />
            <div className="dish__still">
              <Photo id={dish.still.photo} lang={lang} sizes="(min-width: 1024px) 40vw, (min-width: 768px) 60vw, 86vw" />
            </div>
            <Labels set="still" items={dish.stillLabels} lang={lang} />
            {HAS_FRAMES && <Labels set="frames" items={dish.frameLabels} lang={lang} />}
            {HAS_FRAMES && <Labels set="frames-mobile" items={dish.frameLabelsMobile} lang={lang} />}
          </div>
          <div className="dish__copy">
            <h3 id="dish-title">{d.dishTitle}</h3>
            <p className="caption caption--hand">{d.dishCaption}</p>
          </div>
        </div>
      </section>

      <section className="section signature" data-ground="day" aria-labelledby="signature-title">
        <div className="wrap">
          <h2 id="signature-title" className="signature__title" data-fx="masked-headline" data-split="words">
            {d.signatureTitle}
          </h2>
          <ul className="signature__grid" role="list">
            {d.dishes.map((dish, i) => (
              <li key={dish.photo} className={`signature__item signature__item--${i + 1}`} data-parallax={[4, -6, 8, -4, 6, -8][i]}>
                <figure>
                  <div className="ph ph--round" data-fx="clip-reveal">
                    <Photo id={dish.photo} lang={lang} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" />
                  </div>
                  <figcaption className="signature__name">{dish.name}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <figure className="signature__pass">
            <div className="ph ph--round" data-fx="clip-reveal" data-dir="left">
              <Photo id="food/067" lang={lang} sizes="(min-width: 1024px) 70vw, 100vw" />
            </div>
            <figcaption className="caption caption--hand">{d.passCaption}</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
