import { gsap, MQ, qa, type Effect } from "../motion";

/**
 * fill-button + magnetic (from the skill's cursor.js, as ported in Sip of Art).
 * The flood origin is set on touch too, so a tap floods outward from the
 * finger; the lean toward the pointer is mouse-only (a phone has no pointer
 * to lean toward).
 */
export const buttons: Effect = () => {
  const btns = qa(".btn");
  const setOrigin = (e: PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--fx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--fy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  btns.forEach((b) => {
    b.addEventListener("pointerenter", setOrigin);
    b.addEventListener("pointerleave", setOrigin);
    b.addEventListener("pointerdown", setOrigin);
  });

  const mm = gsap.matchMedia();
  mm.add(MQ.pointer, () => {
    const offs = qa("[data-magnetic]").map((el) => {
      const strength = parseFloat(el.dataset.magnetic || "0.3");
      const label = el.querySelector<HTMLElement>(".btn__label");
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      const lx = label && gsap.quickTo(label, "x", { duration: 0.6, ease: "power3.out" });
      const ly = label && gsap.quickTo(label, "y", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
        // The label leans a little further than its pill: depth.
        lx?.(dx * strength * 0.35);
        ly?.(dy * strength * 0.35);
      };
      const leave = () => {
        // Elastic only for the snap-back, as the motion language allows.
        gsap.to(label ? [el, label] : el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)", overwrite: true });
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        gsap.set(label ? [el, label] : el, { clearProps: "transform" });
      };
    });
    return () => offs.forEach((o) => o());
  });

  return () => {
    btns.forEach((b) => {
      b.removeEventListener("pointerenter", setOrigin);
      b.removeEventListener("pointerleave", setOrigin);
      b.removeEventListener("pointerdown", setOrigin);
    });
    mm.revert();
  };
};
