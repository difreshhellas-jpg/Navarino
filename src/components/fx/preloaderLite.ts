/**
 * PRELOADER — column curtains like sails; the logo's paper boat crosses the
 * progress line. Progress is real: fonts plus the hero's priority images.
 *
 * Written with the Web Animations API, not GSAP, on purpose: it runs before
 * anything else, and keeping GSAP out of the first bundle is what lets the
 * hero paint early (Lighthouse LCP). The motion engine loads behind it.
 *
 * It is in the markup from the first byte; the inline script in <head> marks
 * it data-intro="skip" before first paint for anyone who has seen it this
 * session or prefers reduced motion (the Kyknos lesson).
 */
const SEEN = "navarino.intro";
const MAX_MS = 3000;
const MIN_MS = 700;
const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const IN_OUT = "cubic-bezier(0.76, 0, 0.24, 1)";

export function preloaderLite(opts: { reduce: boolean; finishIntro: () => void }): () => void {
  const el = document.querySelector<HTMLElement>("[data-fx='preloader']");
  const root = document.documentElement;
  if (!el || root.dataset.intro === "skip" || opts.reduce) {
    el?.remove();
    opts.finishIntro();
    return () => {};
  }
  try {
    sessionStorage.setItem(SEEN, "1");
  } catch {
    /* private mode: it simply plays again next time */
  }
  root.style.overflow = "hidden";

  const fill = el.querySelector<HTMLElement>(".preloader__fill")!;
  const boat = el.querySelector<HTMLElement>(".preloader__boat")!;
  const line = el.querySelector<HTMLElement>(".preloader__line")!;
  const word = el.querySelector<HTMLElement>(".preloader__word");
  const sails = Array.from(el.querySelectorAll<HTMLElement>(".preloader__sail"));
  const t0 = performance.now();

  // Progress moves by CSS transition (compositor-only: transform).
  for (const n of [fill, boat]) n.style.transition = `transform 0.6s ${OUT}`;
  const set = (p: number) => {
    fill.style.transform = `scaleX(${p})`;
    boat.style.transform = `translateX(${p * line.clientWidth}px)`;
    el.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  };
  // The boat rides a gentle swell while it waits.
  const bob = boat.animate(
    [{ rotate: "0deg", translate: "0 0" }, { rotate: "4deg", translate: "0 -3px" }],
    { duration: 1100, easing: "ease-in-out", direction: "alternate", iterations: Infinity },
  );

  const waits: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()];
  document.querySelectorAll<HTMLImageElement>("img[fetchpriority='high']").forEach((img) => {
    if (!img.complete)
      waits.push(new Promise((r) => {
        img.addEventListener("load", r, { once: true });
        img.addEventListener("error", r, { once: true });
      }));
  });
  let done = 0;
  waits.forEach((w) => w.then(() => set(Math.min(0.92, (++done / waits.length) * 0.92))));

  let exited = false;
  let timers: number[] = [];
  const exit = () => {
    if (exited) return;
    exited = true;
    const wait = Math.max(0, MIN_MS - (performance.now() - t0));
    timers.push(window.setTimeout(() => {
      set(1);
      const lift = [{ transform: "none", opacity: 1 }, { transform: "translateY(-60%)", opacity: 0 }];
      [line, boat.parentElement === line ? null : boat, word].filter(Boolean).forEach((n, i) =>
        n!.animate(lift, { duration: 450, delay: 350 + i * 40, easing: IN_OUT, fill: "forwards" }),
      );
      const mid = (sails.length - 1) / 2;
      let last: Animation | null = null;
      sails.forEach((s, i) => {
        last = s.animate([{ transform: "none" }, { transform: "translateY(-101%)" }], {
          duration: 950,
          delay: 600 + Math.abs(i - mid) * 60,
          easing: IN_OUT,
          fill: "forwards",
        });
      });
      // The hero starts under the lifting sails, not after them.
      timers.push(window.setTimeout(opts.finishIntro, 850));
      (last as Animation | null)?.finished.then(() => {
        bob.cancel();
        el.remove();
        root.style.overflow = "";
      });
    }, wait));
  };
  Promise.all(waits).then(exit);
  timers.push(window.setTimeout(exit, MAX_MS));

  return () => {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
    bob.cancel();
  };
}
