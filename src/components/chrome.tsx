import { ClockIcon, FacebookLogoIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { fill, getDict, href, other, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Photo } from "./Photo";

type Route = "" | "menu";

export function Badge({ size = 44, className = "badge" }: { size?: number; className?: string }) {
  const src = size > 96 ? (size > 192 ? "/brand/badge-512.webp" : "/brand/badge-384.webp") : "/brand/badge-192.webp";
  return <img src={src} width={size} height={size} alt="" className={className} decoding="async" />;
}

export function Preloader({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <div
      className="preloader"
      data-fx="preloader"
      role="progressbar"
      aria-label={d.preloader.label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className="preloader__sails" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="preloader__sail" />
        ))}
      </div>
      <div className="preloader__inner" aria-hidden="true">
        <p className="preloader__word">{site.name[lang]}</p>
        <div className="preloader__line">
          <span className="preloader__fill" />
          <img className="preloader__boat" src="/brand/badge-192.webp" width={56} height={56} alt="" />
        </div>
      </div>
    </div>
  );
}

export function Header({ lang, route = "" }: { lang: Lang; route?: Route }) {
  const d = getDict(lang);
  const o = other(lang);
  return (
    <header className="hdr" data-fx="smart-header">
      <a className="hdr__brand" href={href(lang)} aria-label={`${site.name[lang]}, ${d.ui.home}`}>
        <Badge size={44} />
        <span className="hdr__word" aria-hidden="true">
          {site.name[lang]}
        </span>
      </a>
      <div className="hdr__actions">
        <a
          className="hdr__lang"
          href={href(o, route)}
          hrefLang={o}
          lang={o}
          data-lang-switch
          aria-label={d.ui.langSwitchLabel}
        >
          {d.ui.langSwitch}
        </a>
        <a className="btn btn--coral hdr__book" href={`tel:${site.phone.tel}`} data-magnetic aria-label={d.ui.bookLabel}>
          <PhoneIcon weight="regular" aria-hidden="true" />
          <span className="btn__label">{d.ui.book}</span>
        </a>
        <button
          type="button"
          className="burger"
          data-nav-toggle
          aria-expanded="false"
          aria-controls="site-nav"
          data-open-label={d.ui.openNav}
          data-close-label={d.ui.closeNav}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span className="sr-only">{d.ui.openNav}</span>
        </button>
      </div>
    </header>
  );
}

export function Nav({ lang, route = "" }: { lang: Lang; route?: Route }) {
  const d = getDict(lang);
  const o = other(lang);
  const a = site.address[lang];
  return (
    <nav id="site-nav" className="nav" data-fx="overlay-nav" aria-label={d.ui.menu}>
      <div className="nav__bg" />
      <div className="nav__grid wrap">
        <ul className="nav__links" role="list">
          {d.nav.map((item, i) => (
            <li key={item.id} className="nav__link">
              <a href={"href" in item && item.href ? href(lang, "menu") : `${href(lang)}#${item.id}`} data-preview={i}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav__preview" aria-hidden="true">
          {d.nav.map((item) => (
            <div key={item.id}>
              <Photo id={item.preview} lang={lang} sizes="(min-width: 768px) 34vw, 1px" decorative />
            </div>
          ))}
        </div>
        <div className="nav__meta">
          <p>
            {a.street}, {a.city}
          </p>
          <p>{fill(d.visit.hours, { opens: site.hours.opens, closes: site.hours.closes })}</p>
          <a className="link" href={`tel:${site.phone.tel}`}>
            {site.phone.display}
          </a>
          <a className="link" href={site.facebook} rel="noopener" target="_blank">
            {d.ui.facebook}
          </a>
          <a className="link" href={href(o, route)} hrefLang={o} lang={o} data-lang-switch aria-label={d.ui.langSwitchLabel}>
            {o === "en" ? "English" : "Ελληνικά"}
          </a>
        </div>
      </div>
    </nav>
  );
}

export function Footer({ lang, route = "" }: { lang: Lang; route?: Route }) {
  const d = getDict(lang);
  const o = other(lang);
  const a = site.address[lang];
  const year = new Date().getFullYear();
  return (
    <footer className="ftr" data-fx="footer-reveal" data-ground="night">
      <Photo id="night/131" lang={lang} sizes="100vw" className="ftr__bg" decorative />
      <div className="ftr__inner wrap">
        <p className="ftr__signoff display" aria-hidden="true">
          {d.footer.signoff}
        </p>
        <div className="ftr__cols">
          <a className="ftr__brand" href={href(lang)} aria-label={`${site.name[lang]}, ${d.ui.home}`}>
            <Badge size={96} />
            <span className="display">{site.name[lang]}</span>
          </a>
          <dl className="ftr__facts">
            <div>
              <dt>
                <MapPinIcon aria-hidden="true" /> {d.visit.addressLabel}
              </dt>
              <dd>
                {a.street}, {a.postcode} {a.city}
              </dd>
            </div>
            <div>
              <dt>
                <ClockIcon aria-hidden="true" /> {d.visit.hoursLabel}
              </dt>
              <dd>{fill(d.visit.hours, { opens: site.hours.opens, closes: site.hours.closes })}</dd>
            </div>
            <div>
              <dt>
                <PhoneIcon aria-hidden="true" /> {d.visit.phoneLabel}
              </dt>
              <dd>
                <a className="link" href={`tel:${site.phone.tel}`}>
                  {site.phone.display}
                </a>
              </dd>
            </div>
          </dl>
          <div className="ftr__links">
            <a className="btn btn--ghost" href={site.facebook} rel="noopener" target="_blank">
              <FacebookLogoIcon aria-hidden="true" />
              <span className="btn__label">{d.ui.facebook}</span>
            </a>
            <a className="btn btn--ghost" href={href(o, route)} hrefLang={o} lang={o} data-lang-switch aria-label={d.ui.langSwitchLabel}>
              <span className="btn__label">{o === "en" ? "English" : "Ελληνικά"}</span>
            </a>
          </div>
        </div>
        <div className="ftr__base">
          <p>
            © {year} {d.footer.rights}
          </p>
          <p>{site.credit.label}</p>
          <a className="link" href="#top">
            {d.ui.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
