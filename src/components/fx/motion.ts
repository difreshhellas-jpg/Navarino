/**
 * The motion engine: a port of the luxury-web-animations skill's motion-core.js
 * to a bundled module. One GSAP, one set of eases, one Lenis, one intro gate.
 *
 * Effects are plain functions that scan the server-rendered DOM for their
 * markup and return a cleanup. MotionRoot runs them once per page load; every
 * internal link is a full page load (static FTP site), so there is no client
 * routing to re-initialise for.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase);

CustomEase.create("luxOut", "0.16, 1, 0.3, 1");
CustomEase.create("luxInOut", "0.76, 0, 0.24, 1");

export const ease = { out: "luxOut", inOut: "luxInOut", soft: "power3.out" } as const;
gsap.defaults({ ease: ease.out, duration: 1 });

export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  /** A real mouse. Pointer effects have nothing to follow on touch. */
  pointer: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  wide: "(min-width: 768px)",
};

export type Cleanup = () => void;

export interface Ctx {
  gsap: typeof gsap;
  lenis: Lenis | null;
  reduce: boolean;
  touch: boolean;
  /** Resolves when the preloader curtain starts lifting (or at once if none). */
  intro: Promise<void>;
  finishIntro: () => void;
  stopScroll: () => void;
  startScroll: () => void;
  refresh: () => void;
  /** Scroll to an element or y, through Lenis when it is running. */
  scrollTo: (target: Element | number, opts?: { immediate?: boolean }) => void;
}

/** An effect may be async: long ones yield to the browser part-way through. */
export type Effect = (ctx: Ctx) => Cleanup | void | Promise<Cleanup | void>;

/** Give the main thread back (input, paint) between chunks of set-up work,
    so start-up never becomes one long blocking task. */
export const yieldToMain = (): Promise<void> => {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return s?.yield ? s.yield() : new Promise((r) => setTimeout(r, 0));
};

export const q = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) =>
  r.querySelector<T>(s);
export const qa = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) =>
  Array.from(r.querySelectorAll<T>(s));
export const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

export { gsap, ScrollTrigger, SplitText, Flip };
