import { ease, Flip, gsap, MQ, q, qa, ScrollTrigger, type Effect } from "../motion";

/**
 * menu-showcase · hover-follow · menu page sticky tabs.
 */
export const menuShowcase: Effect = (ctx) => {
  const cleanups: (() => void)[] = [];

  /* MENU SHOWCASE — category tabs + image stage; the indicator glides over
     with Flip, the photo wipes in, the panel's rows re-stagger. Tabs follow
     the WAI-ARIA tabs pattern (arrow keys, roving tabindex). */
  qa("[data-fx='menu-showcase']").forEach((box) => {
    const tabs = qa<HTMLButtonElement>("[role='tab']", box);
    const stage = qa(".show__stage > *", box);
    const panels = qa("[role='tabpanel']", box);
    const indicator = q(".show__indicator", box);
    let current = -1;
    let z = 1;
    const activate = (i: number, instant = false, focus = false) => {
      if (i === current) return;
      current = i;
      tabs.forEach((t, k) => {
        t.setAttribute("aria-selected", String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      if (focus) tabs[i].focus();
      if (indicator) {
        const state = Flip.getState(indicator);
        tabs[i].appendChild(indicator);
        Flip.from(state, { duration: instant || ctx.reduce ? 0 : 0.6, ease: ease.inOut });
      }
      const img = stage[i];
      if (img) {
        gsap.set(img, { zIndex: ++z });
        if (instant || ctx.reduce) gsap.set(img, { clipPath: "inset(0% 0 0 0)" });
        else {
          gsap.fromTo(img, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1, ease: ease.inOut, overwrite: true });
          const inner = img.querySelector("img");
          if (inner) gsap.fromTo(inner, { scale: 1.3 }, { scale: 1, duration: 1.5, ease: ease.out, overwrite: true });
        }
      }
      panels.forEach((p, k) => {
        p.hidden = k !== i;
        if (k === i && !instant && !ctx.reduce)
          gsap.fromTo(p.querySelectorAll("li"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.04, ease: ease.out, overwrite: true });
      });
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(k)) return;
      e.preventDefault();
      const n = tabs.length;
      const next =
        k === "Home" ? 0 : k === "End" ? n - 1 : k === "ArrowRight" || k === "ArrowDown" ? (current + 1) % n : (current - 1 + n) % n;
      activate(next, false, true);
    };
    const handlers = tabs.map((t, i) => {
      const click = () => activate(i);
      const enter = () => !ctx.touch && activate(i);
      t.addEventListener("click", click);
      t.addEventListener("pointerenter", enter);
      t.addEventListener("keydown", onKey);
      return () => {
        t.removeEventListener("click", click);
        t.removeEventListener("pointerenter", enter);
        t.removeEventListener("keydown", onKey);
      };
    });
    activate(0, true);
    cleanups.push(() => handlers.forEach((h) => h()));
  });

  /* HOVER FOLLOW — a floating photo follows the mouse over the rows, tilting
     with velocity and wiping between dishes. Touch gets inline thumbnails. */
  const mm = gsap.matchMedia();
  qa("[data-fx='hover-follow']").forEach((list) => {
    const follow = q(".follow", list);
    const frame = q(".follow__frame", list);
    const items = qa("[data-img]", list);
    if (!follow || !frame) return;
    mm.add(MQ.pointer, () => {
      items.forEach((it) => (new Image().src = it.dataset.img!));
      gsap.set(follow, { xPercent: -50, yPercent: -50, scale: 0.6, opacity: 0 });
      const xTo = gsap.quickTo(follow, "x", { duration: 0.7, ease: "power3.out" });
      const yTo = gsap.quickTo(follow, "y", { duration: 0.7, ease: "power3.out" });
      const rTo = gsap.quickTo(follow, "rotate", { duration: 0.9, ease: "power3.out" });
      let lastX = 0;
      let lastSrc: string | null = null;
      const move = (e: PointerEvent) => {
        const r = list.getBoundingClientRect();
        const x = e.clientX - r.left;
        xTo(x);
        yTo(e.clientY - r.top);
        rTo(gsap.utils.clamp(-12, 12, (x - lastX) * 0.6));
        lastX = x;
      };
      const swap = (src: string) => {
        if (src === lastSrc) return;
        lastSrc = src;
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        frame.appendChild(img);
        gsap.fromTo(img, { clipPath: "inset(100% 0 0 0)", scale: 1.3 }, {
          clipPath: "inset(0% 0 0 0)",
          scale: 1,
          duration: 0.7,
          ease: ease.out,
          onComplete: () => {
            while (frame.children.length > 1) frame.removeChild(frame.firstChild!);
          },
        });
      };
      const enter = () => gsap.to(follow, { scale: 1, opacity: 1, duration: 0.6, ease: ease.out, overwrite: "auto" });
      const leave = () => {
        gsap.to(follow, { scale: 0.6, opacity: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        lastSrc = null;
      };
      const onItem = items.map((it) => {
        const fn = () => swap(it.dataset.img!);
        it.addEventListener("pointerenter", fn);
        return fn;
      });
      list.addEventListener("pointermove", move);
      list.addEventListener("pointerenter", enter);
      list.addEventListener("pointerleave", leave);
      return () => {
        items.forEach((it, i) => it.removeEventListener("pointerenter", onItem[i]));
        list.removeEventListener("pointermove", move);
        list.removeEventListener("pointerenter", enter);
        list.removeEventListener("pointerleave", leave);
      };
    });
  });
  cleanups.push(() => mm.revert());

  /* MENU PAGE TABS — a sticky category bar. Tapping glides to the category;
     scrolling moves the active tab (and keeps it in view in the bar). */
  const bar = q("[data-fx='menu-tabs']");
  if (bar) {
    const links = qa<HTMLAnchorElement>("a[href^='#']", bar);
    const ink = q(".mtabs__ink", bar);
    const setActive = (a: HTMLAnchorElement) => {
      links.forEach((l) => (l === a ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current")));
      if (ink) {
        const state = Flip.getState(ink);
        a.appendChild(ink);
        Flip.from(state, { duration: ctx.reduce ? 0 : 0.45, ease: ease.inOut });
      }
      const sc = q(".mtabs__scroll", bar);
      if (sc) {
        const left = a.offsetLeft - sc.clientWidth / 2 + a.clientWidth / 2;
        sc.scrollTo({ left, behavior: ctx.reduce ? "instant" : "smooth" });
      }
    };
    const triggers = links.map((a) => {
      const sec = document.getElementById(a.hash.slice(1));
      return sec
        ? ScrollTrigger.create({
            trigger: sec,
            start: "top 40%",
            end: "bottom 40%",
            onToggle: (self) => self.isActive && setActive(a),
          })
        : null;
    });
    if (links[0]) setActive(links[0]);
    cleanups.push(() => triggers.forEach((t) => t?.kill()));
  }

  return () => cleanups.forEach((c) => c());
};
