/**
 * The motion engine: Lenis + GSAP + every effect except the preloader.
 * Loaded by MotionRoot with a dynamic import, so none of it is in the first
 * bundle and the hero paints before any of it runs (Lighthouse LCP / TBT).
 */
import Lenis from "lenis";
import { gsap, ScrollTrigger, yieldToMain, type Ctx, type Cleanup, type Effect } from "./motion";
import { colorShift } from "./effects/colorShift";
import { reveals } from "./effects/reveals";
import { header } from "./effects/header";
import { buttons } from "./effects/buttons";
import { marquee } from "./effects/marquee";
import { horizontal } from "./effects/horizontal";
import { dishSequence } from "./effects/dishSequence";
import { ribbonTrail } from "./effects/ribbonTrail";
import { menuShowcase } from "./effects/menuShowcase";
import { gallery } from "./effects/gallery";
import { particleSea } from "./effects/particleSea";

/** Order matters: pins are created top to bottom, so ScrollTrigger measures
    each one after the pins above it; the colour shift goes last. */
const EFFECTS: Effect[] = [
  header,
  buttons,
  reveals,
  marquee,
  horizontal,
  dishSequence,
  menuShowcase,
  gallery,
  colorShift,
  ribbonTrail,
  // Last: compiling shaders is the single most expensive step; everything
  // else is ready by then. The hero shows its still sea until it fades in.
  particleSea,
];

export function startEngine(opts: { reduce: boolean; touch: boolean; intro: Promise<void>; finishIntro: () => void }): Cleanup {
  const { reduce, touch, intro } = opts;
  const root = document.documentElement;
  // From here on, reveal targets may start hidden (see base.css).
  root.classList.add("fx-ready");
  // Dev only: inspect triggers from the console / automation.
  if (process.env.NODE_ENV !== "production") Object.assign(window, { ScrollTrigger, gsap });

  let lenis: Lenis | null = null;
  const tick = (t: number) => lenis?.raf(t * 1000);
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // Lenis scrolls by script, which overflow:hidden does not stop: hold it
    // while the preloader is still up.
    if (document.querySelector("[data-fx='preloader']")) {
      lenis.stop();
      intro.then(() => lenis?.start());
    }
  }

  const ctx: Ctx = {
    gsap,
    lenis,
    reduce,
    touch,
    intro,
    finishIntro: opts.finishIntro,
    stopScroll: () => (lenis ? lenis.stop() : (root.style.overflow = "hidden")),
    startScroll: () => (lenis ? lenis.start() : (root.style.overflow = "")),
    refresh: () => ScrollTrigger.refresh(),
    scrollTo: (target, o) => {
      const immediate = o?.immediate || reduce;
      // Lenis ignores CSS scroll-margin; honour it so sticky bars never
      // cover the heading we scrolled to.
      const margin = typeof target === "number" ? 0 : parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      if (lenis) {
        lenis.scrollTo(target as HTMLElement | number, { immediate, duration: 1.4, offset: -margin });
        return;
      }
      const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY - margin;
      // "instant", not "auto": auto means "use the CSS value" (Kyknos trap).
      window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
    },
  };

  // Each effect runs in its own task with the main thread handed back in
  // between: no single long task at start-up, and the page stays responsive
  // while the motion assembles.
  const cleanups: Cleanup[] = [];
  let stopped = false;
  (async () => {
    for (const fx of EFFECTS) {
      if (stopped) return;
      try {
        const c = await fx(ctx);
        if (c) {
          if (stopped) c();
          else cleanups.push(c);
        }
      } catch (err) {
        console.error(`[motion] ${fx.name} failed:`, err);
      }
      await yieldToMain();
    }
    if (stopped) return;
    ScrollTrigger.refresh();
    // Arriving with a hash (the language switch keeps the section): land on
    // it once every pin above it exists and has been measured.
    if (location.hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) intro.then(() => requestAnimationFrame(() => ctx.scrollTo(target, { immediate: true })));
    }
  })();

  // The engine starts after load, so one refresh at the end of set-up is
  // enough; after that, re-measure only when the page height really changes
  // (late images, the handwriting font swapping in, content-visibility
  // sections rendering). Each refresh is a full layout pass, so debounce.
  let lastH = document.body.scrollHeight;
  let t = 0;
  const ro = new ResizeObserver(() => {
    const h = document.body.scrollHeight;
    if (Math.abs(h - lastH) < 2) return;
    lastH = h;
    window.clearTimeout(t);
    t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
  });
  ro.observe(document.body);

  return () => {
    stopped = true;
    ro.disconnect();
    window.clearTimeout(t);
    cleanups.reverse().forEach((c) => c());
    gsap.ticker.remove(tick);
    lenis?.destroy();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}
