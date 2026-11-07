"use client";

import { useEffect } from "react";
import { preloaderLite } from "./preloaderLite";

/** Mynerve, for the handwritten notes only. Registered after load: nothing
    in the first screen uses it, and it is 76 KB. Until it arrives the notes
    fall back to the body face (font-display: swap). */
function registerHandFont() {
  if (!("fonts" in document) || [...document.fonts].some((f) => f.family === "Mynerve")) return;
  const faces = [
    ["/fonts/mynerve-greek-400-normal.woff2", "U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF"],
    ["/fonts/mynerve-latin-400-normal.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"],
  ];
  for (const [url, range] of faces) {
    const f = new FontFace("Mynerve", `url(${url}) format("woff2")`, { unicodeRange: range, display: "swap" });
    document.fonts.add(f);
    f.load().catch(() => {});
  }
}

/**
 * The only client component on the site. It starts the preloader at once
 * (no libraries) and then loads the motion engine (GSAP, Lenis, ogl and all
 * the effects) as a separate chunk, so the first bundle stays small and the
 * hero paints before any of the motion code has to run.
 */
export default function MotionRoot() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    root.classList.add("js");
    root.classList.toggle("reduced-motion", reduce);
    root.classList.toggle("is-touch", touch);
    // Tell the pre-paint watchdog in <head> that the engine is alive.
    (window as unknown as { __motion?: boolean }).__motion = true;

    let introResolve!: () => void;
    const intro = new Promise<void>((r) => (introResolve = r));
    const finishIntro = () => introResolve();

    const stopPreloader = preloaderLite({ reduce, finishIntro });
    let stopEngine: (() => void) | null = null;
    let cancelled = false;

    // After the page has loaded (so none of this competes with the hero):
    // the handwriting face, then the motion engine.
    const afterLoad = () => {
      if (cancelled) return;
      registerHandFont();
      import("./engine").then(({ startEngine }) => {
        if (!cancelled) stopEngine = startEngine({ reduce, touch, intro, finishIntro });
      });
    };
    // A beat after load, so the hero's paint never waits on any of it; the
    // preloader holds the screen for at least 1.1 s on a first visit anyway.
    let timer = 0;
    const onLoad = () => (timer = window.setTimeout(afterLoad, 900));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timer);
      stopPreloader();
      stopEngine?.();
    };
  }, []);

  return null;
}
