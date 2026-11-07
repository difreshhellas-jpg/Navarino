import { ease, gsap, q, qa, ScrollTrigger, type Effect } from "../motion";

/**
 * smart-header · overlay-nav · language switch that keeps the current section.
 */
export const header: Effect = (ctx) => {
  const cleanups: (() => void)[] = [];
  const h = q("[data-fx='smart-header']");

  /* SMART HEADER — hides on the way down, returns on the way up, turns glassy
     once the page has moved. */
  if (h) {
    let hidden = false;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const y = self.scroll();
        h.classList.toggle("is-scrolled", y > 40);
        if (document.documentElement.classList.contains("nav-open") || h.matches(":focus-within")) return;
        const shouldHide = self.direction === 1 && y > 160;
        if (shouldHide === hidden) return;
        hidden = shouldHide;
        document.documentElement.classList.toggle("hdr-hidden", hidden);
        gsap.to(h, {
          yPercent: hidden ? -110 : 0,
          duration: ctx.reduce ? 0 : hidden ? 0.4 : 0.7,
          ease: hidden ? "power3.out" : ease.out,
          overwrite: true,
        });
      },
    });
    cleanups.push(() => st.kill());
  }

  /* OVERLAY NAV — iris opens from the burger, links rise out of masks,
     hovering a link wipes in its preview photo. aria-expanded, inert, Esc and
     focus return are all handled; the page behind is inert while it is open. */
  const nav = q<HTMLElement>("[data-fx='overlay-nav']");
  const btn = q<HTMLButtonElement>("[data-nav-toggle]");
  if (nav && btn) {
    const bg = q(".nav__bg", nav)!;
    const links = qa(".nav__link > a", nav);
    const metas = qa(".nav__meta > *", nav);
    const previews = qa(".nav__preview > *", nav);
    const behind = qa("main, footer, .hero-skip");
    const label = btn.querySelector(".sr-only");
    let open = false;
    nav.inert = true;

    const origin = () => {
      const r = btn.getBoundingClientRect();
      return `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
    };
    const tl = gsap.timeline({ paused: true, defaults: { ease: ease.inOut } });
    const build = () => {
      const d = ctx.reduce ? 0 : 1;
      tl.clear()
        .set(nav, { visibility: "visible" })
        .fromTo(bg, { clipPath: `circle(0% at ${origin()})` }, { clipPath: `circle(150% at ${origin()})`, duration: d })
        .fromTo(links, { yPercent: 120, rotate: 3 }, { yPercent: 0, rotate: 0, duration: d, ease: ease.out, stagger: 0.05 }, "-=0.55")
        .fromTo(metas, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: d * 0.6, ease: ease.out, stagger: 0.05 }, "-=0.8");
      if (previews[0]) {
        gsap.set(previews, { zIndex: 0 });
        tl.fromTo(previews[0], { clipPath: "inset(100% 0 0 0)", zIndex: 1 }, { clipPath: "inset(0% 0 0 0)", duration: d }, "-=0.9");
      }
    };
    const toggle = (force?: boolean) => {
      open = typeof force === "boolean" ? force : !open;
      btn.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? btn.dataset.closeLabel ?? "" : btn.dataset.openLabel ?? "";
      document.documentElement.classList.toggle("nav-open", open);
      behind.forEach((el) => (el.inert = open));
      if (open) {
        build();
        nav.inert = false;
        ctx.stopScroll();
        gsap.to(h, { yPercent: 0, duration: 0.3, overwrite: true });
        tl.timeScale(1).play(0);
        window.setTimeout(() => links[0]?.focus({ preventScroll: true }), ctx.reduce ? 0 : 450);
      } else {
        nav.inert = true;
        ctx.startScroll();
        tl.timeScale(1.6).reverse();
        tl.eventCallback("onReverseComplete", () => gsap.set(nav, { visibility: "hidden" }));
        btn.focus({ preventScroll: true });
      }
    };
    const onClick = () => toggle();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && open && toggle(false);
    btn.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);

    // A link to a section on this page: close first, then glide there.
    const onLink = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const url = new URL(a.href);
      const same = url.pathname === location.pathname && url.hash.length > 1;
      if (!open) return;
      if (same) {
        e.preventDefault();
        toggle(false);
        const target = document.getElementById(url.hash.slice(1));
        if (target) window.setTimeout(() => ctx.scrollTo(target), ctx.reduce ? 0 : 350);
        history.replaceState(null, "", url.hash);
      }
    };
    const navLinks = qa<HTMLAnchorElement>("a", nav);
    navLinks.forEach((a) => a.addEventListener("click", onLink));

    // Preview wipe on hover / focus (desktop shows the preview column).
    let current = 0;
    let z = 2;
    const onEnter = (e: Event) => {
      const i = parseInt((e.currentTarget as HTMLElement).dataset.preview ?? "-1", 10);
      const el = previews[i];
      if (!el || i === current) return;
      current = i;
      gsap.set(el, { zIndex: ++z });
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: ctx.reduce ? 0 : 0.9, ease: ease.inOut, overwrite: true });
      const img = el.querySelector("img");
      if (img && !ctx.reduce) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.4, ease: ease.out, overwrite: true });
    };
    links.forEach((a) => {
      a.addEventListener("pointerenter", onEnter);
      a.addEventListener("focus", onEnter);
    });

    cleanups.push(() => {
      btn.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      navLinks.forEach((a) => a.removeEventListener("click", onLink));
      links.forEach((a) => {
        a.removeEventListener("pointerenter", onEnter);
        a.removeEventListener("focus", onEnter);
      });
      tl.kill();
    });
  }

  /* SAME-PAGE ANCHORS — glide with Lenis instead of jumping. */
  const onAnchor = (e: MouseEvent) => {
    const a = (e.target as Element).closest?.("a[href*='#']") as HTMLAnchorElement | null;
    if (!a || a.closest("[data-fx='overlay-nav']")) return;
    const url = new URL(a.href);
    if (url.pathname !== location.pathname || url.hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    ctx.scrollTo(target);
    history.pushState(null, "", url.hash);
  };
  document.addEventListener("click", onAnchor);
  cleanups.push(() => document.removeEventListener("click", onAnchor));

  /* LANGUAGE SWITCH — keeps the section being read: the other language has the
     same section ids, so the link gets the current one as its hash. */
  const switches = qa<HTMLAnchorElement>("[data-lang-switch]");
  const sections = qa("main [id]").filter((s) => s.matches("section, [data-section]"));
  const currentSection = () => {
    const mid = window.innerHeight * 0.4;
    let best: string | null = null;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) best = s.id;
    }
    return best;
  };
  const onSwitch = (e: Event) => {
    const a = e.currentTarget as HTMLAnchorElement;
    const id = currentSection();
    const base = a.getAttribute("href")!.split("#")[0];
    a.setAttribute("href", id && id !== "top" ? `${base}#${id}` : base);
  };
  switches.forEach((a) => {
    a.addEventListener("pointerdown", onSwitch);
    a.addEventListener("click", onSwitch);
    a.addEventListener("keydown", onSwitch);
  });
  cleanups.push(() =>
    switches.forEach((a) => {
      a.removeEventListener("pointerdown", onSwitch);
      a.removeEventListener("click", onSwitch);
      a.removeEventListener("keydown", onSwitch);
    }),
  );

  return () => cleanups.forEach((c) => c());
};
