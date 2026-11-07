# Navarino — design system (proposal, awaiting OK)

Concept: a beach house by day, an emerald sea by night. The page scrolls
through one day: night hero → bright morning → sunset → emerald night.

## Palette

Every value below was sampled programmatically from the venue's own photos
(dominant-colour quantisation of cropped regions, or the mean of the most
saturated / brightest pixels). The "brief" column is the starting point I was
given; the "final" column is what the build will use.

### Day

| Token | Brief | Measured (source) | Final | Notes |
|---|---|---|---|---|
| `--whitewash` | #F6F4EE | #E4E5E6 walls in shade (venue-day/094) | **#F6F4EE** | Paper ground. Kept. |
| `--mint` | #A9D9CF | #B7CDC1 / #C0D3C8 logo ground (logo-art/113); #408392 painted woodwork (venue-day/098) | **#B9D2C6** | The brief's mint is more saturated than anything in the photos. The logo's own ground is a greyer sage-mint, so the surface matches the badge. Fill only. |
| `--aegean` (floor) | #2E6DB4 | #265283 / #1E4F84 in shade (venue-day/072); #075B93 in sun (venue-day/106) | **#2E6DB4** fill, **#25578F** text | 4.82:1 on whitewash, so it passes for text 18px and up. Body-size links use the deeper #25578F (6.73:1). |
| `--gulf` | #3E9FB0 | #2F8297 / #3792AF (venue-day/121) | **#2F8297** | The brief value is only 2.81:1 on whitewash. The measured one is 4.01:1: decorative and large type only, never body text. |
| `--rattan` | #C9A273 | #B08F5F / #8A6B48 (venue-day/011 lamps) | **#B08F5F** | Hairlines and dividers only. |
| `--coral` (accent, CTA) | #C4552F | #CB5E24 lamp fringe (venue-day/011); #CF601F logo lettering "εστιατόριο • café" (logo-art/113) | **#C4552F** surface, **#B04A1E** pressed/hover | White on #C4552F is 4.48:1, so CTA labels are set at 18px/600 (large-text AA). White on #B04A1E is 5.46:1. The logo's #CF601F is reserved for the badge itself. This is the one locked accent. |
| `--fuchsia` | #B03A6E | barely present: #683755, 17 px in venue-day/049 | **#B03A6E** | Tiny accents only (one dot or underline per screen at most), as the brief says. 5.19:1 on whitewash. |

### Night

| Token | Brief | Measured (source) | Final | Notes |
|---|---|---|---|---|
| `--ink` | #08191A | #060C07 sea at night (night/014); #22312B sky (night/128) | **#08191A** | Kept. Whitewash on ink is 16.4:1. |
| `--emerald` | #0E4F47 | #0E612B / #1D4031 lit water (night/014, night/128) | **#0F4A33** | The real lights are green, not teal. Whitewash on it is 9.32:1. |
| `--sea-glow` | #1FBF8F | #2CD779 (night/014); #04C61C (night/004) | **#2CD779** | Particle sea, focus rings and the glow on night sections. 9.54:1 on ink. |
| `--moon` | #F2B35E | #FDFADD disc (night/128); #F9EBB2 disc, orange path below it (night/131) | **#F2B35E** for the moon point and highlights, **#F9EBB2** for its halo | 9.78:1 on ink. |

### Rules
- The `data-bg` / `data-fg` shift only ever pairs ink ↔ whitewash and emerald ↔ whitewash, so every combination is AA.
- Body text is whitewash on night sections and ink on day sections. Coloured body text is never used.
- Contrast to be re-checked by script in QA (Kyknos `scripts/check-contrast.ts` will be ported).

## Typography

| Role | Face | Weights | Greek |
|---|---|---|---|
| Headings | Noto Serif Display | 300, 300 italic (400 for small headings) | greek + greek-ext ✔ |
| Body, menu, UI | Manrope | 400, 500, 600 | greek ✔ |
| Handwritten notes | Mynerve | 400 only | greek ✔ |

