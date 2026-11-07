import { gsap, MQ, q, qa, type Effect } from "../motion";

/**
 * HORIZONTAL — "A day by the sea". Vertical scroll drives the strip sideways
 * through 09:30 → 13:00 → 19:30 → 21:30, photos parallax inside their frames.
 *
 * Pinned on phones too. The skill's default (a swipe rail under 768px) is the
 * fallback for reduced motion and no-JS only: the user's standing rule is that
 * the effect itself runs on a phone. Panels are sized by svh in CSS so the pin
 * never jitters with the browser chrome.
 */
export const horizontal: Effect = () => {
  const mm = gsap.matchMedia();
  qa("[data-fx='horizontal']").forEach((sec) => {
    const track = q(".hday__track", sec)!;
    const bar = q(".hday__progress > span", sec);
    mm.add(MQ.motion, () => {
      sec.classList.add("is-pinned");
      const dist = () => Math.max(0, track.scrollWidth - sec.clientWidth);
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      qa(".hday__panel", sec).forEach((panel) => {
        const img = q(".hday__media img", panel);
        if (img)
          gsap.fromTo(img, { xPercent: -8 }, {
            xPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          });
        const txt = q(".hday__text", panel);
        if (txt)
          gsap.from(txt, {
            y: 48,
            opacity: 0,
            duration: 1.1,
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 75%", toggleActions: "play none none reverse" },
          });
      });
      if (bar)
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true },
        });
      return () => {
        sec.classList.remove("is-pinned");
        gsap.set(track, { clearProps: "transform" });
      };
    });
  });
  return () => mm.revert();
};
