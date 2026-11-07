import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@fontsource/noto-serif-display/300.css";
import "@fontsource/noto-serif-display/300-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
// Mynerve (handwritten notes) is registered after load by MotionRoot: nothing
// in the first screen uses it, and its Latin file alone is 61 KB.
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/chrome.css";
import "@/styles/sections.css";

import MotionRoot from "@/components/fx/MotionRoot";
import { Footer, Header, Nav, Preloader } from "@/components/chrome";
import { getDict, href, htmlLang, ogLocale, type Lang } from "@/lib/i18n";
import { SITE_URL, site } from "@/lib/site";

type Route = "" | "menu";

/** Runs before first paint. Marks JS on (so reveals start hidden, no flash),
    skips the preloader for anyone who has seen it this session or prefers
    reduced motion, and un-hides everything if the motion bundle never starts. */
const PREPAINT = `(function(){var d=document.documentElement;d.classList.add('js');try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r)d.classList.add('reduced-motion');if(r||sessionStorage.getItem('navarino.intro'))d.dataset.intro='skip'}catch(e){d.dataset.intro='skip'}setTimeout(function(){if(!window.__motion){d.classList.remove('js');d.dataset.intro='skip'}},4000)})()`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08191a",
  colorScheme: "light dark",
};

export function pageMetadata(lang: Lang, route: Route = ""): Metadata {
  const d = getDict(lang);
  const title = route === "menu" ? d.meta.menuTitle : d.meta.title;
  const description = route === "menu" ? d.meta.menuDescription : d.meta.description;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: href(lang, route),
      languages: { el: href("el", route), en: href("en", route), "x-default": href("el", route) },
    },
    openGraph: {
      type: "website",
      siteName: site.name[lang],
      title,
      description,
      locale: ogLocale[lang],
      alternateLocale: ogLocale[lang === "el" ? "en" : "el"],
      url: href(lang, route),
      images: [{ url: `/og/og-${lang}.jpg`, width: 1200, height: 630, alt: site.name[lang] }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`/og/og-${lang}.jpg`] },
    formatDetection: { telephone: false },
  };
}

function jsonLd(lang: Lang) {
  const a = site.address.el;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.name[lang],
    alternateName: lang === "el" ? site.name.en : site.name.el,
    url: `${SITE_URL}${href(lang)}`,
    image: `${SITE_URL}/og/og-${lang}.jpg`,
    logo: `${SITE_URL}/brand/badge-512.png`,
    telephone: site.phone.tel,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.city,
      postalCode: a.postcode.replace(/\s/g, ""),
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
    servesCuisine: ["Greek", "Seafood", "Mediterranean"],
    hasMenu: `${SITE_URL}${href(lang, "menu")}`,
    acceptsReservations: "True",
    sameAs: [site.facebook],
  };
}

export function Shell({ lang, route = "", children }: { lang: Lang; route?: Route; children: ReactNode }) {
  const d = getDict(lang);
  return (
    <html lang={htmlLang[lang]} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }} />
      </head>
      <body>
        <a className="skip" href="#main">
          {d.ui.skip}
        </a>
        <Preloader lang={lang} />
        <Header lang={lang} route={route} />
        <Nav lang={lang} route={route} />
        <div className="page">
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </div>
        <Footer lang={lang} route={route} />
        <canvas data-fx="ribbon-trail" data-color="#b9d2c6" aria-hidden="true" className="trail" />
        <div className="grain" aria-hidden="true" />
        <MotionRoot />
      </body>
    </html>
  );
}
