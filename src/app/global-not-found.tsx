import type { Metadata } from "next";
import { Shell, viewport } from "@/components/Shell";
import { Photo } from "@/components/Photo";
import { getDict, href } from "@/lib/i18n";

export const metadata: Metadata = { title: "404 · Ναυαρίνο", robots: { index: false } };
export { viewport };

/** One 404 for both languages (static hosting serves a single 404.html):
    Greek first, English beneath, the watercolour girl drifting in her boat. */
export default function GlobalNotFound() {
  const el = getDict("el").notFound;
  const en = getDict("en").notFound;
  return (
    <Shell lang="el">
      <section className="section nf" data-ground="mint" aria-labelledby="nf-title">
        <div className="wrap nf__grid">
          <figure className="nf__art">
            <Photo id="logo-art/118" lang="el" sizes="(min-width: 768px) 30vw, 70vw" priority />
          </figure>
          <div className="nf__copy">
            <p className="time nf__code" aria-hidden="true">404</p>
            <h1 id="nf-title">{el.title}</h1>
            <p className="lede">{el.body}</p>
            <a className="btn btn--coral" href={href("el")}>
              <span className="btn__label">{el.cta}</span>
            </a>
            <div lang="en" className="nf__en">
              <p className="nf__en-title display italic">{en.title}</p>
              <p>{en.body}</p>
              <a className="link" href={href("en")}>
                {en.cta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