Subsets were checked against the Fontsource API on 2026-10-01. Fonts are self-hosted via `@fontsource`, loading only the latin + greek subsets.

Mynerve is used ONLY for the «Πιάτο ημέρας» card and small photo captions. Body text is at least 16px on phones. Τόνοι are checked visually on the first render, especially Noto Serif Display Light at large sizes and Manrope caps (caps drop the τόνος in Greek: «ΚΛΕΙΣΤΕ ΤΡΑΠΕΖΙ», not «ΚΛΕΊΣΤΕ»; I'll use `text-transform` only where the font's locl feature handles it, otherwise sentence case).

## Texture
- Paper grain: one tiled 256px noise PNG at about 4% opacity, multiply-blended on day sections and screen-blended on night sections.
- Watercolour wash edges: 2–3 SVG/PNG mask edges cut from the logo's own wash texture (logo-art/113 ground), used as `mask-image` on section boundaries. Nothing redrawn; no anchors, no rope, no ship wheels (the posters use those, and the site deliberately does not).

## Logo
- logo-art/113 (1125×1655) is sharper than 115 (791×1204) and is used for the badge.
- The card prints the address and phones under the boat, so the round badge crops to the boat + girl + seagull + wordmark only. The image is not redrawn or retouched.
- Favicon: the boat alone (the wordmark is illegible at 32px).

## Photo audit

All photos are Facebook copies. **Most of the night set is small** (night/128 and 127 are 720×960, 131 is 601×857, 124 is 805×960, 129 is 960×720), so srcset tops out at each file's own width and nothing is upscaled.

Consequence for the hero: night/128 cannot fill a 1440×900 desktop hero sharply. On desktop the particle sea is the full-bleed hero and 128 sits as a framed portrait; on phones (390 wide) 128 is sharp enough to be full-bleed. The reduced-motion / no-WebGL fallback uses the same framed layout.

### Filename note
Files are zero-padded (`food/027.jpg`) and live in `assets/<folder>/`, not `assets/raw/navarino-facebook/<folder>/`. All 42 files named in the brief exist.

### Gallery picks (24, not used elsewhere)
venue-day 003, 024, 028, 032, 046, 047, 056, 057, 065, 070, 073, 075, 077, 079, 085, 090, 094, 103, 108, 110 · night 031, 055, 083, 100

### Skipped and why
- venue-day/069: a laptop screen in the foreground.
- venue-day/111, 116: near-duplicates of 110, 114.
- night/015, 127: duplicates of 014, 122.
- night/084, 123 and venue-day/017: guests' faces are the subject.
- venue-day 033, 034, 035, 036, 041–044, 060, 105 and night 019, 038, 080: 960px or under, and a better copy of the same view exists.
- posters/*: flyers. Read for menu text only.
- people/* except 022.

### Photos with recognisable guests already in the brief's placement
night/004 (diners on the terrace) and venue-day/011 (diners inside). These are fine for a venue's own site, but listed here in case you'd rather swap them.

## Facts found in the client's own material that differ from the brief
- **Phone:** the posters use 27430 28887 (the brief's number) and a mobile, **695 182 2290**. The logo card prints **27430 28561** + 6951822290.
- **Hours:** brief says 09:30–23:30 (from listings). Poster 101 says «Ωράριο 9:00–24:00»; poster 076 says «από τις 9:00 το πρωί έως αργά το βράδυ».
- **Address:** their own material writes «Πατρών 108, Παραλία Καμαρίου, Ξυλόκαστρο» (sometimes «ΠΕΟ Πατρών 108»).
- **Instagram:** poster 040 shows `navarino_restaurant`.
- **Pastitsio** (the daily-dish seed) appears on poster 119 as «Παραδοσιακό Παστίτσιο», Πιάτο Ημέρας Σαββάτου.
