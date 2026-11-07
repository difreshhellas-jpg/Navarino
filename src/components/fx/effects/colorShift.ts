import { gsap, qa, ScrollTrigger, type Effect } from "../motion";

/**
 * COLOR SHIFT (data-bg / data-fg) — the day at Navarino: the page colour
 * morphs night → morning → sunset → emerald night as sections pass the
 * middle of the screen. Each section declares data-ground; the actual colours
 * come from the CSS tokens, so there is one source of truth.
 */
export const colorShift: Effect = (ctx) => {
  const root = document.documentElement;
  // Sections in <main> only. The footer is sticky to the bottom of the
  // viewport, so ScrollTrigger measures it as "in view" from the very top of
  // the page and it would drag the colour to night. Visit, above it, is
  // already night.
  const sections = qa("main [data-ground]").filter((el) => !el.parentElement?.closest("[data-ground]"));
  if (!sections.length) return;

  const read = (el: Element) => {
    const s = getComputedStyle(el);
    return {
      bg: s.getPropertyValue("--g-bg").trim(),
      fg: s.getPropertyValue("--g-fg").trim(),
      muted: s.getPropertyValue("--g-muted").trim(),
      night: ["night", "emerald"].includes((el as HTMLElement).dataset.ground ?? ""),
    };
  };

  let active: Element | null = null;
  const go = (el: Element, instant = false) => {
    if (el === active) return;
    active = el;
    const c = read(el);
    root.classList.toggle("is-night", c.night);
    gsap.to(root, {
      "--fx-bg": c.bg,
      "--fx-fg": c.fg,
      "--fx-muted": c.muted,
      duration: instant || ctx.reduce ? 0 : 0.9,
      ease: "power2.inOut",
      overwrite: true, // the newest section always wins
    });
  };

  // A pinned section (the day strip) is wrapped in a pin-spacer that holds
  // the whole scroll distance of the pin; measure that, or the section's own
  // box ends long before the pin does and the page stays on the previous
  // colour for the whole pan.
  const box = (s: HTMLElement) => (s.parentElement?.classList.contains("pin-spacer") ? s.parentElement : s);
  const triggers = sections.map((s) =>
    ScrollTrigger.create({
      trigger: box(s),
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => self.isActive && go(s),
    }),
  );

  // Paint whatever section the page opened on, with no tween.
  const mid = window.innerHeight * 0.55;
  const first = sections.find((s) => {
    const r = box(s).getBoundingClientRect();
    return r.top <= mid && r.bottom > mid;
  });
  go(first ?? sections[0], true);

  return () => triggers.forEach((t) => t.kill());
};
