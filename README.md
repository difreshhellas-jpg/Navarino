# Ναυαρίνο · Navarino — website

Bilingual static site (Greek at `/`, English at `/en/`) for Ναυαρίνο, εστιατόριο • café,
Πατρών 108, Ξυλόκαστρο. Built 2026-10 by DIFRESH.

Next.js 15 (static export) · GSAP + ScrollTrigger + SplitText + Flip · Lenis · ogl (WebGL sea) ·
@fontsource (Noto Serif Display, Manrope, Mynerve) · Phosphor icons. No server: `/out` is plain
files for FTP.

## Commands

```bash
npm install
npm run dev            # http://localhost:3000
npm run images         # photos → public/img (AVIF + WebP), badge, icons. Only photos listed in content/photos.json
node scripts/og.mjs    # Open Graph images (needs npm run images first)
python scripts/wordmark_key.py   # the hand-lettered wordmark keyed out of logo-art/113
SITE_URL=https://the-domain.gr npm run build   # → /out (set SITE_URL once the domain is known)
python deploy.py --dry-run       # FTP upload of /out (fill .env from .env.example first)
```

`rm -rf .next` before switching between `dev` and `build` (Kyknos trap: dev on top of a build
serves a page without CSS).

## Where to change things

| What | File |
|---|---|
| Phone, address, hours, Facebook, TripAdvisor numbers | `content/site.json` |
| All Greek / English copy | `content/el.json`, `content/en.json` |
| Πιάτο ημέρας (name, note, optional price) | `content/daily.json` |
| Navarino Live nights (empty = "follow us on Facebook") | `content/events.json` (past dates hide themselves at build) |
| Menu (dishes, prices, which dish has a photo) | `content/menu.json` |
| Photo alt texts, gallery order | `content/photos.json` |
| Dish scroll hero labels / frames | `content/dish-octopus.json`, `design/scroll-hero-prompts.md` |
| Colours, fonts, why | `design/DESIGN.md`, `src/styles/tokens.css` |

Static site: after any content change, `npm run build` and upload again.

## Photos

Originals (untouched Facebook copies) in `assets/raw/navarino-facebook/<folder>/NNN.jpg`,
listed in `assets/raw/index.txt`. Never upscaled: each srcset stops at the photo's own width.
`posters/` are flyers and are never published; they were read for dish names only.
`night/122` carries a text overlay, so the Visit section uses `night/127` (same shot, clean).

## TODO — things not provided (nothing was invented)

- [ ] **Domain** → set `SITE_URL` at build time; canonical, hreflang, sitemap and OG URLs use it
      (until then they point at `https://example.com`).
- [ ] **FTP credentials** for ip.gr → `.env` (copy `.env.example`).
- [ ] **Map pin**: `content/site.json` → `geo` is APPROXIMATE (the OpenStreetMap position of
      Αριστοναυτών street). Replace with the owner's Google Maps pin. The Maps buttons search by
      address, so they work regardless.
- [ ] **Instagram**: not linked (a poster shows `navarino_restaurant`; confirm, then set
      `content/site.json` → `instagram` and add the link).
- [ ] **Email**: none shown. `content/site.json` → `email`.
- [ ] **Booking**: «Κλείστε τραπέζι» calls 27430 28887. No booking form.
- [ ] **Phone**: posters also print a mobile, 695 182 2290, and the logo card prints
      27430 28561. Only 27430 28887 is used. Confirm.
- [ ] **Hours**: 09:30–23:30 from listings; a poster says 9:00–24:00. Confirm.
- [ ] **Owners / story**: the Story section has a dashed TODO block (visible in `npm run dev`,
      hidden in production builds unless `SHOW_TODOS=1`). Supply their own words; no names were
      invented.
- [x] **Menu**: 2026-10-27 replaced with the client's printed menu (email «Navarino menu»,
      2026-10-26, photos in `assets/raw/email-2026-10-26/menu`), prices included, handwritten
      corrections applied. The old chalkboard/poster dishes are gone.
- [ ] **Menu asterisk**: dishes marked `*` keep the mark as printed; the footnote that explains it
      (usually «κατεψυγμένο») was not in the photos. Confirm, then add it to the menu page.
- [x] **Venue photos**: 2026-10-27, 10 from the email «Navarino μαγαζί» → `navarino-facebook/owner/`
      (9 in the gallery; 002 is a near-duplicate of 001, not published; 008 is the coffee photo).
- [x] **Dish video**: done 2026-10-02 (wan-3.0, 16:9 + 9:16). To replace it:
      `node scripts/frames.mjs <wide.mp4> <tall.mp4>`, retune `frameLabels` /
      `frameLabelsMobile` in `content/dish-octopus.json`, rebuild.
- [ ] **Navarino Live events**: add to `content/events.json`.
- [ ] **Awards / rankings**: deliberately none.

## Motion (luxury-web-animations)

Preloader (sail curtains, the logo boat crossing the line, once per session) → particle sea
(ogl, moon + moonlight path) with masked «Ναυαρίνο» → velocity marquee → colour shift per section
(night → day → mint → night → emerald) → pinned "A day by the sea" (pins on phones too) → dish
sequence with GR/EN callouts → menu showcase + hover-follow → clip reveals + parallax → text
highlight → counters → gallery lightbox → footer reveal. Desktop only: ribbon trail (mouse),
magnetic lean. Reduced motion: everything visible and still; no pins, no smooth scroll.

All effects live in `src/components/fx/effects/*.ts` and run once per page from
`MotionRoot.tsx`; the markup is server-rendered HTML.

Two traps found here:
- Never `scrollTrigger: { once: true }`. It kills the trigger inside ScrollTrigger's own refresh
  loop and GSAP throws when a reload restores the scroll position. Use
  `toggleActions: "play none none none"`.
- GSAP folds the CSS `rotate` property into its own matrix. Anything rotated in CSS and animated
  by GSAP needs a wrapper (see `.dish__rule` / `.dish__rule-ink`).
