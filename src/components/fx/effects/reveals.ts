import { ease, gsap, MQ, qa, ScrollTrigger, SplitText, yieldToMain, type Effect } from "../motion";

/**
 * The light, page-wide reveals from the skill's hero.js + scroll.js:
 * masked-headline · clip-reveal · data-parallax · fade-up · text-highlight · counter.
 * All of them run on phones too (the user's standing rule); only the values scale.
 * Content reveals play once; spatial motion (parallax) is scrubbed.
 */
/** Content reveals play once and stay. Not `once: true`: that kills the
    trigger during ScrollTrigger.refresh() and crashes GSAP when the page
    loads already scrolled (see masked-headline below). */
const PLAY_ONCE = "play none none none";

export const reveals: Effect = async (ctx) => {
  const mm = gsap.matchMedia();
  /** Yield every few elements: SplitText measuring is the expensive part. */
  let n = 0;
  const breathe = async () => {
    if (++n % 2 === 0) await yieldToMain();
  };

  /* MASKED HEADLINE — lines/words rise out of masks.
     data-split="lines|words|chars", data-trigger="load|scroll", data-delay */
  const introSkipped = document.documentElement.dataset.intro === "skip";
  for (const el of qa("[data-fx='masked-headline']")) {
    await breathe();
    // A load-triggered headline with no preloader (returning visitor) is
    // already on screen as static text; animating it now would be a flash.
    if (el.dataset.trigger === "load" && introSkipped) continue;
    const type = (el.dataset.split ?? "lines") as "lines" | "words" | "chars";
    const onScroll = (el.dataset.trigger ?? "scroll") === "scroll";
    const delay = parseFloat(el.dataset.delay ?? (onScroll ? "0" : "0.15"));
    let played = false;
    mm.add(MQ.motion, () => {
      const split = SplitText.create(el, {
        type: type === "chars" ? "words, chars" : type,
        mask: type,
        autoSplit: type === "lines",
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          const tw = gsap.from(self[type], {
            yPercent: 115,
            rotate: type === "chars" ? 6 : 2,
            duration: type === "chars" ? 1 : 1.3,
            ease: ease.out,
            stagger: type === "chars" ? 0.03 : type === "words" ? 0.05 : 0.1,
            paused: true,
          });
          if (played) return tw.progress(1);
          if (onScroll) {
            ScrollTrigger.create({
              trigger: el,
              start: "top 88%",
              onEnter: (self) => {
                if (played) return;
                played = true;
                tw.delay(delay).play();
                // Never kill a trigger inside ScrollTrigger's own refresh
                // loop (once: true does): on a reload that restores the
                // scroll position it shrinks the trigger list mid-loop and
                // GSAP throws. Kill it on the next tick instead.
                gsap.delayedCall(0, () => self.kill());
              },
            });
          } else {
            ctx.intro.then(() => {
              played = true;
              tw.delay(delay).play();
            });
          }
          return tw;
        },
      });
      return () => split.revert();
    });
  }

  /* CLIP REVEAL — the frame unmasks while the photo settles from 1.3x. */
  const from: Record<string, string> = {
    up: "inset(100% 0% 0% 0%)",
    down: "inset(0% 0% 100% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  };
  for (const el of qa("[data-fx='clip-reveal']")) {
    await breathe();
    mm.add(MQ.motion, () => {
      const media = el.querySelector("img");
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", toggleActions: PLAY_ONCE } });
      tl.fromTo(el, { clipPath: from[el.dataset.dir ?? "up"] }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: ease.inOut });
      if (media) tl.fromTo(media, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: ease.out }, 0);
      return () => gsap.set(el, { clearProps: "clipPath" });
    });
  }

  /* PARALLAX — data-parallax="-20..20" (yPercent across the viewport pass).
     Sibling columns with different values give the elastic grid. */
  for (const el of qa("[data-parallax]")) {
    await breathe();
    mm.add(MQ.motion, () => {
      const v = parseFloat(el.dataset.parallax ?? "10");
      gsap.fromTo(el, { yPercent: v }, {
        yPercent: -v,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  /* FADE-UP — the workhorse; [data-stagger] staggers the children. */
  for (const el of qa("[data-fx='fade-up']")) {
    await breathe();
    // Hero with no preloader (returning visitor): already shown, static.
    if (introSkipped && el.closest(".hero")) continue;
    mm.add(MQ.motion, () => {
      const kids = el.hasAttribute("data-stagger") ? Array.from(el.children) : [el];
      gsap.fromTo(kids, { opacity: 0, y: 32 }, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: ease.out,
        stagger: parseFloat(el.dataset.stagger || "0.08"),
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: PLAY_ONCE },
      });
    });
  }

  /* TEXT HIGHLIGHT — the paragraph reads itself; <mark> gets a sweep. */
  for (const el of qa("[data-fx='text-highlight']")) {
    await breathe();
    mm.add(MQ.motion, () => {
      // aria "hidden": SplitText's default puts aria-label on the element,
      // which a <p> may not carry. This keeps an sr-only copy instead.
      const split = SplitText.create(el, { type: "words", aria: "hidden" });
      gsap.fromTo(split.words, { opacity: 0.16 }, {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
      });
      el.querySelectorAll("mark").forEach((m) =>
        gsap.fromTo(m, { backgroundSize: "0% 0.14em" }, {
          backgroundSize: "100% 0.14em",
          ease: "none",
          scrollTrigger: { trigger: m, start: "top 72%", end: "top 48%", scrub: true },
        }),
      );
      return () => split.revert();
    });
  }

  /* COUNTER — locale-aware roll-up, once. data-to, data-decimals. */
  const lang = document.documentElement.lang || undefined;
  qa("[data-fx='counter']").forEach((el) => {
    const to = parseFloat(el.dataset.to ?? "0");
    const dec = parseInt(el.dataset.decimals ?? "0", 10);
    const fmt = new Intl.NumberFormat(lang, { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const o = { v: 0 };
    const paint = () => (el.textContent = fmt.format(o.v));
    if (ctx.reduce) return;
    paint();
    gsap.to(o, {
      v: to,
      duration: 2.2,
      ease: "power3.out",
      onUpdate: paint,
      scrollTrigger: { trigger: el, start: "top 90%", toggleActions: PLAY_ONCE },
    });
  });

  /* FOOTER REVEAL — the footer (normal flow, see chrome.css) has its
     content drifts up into place as the page lifts off it. */
  const ftr = document.querySelector<HTMLElement>("[data-fx='footer-reveal'] .ftr__inner");
  if (ftr)
    mm.add(MQ.motion, () => {
      gsap.fromTo(ftr, { yPercent: -18, opacity: 0.5 }, {
        yPercent: 0,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: ftr.parentElement, start: "top bottom", end: "bottom bottom", scrub: true },
      });
    });

  return () => mm.revert();
};
