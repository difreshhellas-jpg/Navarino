import { gsap, MQ, q, type Effect } from "../motion";

/**
 * RIBBON TRAIL — a pale-mint wake behind the mouse, like the line a boat
 * leaves on still water: smooth, tapering, fading. Mouse only by nature (a
 * finger leaves no trail to follow); idles when the trail is empty.
 */
export const ribbonTrail: Effect = () => {
  const canvas = q<HTMLCanvasElement>("[data-fx='ribbon-trail']");
  if (!canvas) return;
  const mm = gsap.matchMedia();
  mm.add(MQ.pointer, () => {
    const c = canvas.getContext("2d")!;
    const color = canvas.dataset.color || "#b9d2c6";
    const maxW = parseFloat(canvas.dataset.width || "7");
    const life = parseFloat(canvas.dataset.life || "520");
    const pts: { x: number; y: number; t: number }[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dirty = false;

    const size = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || document.documentElement.classList.contains("nav-open")) return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    };
    const tick = () => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > life) pts.shift();
      if (pts.length < 3) {
        if (dirty) {
          c.clearRect(0, 0, innerWidth, innerHeight);
          dirty = false;
        }
        return;
      }
      dirty = true;
      c.clearRect(0, 0, innerWidth, innerHeight);
      c.lineCap = "round";
      c.lineJoin = "round";
      c.strokeStyle = color;
      for (let i = 1; i < pts.length - 1; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const a = 1 - (now - p1.t) / life;
        c.globalAlpha = a * a * 0.85;
        c.lineWidth = Math.max(0.5, maxW * a);
        c.beginPath();
        c.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        c.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        c.stroke();
      }
      c.globalAlpha = 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", size);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", size);
      c.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
  return () => mm.revert();
};
