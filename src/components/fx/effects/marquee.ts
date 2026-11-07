import { gsap, qa, ScrollTrigger, type Effect } from "../motion";

/**
 * VELOCITY MARQUEE — «θάλασσα · γεύση · φιλοξενία» drifts, surges with scroll
 * speed, flips with scroll direction and skews by velocity. Driven by scroll,
 * so a thumb on a phone drives it exactly like a wheel. The markup already
 * holds two copies of the run, which makes the -50% wrap seamless.
 */
export const marquee: Effect = (ctx) => {
  if (ctx.reduce) return;
  const offs = qa("[data-fx='velocity-marquee']").map((root) => {
    const inner = root.querySelector<HTMLElement>(".marquee__inner");
    if (!inner) return () => {};
    const speed = parseFloat(root.dataset.speed ?? "2.2");
    const dir = parseFloat(root.dataset.direction ?? "1");
    let x = 0;
    let boost = 0;
    let scrollDir = 1;
    let visible = true;
    const wrap = gsap.utils.wrap(-50, 0);
    const setX = gsap.quickSetter(inner, "xPercent") as (v: number) => void;
    const skewTo = gsap.quickTo(inner, "skewX", { duration: 0.5, ease: "power3.out" });
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root);
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        const v = self.getVelocity();
        scrollDir = self.direction;
        boost = gsap.utils.clamp(0, 18, Math.abs(v) / 180);
        skewTo(gsap.utils.clamp(-7, 7, v / -350));
      },
    });
    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      x = wrap(x - (speed + boost) * dir * scrollDir * (dt / 1000));
      boost *= 0.93;
      if (boost < 0.05) skewTo(0);
      setX(x);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      io.disconnect();
      gsap.set(inner, { clearProps: "transform" });
    };
  });
  return () => offs.forEach((o) => o());
};
